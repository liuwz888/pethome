#!/bin/bash
# PetHome Platform Deployment Script
# Automated deployment with health checks and rollback capabilities

set -euo pipefail

# Configuration
ENVIRONMENT=${1:-staging}
NAMESPACE="pethome-${ENVIRONMENT}"
IMAGE_TAG=${2:-latest}
KUBE_CONFIG="${HOME}/.kube/config"
BACKUP_DIR="/tmp/pethome-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    # Check helm
    if ! command -v helm &> /dev/null; then
        log_error "helm not found. Please install helm."
        exit 1
    }

    # Check docker
    if ! command -v docker &> /dev/null; then
        log_error "docker not found. Please install docker."
        exit 1
    }

    # Check AWS CLI (for EKS)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if ! command -v aws &> /dev/null; then
            log_error "aws-cli not found. Please install AWS CLI."
            exit 1
        fi
    fi

    log_info "All prerequisites satisfied."
}

setup_namespace() {
    log_info "Setting up namespace: $NAMESPACE"

    if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        kubectl create namespace "$NAMESPACE"
        log_info "Namespace $NAMESPACE created."
    else
        log_info "Namespace $NAMESPACE already exists."
    fi
}

backup_current_deployment() {
    log_info "Creating backup of current deployment..."

    mkdir -p "$BACKUP_DIR"

    # Backup ConfigMaps
    kubectl get configmaps -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/configmaps.yaml"

    # Backup Secrets (excluding sensitive ones)
    kubectl get secrets -n "$NAMESPACE" --exclude-secret=*secret*,*key*,*token* -o yaml > "$BACKUP_DIR/secrets.yaml"

    # Backup Deployments
    kubectl get deployments -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/deployments.yaml"

    # Backup Services
    kubectl get services -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/services.yaml"

    # Backup Ingress
    kubectl get ingress -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/ingress.yaml"

    # Backup StatefulSets
    kubectl get statefulsets -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/statefulsets.yaml"

    log_info "Backup created at: $BACKUP_DIR"
}

build_and_push_images() {
    log_info "Building and pushing Docker images..."

    # Login to container registry
    docker login ghcr.io -u "${GITHUB_ACTOR}" -p "${GITHUB_TOKEN}"

    # Build backend image
    cd backend
    docker build -t ghcr.io/${GITHUB_REPOSITORY}/pethome-backend:$IMAGE_TAG .
    docker push ghcr.io/${GITHUB_REPOSITORY}/pethome-backend:$IMAGE_TAG
    cd ..

    # Build frontend image
    cd frontend
    docker build -t ghcr.io/${GITHUB_REPOSITORY}/pethome-frontend:$IMAGE_TAG .
    docker push ghcr.io/${GITHUB_REPOSITORY}/pethome-frontend:$IMAGE_TAG
    cd ..

    log_info "Images built and pushed successfully."
}

update_kubernetes_resources() {
    log_info "Updating Kubernetes resources..."

    # Apply namespace
    kubectl apply -f k8s-deployment.yaml -n "$NAMESPACE"

    # Update image tags in deployments
    sed -i "s|pethome-backend:latest|ghcr.io/\${GITHUB_REPOSITORY}/pethome-backend:${IMAGE_TAG}|g" k8s-deployment.yaml
    sed -i "s|pethome-frontend:latest|ghcr.io/\${GITHUB_REPOSITORY}/pethome-frontend:${IMAGE_TAG}|g" k8s-deployment.yaml

    # Apply updated configuration
    kubectl apply -f k8s-deployment.yaml -n "$NAMESPACE"

    log_info "Kubernetes resources updated."
}

wait_for_pods_ready() {
    log_info "Waiting for pods to become ready..."

    local max_wait_time=600  # 10 minutes
    local wait_interval=30
    local elapsed=0

    while [ $elapsed -lt $max_wait_time ]; do
        local ready_count=$(kubectl get pods -n "$NAMESPACE" -l app=pethome-backend -o jsonpath='{.items[*].status.containerStatuses[?(@.ready==true)].ready}' | wc -w)
        local total_count=$(kubectl get pods -n "$NAMESPACE" -l app=pethome-backend -o jsonpath='{.items[*].metadata.name}' | wc -w)

        local frontend_ready=$(kubectl get pods -n "$NAMESPACE" -l app=pethome-frontend -o jsonpath='{.items[*].status.containerStatuses[?(@.ready==true)].ready}' | wc -w)
        local frontend_total=$(kubectl get pods -n "$NAMESPACE" -l app=pethome-frontend -o jsonpath='{.items[*].metadata.name}' | wc -w)

        if [ $ready_count -eq $total_count ] && [ $frontend_ready -eq $frontend_total ]; then
            log_info "All pods are ready!"
            return 0
        fi

        log_info "Waiting for pods... ($ready_count/$total_count backend, $frontend_ready/$frontend_total frontend)"
        sleep $wait_interval
        elapsed=$((elapsed + wait_interval))
    done

    log_error "Timeout waiting for pods to become ready."
    return 1
}

