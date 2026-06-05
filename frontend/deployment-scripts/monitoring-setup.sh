#!/bin/bash
# PetHome Platform Monitoring Setup Script
# Configures Prometheus, Grafana, Alertmanager, and Log Aggregation

set -euo pipefail

NAMESPACE="pethome-monitoring"
CHART_DIR="./monitoring-charts"

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
    fi

    # Check jq (for JSON processing)
    if ! command -v jq &> /dev/null; then
        log_warn "jq not found. Installing jq..."
        apt-get update && apt-get install -y jq
    fi
}

create_monitoring_namespace() {
    log_info "Creating monitoring namespace..."

    if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        kubectl create namespace "$NAMESPACE"
        log_info "Monitoring namespace created."
    else
        log_info "Monitoring namespace already exists."
    fi
}

setup_prometheus_stack() {
    log_info "Setting up Prometheus stack..."

    # Add Prometheus Helm repository
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add kube-state-metrics https://kubernetes.github.io/kube-state-metrics
    helm repo update

    # Create custom values file for PetHome
    cat > prometheus-values.yaml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alertmanager:
  enabled: true
  config:
    global:
      resolve_timeout: 5m
    route:
      receiver: 'slack-notifications'
      routes:
      - match:
          severity: critical
        receiver: 'pager-duty'
    receivers:
    - name: 'slack-notifications'
      slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#platform-alerts'
        send_resolved: true
    - name: 'pager-duty'
      pagerduty_configs:
      - routing_key: '${PAGERDUTY_KEY}'

server:
  retention: "15d"
  persistentVolume:
    size: "50Gi"

kube-state-metrics:
  enabled: true

node-exporter:
  enabled: true

prometheus-node-exporter:
  enabled: true

prometheus-pushgateway:
  enabled: false

prometheus-operator:
  enabled: true

grafana:
  enabled: true
  adminPassword: "pethome-admin"
  persistence:
    enabled: true
    size: "10Gi"
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'pethome-dashboards'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/pethome-dashboards
  dashboards:
    pethome-dashboards:
      platform-overview:
        gnetId: 11074
        revision: 1
        datasource: Prometheus
      database-performance:
        gnetId: 7362
        revision: 1
        datasource: Prometheus
      ai-service-health:
        gnetId: 13982
        revision: 1
        datasource: Prometheus
  ingress:
    enabled: true
    hosts:
    - grafana.pethome.com
    annotations:
      kubernetes.io/ingress.class: nginx
      cert-manager.io/cluster-issuer: letsencrypt-prod
    tls:
    - hosts:
      - grafana.pethome.com
      secretName: grafana-tls

alertmanager:
  alertmanagerSpec:
    storage:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
EOF

    # Install Prometheus stack
    helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
        --namespace "$NAMESPACE" \
        --values prometheus-values.yaml \
        --wait

    log_info "Prometheus stack installed successfully."
}

setup_loki_logging() {
    log_info "Setting up Loki logging..."

    # Add Grafana Helm repository for Loki
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update

    # Create Loki values configuration
    cat > loki-values.yaml << 'EOF'
loki:
  auth_enabled: false
  commonConfig:
    replication_factor: 1
  storage:
    type: 'filesystem'
  schemaConfig:
    configs:
      - from: 2020-10-24
        store: boltdb-shipper
        object_store: filesystem
        schema: v11
        index:
          prefix: index_
          period: 24h

fluent-bit:
  enabled: true
  backend:
    type: loki
    loki:
      host: loki
      port: 3100
      labels: job=pethome-logs
      label_keys: kubernetes.pod_name,kubernetes.container_name
      buffer_size: 32MB

promtail:
  enabled: false  # Use fluent-bit instead

grafana:
  additionalDataSources:
    - name: Loki
      type: loki
      url: http://loki:3100
      access: proxy
EOF

    # Install Loki stack
    helm upgrade --install loki grafana/loki-stack \
        --namespace "$NAMESPACE" \
        --values loki-values.yaml \
        --wait

    log_info "Loki logging setup completed."
}

setup_ai_metrics_exporter() {
    log_info "Setting up AI service metrics exporter..."

    # Create AI metrics exporter deployment
    cat > ai-metrics-exporter.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-metrics-exporter
  namespace: pethome-monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ai-metrics-exporter
  template:
    metadata:
      labels:
        app: ai-metrics-exporter
    spec:
      containers:
      - name: ai-exporter
        image: pethome/ai-metrics-exporter:latest
        ports:
        - containerPort: 9100
        env:
        - name: PROMETHEUS_MULTIPROC_DIR
          value: "/tmp/prometheus"
        - name: METRICS_PORT
          value: "9100"
        volumeMounts:
        - name: prometheus-storage
          mountPath: /tmp/prometheus
      volumes:
      - name: prometheus-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: ai-metrics-exporter
  namespace: pethome-monitoring
spec:
  selector:
    app: ai-metrics-exporter
  ports:
  - protocol: TCP
    port: 9100
    targetPort: 9100
EOF

    kubectl apply -f ai-metrics-exporter.yaml

    log_info "AI metrics exporter deployed."
}

