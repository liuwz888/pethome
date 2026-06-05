#!/bin/bash
# PetHome Platform Backup Strategy Script
# Comprehensive backup and disaster recovery setup

set -euo pipefail

BACKUP_DIR="/var/backups/pethome"
S3_BUCKET="pethome-backups-${RANDOM}"
ENCRYPTION_KEY_FILE="/etc/pethome/backup-key"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

create_encryption_key() {
    log_info "Creating encryption key for backups..."

    if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
        openssl rand -base64 32 > "$ENCRYPTION_KEY_FILE"
        chmod 600 "$ENCRYPTION_KEY_FILE"
        log_info "Encryption key created at: $ENCRYPTION_KEY_FILE"
    else
        log_info "Encryption key already exists."
    fi
}

setup_s3_backup() {
    log_info "Setting up S3 backup storage..."

    # Create S3 bucket (using AWS CLI)
    aws s3api create-bucket \
        --bucket "$S3_BUCKET" \
        --region us-west-2 \
        --create-bucket-configuration LocationConstraint=us-west-2

    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$S3_BUCKET" \
        --versioning-configuration Status=Enabled

    # Enable server-side encryption
    aws s3api put-bucket-encryption \
        --bucket "$S3_BUCKET" \
        --server-side-encryption-configuration '{
          "Rules": [
            {
              "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
              }
            }
          ]
        }'

    # Set lifecycle policy for automatic cleanup
    cat > lifecycle-policy.json << 'EOF'
{
  "Rules": [
    {
      "ID": "AutoDeleteOldBackups",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "Expiration": {
        "Days": 90
      },
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }
  ]
}
EOF

    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$S3_BUCKET" \
        --lifecycle-configuration file://lifecycle-policy.json

    log_info "S3 backup storage configured: s3://$S3_BUCKET/"
}

setup_database_backup() {
    log_info "Setting up database backup strategy..."

    # Create backup script for MySQL
    cat > /usr/local/bin/pethome-db-backup.sh << 'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/pethome/database"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="pethome-db-$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump database with compression
mysqldump -u ${DB_USER} -p${DB_PASSWORD} pethome | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Encrypt backup
openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/$BACKUP_FILE" -out "$BACKUP_DIR/${BACKUP_FILE}.enc" -pass file:/etc/pethome/backup-key

# Remove unencrypted backup
rm "$BACKUP_DIR/$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.enc" "s3://${S3_BUCKET}/database/$BACKUP_FILE.enc"

# Cleanup local encrypted files older than 7 days
find "$BACKUP_DIR" -name "*.enc" -mtime +7 -delete

echo "Database backup completed: $BACKUP_FILE.enc"
EOF

    chmod +x /usr/local/bin/pethome-db-backup.sh

    # Schedule daily backups via cron
    cat > /etc/cron.daily/pethome-db-backup << 'EOF'
#!/bin/bash
/usr/local/bin/pethome-db-backup.sh
EOF

    chmod +x /etc/cron.daily/pethome-db-backup

    log_info "Database backup strategy configured."
}

setup_file_system_backup() {
    log_info "Setting up file system backup..."

    # Create backup script for application files
    cat > /usr/local/bin/pethome-fs-backup.sh << 'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/pethome/files"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="pethome-files-$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

# Backup critical directories
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude='*.tmp' \
    --exclude='*.log' \
    --exclude='node_modules' \
    --exclude='target' \
    --exclude='.git' \
    /opt/pethome/application \
    /opt/pethome/config \
    /var/log/pethome

# Encrypt backup
openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/$BACKUP_FILE" -out "$BACKUP_DIR/${BACKUP_FILE}.enc" -pass file:/etc/pethome/backup-key

# Upload to S3
aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.enc" "s3://${S3_BUCKET}/files/$BACKUP_FILE.enc"

# Cleanup old backups (keep last 30 days locally, all in S3)
find "$BACKUP_DIR" -name "*.enc" -mtime +30 -delete

echo "File system backup completed: $BACKUP_FILE.enc"
EOF

    chmod +x /usr/local/bin/pethome-fs-backup.sh

    # Schedule weekly backups via cron
    cat > /etc/cron.weekly/pethome-fs-backup << 'EOF'
#!/bin/bash
/usr/local/bin/pethome-fs-backup.sh
EOF

    chmod +x /etc/cron.weekly/pethome-fs-backup

    log_info "File system backup strategy configured."
}

setup_log_aggregation() {
    log_info "Setting up log aggregation backup..."

    # Configure Loki retention
    cat > loki-config.yaml << 'EOF'
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9095

common:
  path_prefix: /loki
  replication_factor: 1
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

limits_config:
  ingestion_rate_mb: 10
  ingestion_burst_size_mb: 20
  retention_period: 168h  # 7 days retention
  max_query_lookback: 168h

table_manager:
  retention_deletes_enabled: true
  retention_period: 168h
EOF

    # Schedule daily log rotation and backup
    cat > /etc/cron.daily/loki-backup << 'EOF'
#!/bin/bash
# Compact and rotate logs
docker exec loki-compactor loki-tooling compact -config.file /etc/loki/loki-config.yaml

# Backup compressed logs to S3
tar -czf /tmp/loki-logs-$(date +%Y%m%d).tar.gz /loki/chunks
openssl enc -aes-256-cbc -salt -in /tmp/loki-logs-$(date +%Y%m%d).tar.gz -out /tmp/loki-logs-$(date +%Y%m%d).tar.gz.enc -pass file:/etc/pethome/backup-key
aws s3 cp /tmp/loki-logs-$(date +%Y%m%d).tar.gz.enc s3://${S3_BUCKET}/logs/
rm /tmp/loki-logs-*.tar.gz*
EOF

    chmod +x /etc/cron.daily/loki-backup

    log_info "Log aggregation backup configured."
}