run_health_checks() {
    log_info "Running health checks..."

    local api_url=""
    local frontend_url=""

    # Get URLs based on environment
    case "$ENVIRONMENT" in
        production)
            api_url="https://api.pethome.com/actuator/health"
            frontend_url="https://www.pethome.com"
            ;;
        staging)
            api_url="https://staging-api.pethome.com/actuator/health"
            frontend_url="https://staging-www.pethome.com"
            ;;
        *)
            api_url="http://localhost:8080/actuator/health"
            frontend_url="http://localhost:3001"
            ;;
    esac

    # Test backend health
    if curl -f "$api_url" > /dev/null 2>&1; then
        log_info "✅ Backend health check passed"
    else
        log_error "❌ Backend health check failed"
        return 1
    fi

    # Test frontend accessibility
    if curl -f "$frontend_url" > /dev/null 2>&1; then
        log_info "✅ Frontend accessibility check passed"
    else
        log_error "❌ Frontend accessibility check failed"
        return 1
    fi

    # Test database connectivity
    if kubectl exec -n "$NAMESPACE" $(kubectl get pods -n "$NAMESPACE" -l app=pethome-backend -o jsonpath='{.items[0].metadata.name}') -- curl -f http://pethome-db:3306 > /dev/null 2>&1; then
        log_info "✅ Database connectivity check passed"
    else
        log_error "❌ Database connectivity check failed"
        return 1
    fi

    # Test cache connectivity
    if kubectl exec -n "$NAMESPACE" $(kubectl get pods -n "$NAMESPACE" -l app=pethome-backend -o jsonpath='{.items[0].metadata.name}') -- redis-cli -h pethome-cache ping > /dev/null 2>&1; then
        log_info "✅ Cache connectivity check passed"
    else
        log_error "❌ Cache connectivity check failed"
        return 1
    fi

    log_info "All health checks passed!"
}

rollback_deployment() {
    log_error "Deployment failed. Initiating rollback..."

    if [ -d "$BACKUP_DIR" ]; then
        log_info "Restoring from backup: $BACKUP_DIR"

        # Restore previous configuration
        kubectl apply -f "$BACKUP_DIR/deployments.yaml" -n "$NAMESPACE"
        kubectl apply -f "$BACKUP_DIR/services.yaml" -n "$NAMESPACE"
        kubectl apply -f "$BACKUP_DIR/ingress.yaml" -n "$NAMESPACE"

        log_info "Rollback completed."
    else
        log_error "No backup available for rollback."
    fi
}

cleanup_backup() {
    log_info "Cleaning up backup directory..."
    rm -rf "$BACKUP_DIR"
}

# Main deployment function
main() {
    log_info "Starting PetHome Platform deployment to $ENVIRONMENT environment"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --image-tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            --namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            --no-backup)
                NO_BACKUP=true
                shift
                ;;
            *)
                log_error "Unknown argument: $1"
                exit 1
                ;;
        esac
    done

    # Execute deployment steps
    trap 'rollback_deployment; cleanup_backup' ERR

    check_prerequisites
    setup_namespace

    if [ "$NO_BACKUP" != true ]; then
        backup_current_deployment
    fi

    build_and_push_images
    update_kubernetes_resources

    if ! wait_for_pods_ready; then
        log_error "Pod readiness check failed"
        exit 1
    fi

    if ! run_health_checks; then
        log_error "Health checks failed"
        exit 1
    fi

    cleanup_backup

    log_info "🎉 Deployment to $ENVIRONMENT environment completed successfully!"

    # Display deployment summary
    echo ""
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Environment: $ENVIRONMENT"
    echo "Image Tag: $IMAGE_TAG"
    echo "Namespace: $NAMESPACE"
    echo ""
    echo "Access URLs:"
    echo "Backend API: $api_url"
    echo "Frontend: $frontend_url"
    echo ""
    echo "Monitor the deployment with:"
    echo "kubectl get pods -n $NAMESPACE"
    echo "kubectl logs -f deployment/pethome-backend -n $NAMESPACE"
    echo "kubectl logs -f deployment/pethome-frontend -n $NAMESPACE"
}

# Execute main function
main "$@"

exit 0