configure_alert_rules() {
    log_info "Configuring alert rules..."

    # Create custom alert rules
    cat > custom-alert-rules.yaml << 'EOF'
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: pethome-custom-alerts
  namespace: pethome-monitoring
spec:
  groups:
  - name: pethome-backend
    rules:
    - alert: HighCPUUsage
      expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[2m]) * 100)) > 80
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage detected on {{ $labels.instance }}"
        description: "CPU usage is above 80% for more than 5 minutes"

    - alert: HighMemoryUsage
      expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 < 20
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High memory usage detected on {{ $labels.instance }}"
        description: "Available memory is below 20%"

    - alert: AIServiceLatency
      expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="pethome-backend"}[5m])) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "AI service experiencing high latency"
        description: "95th percentile response time is above 2 seconds"

    - alert: OrderProcessingFailure
      expr: rate(order_processing_failures_total[5m]) > 0
      for: 1m
      labels:
        severity: critical
      annotations:
        summary: "Order processing failures detected"
        description: "Orders are failing to process"

    - alert: PaymentGatewayTimeout
      expr: rate(payment_gateway_timeout_total[5m]) > 0
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "Payment gateway timeouts detected"
        description: "Payment processing is timing out"

    - alert: AIModelAccuracyDrop
      expr: ai_model_accuracy < 0.85
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "AI model accuracy has dropped"
        description: "Model accuracy is below acceptable threshold"

  - name: pethome-business
    rules:
    - alert: LowUserEngagement
      expr: rate(user_sessions_total[1h]) < rate(user_sessions_total[24h]) * 0.5
      for: 30m
      labels:
        severity: info
      annotations:
        summary: "User engagement declining"
        description: "Session rate is significantly lower than daily average"

    - alert: CartAbandonmentRate
      expr: cart_abandonment_rate > 0.7
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "High cart abandonment rate"
        description: "Cart abandonment rate is above 70%"

    - alert: ConversionRateDecline
      expr: conversion_rate < 0.02
      for: 15m
      labels:
        severity: warning
      annotations:
        summary: "Conversion rate decline"
        description: "Conversion rate has dropped below 2%"
EOF

    kubectl apply -f custom-alert-rules.yaml

    log_info "Custom alert rules configured."
}

verify_monitoring_setup() {
    log_info "Verifying monitoring setup..."

    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -n "$NAMESPACE" --timeout=300s

    # Check Prometheus components
    local prometheus_ready=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[*].status.containerStatuses[?(@.ready==true)].ready}' | wc -w)
    local prometheus_total=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[*].metadata.name}' | wc -w)

    local grafana_ready=$(kubectl get pods -n "$NAMESPACE" -l app=grafana -o jsonpath='{.items[*].status.containerStatuses[?(@.ready==true)].ready}' | wc -w)
    local grafana_total=$(kubectl get pods -n "$NAMESPACE" -l app=grafana -o jsonpath='{.items[*].metadata.name}' | wc -w)

    local loki_ready=$(kubectl get pods -n "$NAMESPACE" -l app=loki -o jsonpath='{.items[*].status.containerStatuses[?(@.ready==true)].ready}' | wc -w)
    local loki_total=$(kubectl get pods -n "$NAMESPACE" -l app=loki -o jsonpath='{.items[*].metadata.name}' | wc -w)

    if [ $prometheus_ready -eq $prometheus_total ] && \
       [ $grafana_ready -eq $grafana_total ] && \
       [ $loki_ready -eq $loki_total ]; then
        log_info "✅ All monitoring components are ready!"
    else
        log_warn "Some monitoring components may still be starting..."
    fi

    # Test Prometheus connectivity
    if kubectl exec -n "$NAMESPACE" $(kubectl get pods -n "$NAMESPACE" -l app=prometheus -o jsonpath='{.items[0].metadata.name}') -- curl -f http://localhost:9090 > /dev/null 2>&1; then
        log_info "✅ Prometheus is accessible"
    else
        log_warn "❌ Prometheus health check failed"
    fi

    # Test Grafana accessibility
    if kubectl exec -n "$NAMESPACE" $(kubectl get pods -n "$NAMESPACE" -l app=grafana -o jsonpath='{.items[0].metadata.name}') -- curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "✅ Grafana is accessible"
    else
        log_warn "❌ Grafana health check failed"
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f prometheus-values.yaml loki-values.yaml ai-metrics-exporter.yaml custom-alert-rules.yaml
}

# Main function
main() {
    log_info "Starting PetHome Platform monitoring setup"

    trap cleanup EXIT

    check_prerequisites
    create_monitoring_namespace
    setup_prometheus_stack
    setup_loki_logging
    setup_ai_metrics_exporter
    configure_alert_rules
    verify_monitoring_setup

    log_info "🎉 Monitoring setup completed successfully!"

    echo ""
    echo "=== MONITORING SETUP SUMMARY ==="
    echo "Namespace: $NAMESPACE"
    echo ""
    echo "Access URLs:"
    echo "Grafana: https://grafana.pethome.com"
    echo "Prometheus: https://prometheus.pethome.com"
    echo ""
    echo "Default credentials:"
    echo "Username: admin"
    echo "Password: pethome-admin"
    echo ""
    echo "Monitor with:"
    echo "kubectl get pods -n $NAMESPACE"
    echo "kubectl logs -f -n $NAMESPACE"
}

# Execute main function
main "$@"

exit 0