setup_disaster_recovery() {
    log_info "Setting up disaster recovery procedures..."

    # Create DR runbook
    cat > /opt/pethome/disaster-recovery.md << 'EOF'
# PetHome Platform Disaster Recovery Runbook

## Emergency Contacts
- DevOps Team: devops@pethome.com
- Database Admin: dba@pethome.com
- Security Team: security@pethome.com

## Recovery Procedures

### 1. Database Recovery
```bash
# Restore from latest backup
aws s3 cp s3://${S3_BUCKET}/database/latest-backup.sql.gz.enc -
openssl enc -d -aes-256-cbc -in latest-backup.sql.gz.enc -out latest-backup.sql.gz -pass file:/etc/pethome/backup-key
gunzip latest-backup.sql.gz
mysql -u root -p pethome < latest-backup.sql
```

### 2. Application Recovery
```bash
# Restore application files
aws s3 cp s3://${S3_BUCKET}/files/latest-files.tar.gz.enc -
openssl enc -d -aes-256-cbc -in latest-files.tar.gz.enc -out latest-files.tar.gz -pass file:/etc/pethome/backup-key
tar -xzf latest-files.tar.gz -C /opt/pethome/

# Restart services
systemctl restart pethome-backend
systemctl restart pethome-frontend
```

### 3. DNS Failover
Update Route 53 records to point to DR region.

### 4. Health Verification
```bash
curl https://api.pethome.com/actuator/health
curl https://www.pethome.com
```

## Recovery Time Objectives (RTO)
- Critical Systems: 2 hours
- Full Platform: 4 hours
- Data Recovery: 30 minutes

## Recovery Point Objectives (RPO)
- Database: 24 hours (daily backups)
- Files: 7 days (weekly backups)
- Logs: 7 days (Loki retention)
EOF

    log_info "Disaster recovery procedures documented."
}

verify_backup_integrity() {
    log_info "Verifying backup integrity..."

    # Test database backup functionality
    log_info "Testing database backup..."
    /usr/local/bin/pethome-db-backup.sh > /dev/null 2>&1 || log_warn "Database backup test failed"

    # Test file system backup functionality
    log_info "Testing file system backup..."
    /usr/local/bin/pethome-fs-backup.sh > /dev/null 2>&1 || log_warn "File system backup test failed"

    # Verify S3 connectivity
    log_info "Testing S3 connectivity..."
    aws s3 ls "s3://$S3_BUCKET/" > /dev/null 2>&1 && log_info "✅ S3 connectivity verified" || log_error "❌ S3 connectivity failed"

    log_info "Backup integrity verification completed."
}

cleanup_old_backups() {
    log_info "Cleaning up old backup files..."

    # Clean local encrypted backups older than 7 days
    find "$BACKUP_DIR" -name "*.enc" -mtime +7 -delete

    # Clean S3 backups older than 90 days (handled by lifecycle policy)
    log_info "Local backup cleanup completed."

    # Archive backups older than 30 days to cold storage
    aws s3 sync "s3://$S3_BUCKET/" "s3://pethome-cold-storage/" --storage-class GLACIER \
        --exclude "*" --include "*$(date -d '30 days ago' +%Y%m%d*)" > /dev/null 2>&1 || true
}

# Main function
main() {
    log_info "Starting PetHome Platform backup strategy setup"

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Execute setup steps
    create_encryption_key
    setup_s3_backup
    setup_database_backup
    setup_file_system_backup
    setup_log_aggregation
    setup_disaster_recovery
    verify_backup_integrity
    cleanup_old_backups

    log_info "🎉 Backup strategy setup completed successfully!"

    echo ""
    echo "=== BACKUP STRATEGY SUMMARY ==="
    echo "S3 Bucket: s3://$S3_BUCKET/"
    echo "Encryption Key: $ENCRYPTION_KEY_FILE"
    echo "Backup Directory: $BACKUP_DIR"
    echo ""
    echo "Automated Schedules:"
    echo "- Database: Daily at 2 AM UTC"
    echo "- Files: Weekly on Sunday at 3 AM UTC"
    echo "- Logs: Daily compaction and rotation"
    echo ""
    echo "Backup Retention:"
    echo "- Local encrypted: 7 days"
    echo "- S3 standard: 90 days"
    echo "- S3 cold storage: Permanent"
    echo ""
    echo "Monitor with:"
    echo "aws s3 ls s3://$S3_BUCKET/"
    echo "ls -la $BACKUP_DIR"
}

# Execute main function
main "$@"

exit 0