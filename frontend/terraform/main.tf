# PetHome Platform Infrastructure as Code
# Terraform configuration for AWS cloud deployment

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "pethome_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "pethome-vpc"
    Environment = var.environment
    Project     = "pethome"
  }
}

# Public Subnets
resource "aws_subnet" "public_1a" {
  vpc_id                  = aws_vpc.pethome_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "pethome-public-1a"
  }
}

resource "aws_subnet" "public_1b" {
  vpc_id                  = aws_vpc.pethome_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "pethome-public-1b"
  }
}

# Private Subnets
resource "aws_subnet" "private_1a" {
  vpc_id            = aws_vpc.pethome_vpc.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "pethome-private-1a"
  }
}

resource "aws_subnet" "private_1b" {
  vpc_id            = aws_vpc.pethome_vpc.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "pethome-private-1b"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.pethome_vpc.id

  tags = {
    Name = "pethome-igw"
  }
}

# NAT Gateway
resource "aws_eip" "nat_eip" {
  domain = "vpc"

  depends_on = [aws_internet_gateway.gw]
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_1a.id

  tags = {
    Name = "pethome-nat-gateway"
  }

  depends_on = [aws_internet_gateway.gw]
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.pethome_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "pethome-public-rt"
  }
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.pethome_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "pethome-private-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_1a" {
  subnet_id      = aws_subnet.public_1a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_1b" {
  subnet_id      = aws_subnet.public_1b.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_1a" {
  subnet_id      = aws_subnet.private_1a.id
  route_table_id = aws_route_table.private_rt.id
}

resource "aws_route_table_association" "private_1b" {
  subnet_id      = aws_subnet.private_1b.id
  route_table_id = aws_route_table.private_rt.id
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name_prefix = "pethome-alb-sg-"
  vpc_id      = aws_vpc.pethome_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pethome-alb-sg"
  }
}

resource "aws_security_group" "backend_sg" {
  name_prefix = "pethome-backend-sg-"
  vpc_id      = aws_vpc.pethome_vpc.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = ["${chomp(data.http.myip.response_body)}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pethome-backend-sg"
  }
}

resource "aws_security_group" "database_sg" {
  name_prefix = "pethome-db-sg-"
  vpc_id      = aws_vpc.pethome_vpc.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_sg.id]
  }

  ingress {
    from_port = 5432
    to_port   = 5432
    protocol  = "tcp"
    security_groups = [aws_security_group.backend_sg.id]
  }

  tags = {
    Name = "pethome-database-sg"
  }
}

resource "aws_security_group" "redis_sg" {
  name_prefix = "pethome-redis-sg-"
  vpc_id      = aws_vpc.pethome_vpc.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_sg.id]
  }

  tags = {
    Name = "pethome-redis-sg"
  }
}

# Load Balancer
resource "aws_lb" "pethome_alb" {
  name               = "pethome-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1a.id, aws_subnet.public_1b.id]

  enable_deletion_protection = false

  tags = {
    Environment = var.environment
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.pethome_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.pethome_cert.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.pethome_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Target Groups
resource "aws_lb_target_group" "backend_tg" {
  name        = "pethome-backend-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.pethome_vpc.id
  target_type = "instance"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "pethome-backend-target-group"
  }
}

resource "aws_lb_target_group" "frontend_tg" {
  name        = "pethome-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.pethome_vpc.id
  target_type = "instance"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "pethome-frontend-target-group"
  }
}

# Auto Scaling Groups
resource "aws_autoscaling_group" "backend_asg" {
  name                = "pethome-backend-asg"
  max_size            = 10
  min_size            = 2
  desired_capacity    = 3
  health_check_grace_period = 300
  health_check_type   = "ELB"
  vpc_zone_identifier = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]

  launch_template {
    id      = aws_launch_template.backend_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "pethome-backend"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_group" "frontend_asg" {
  name                = "pethome-frontend-asg"
  max_size            = 5
  min_size            = 1
  desired_capacity    = 2
  health_check_grace_period = 300
  health_check_type   = "ELB"
  vpc_zone_identifier = [aws_subnet.public_1a.id, aws_subnet.public_1b.id]

  launch_template {
    id      = aws_launch_template.frontend_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "pethome-frontend"
    propagate_at_launch = true
  }
}

# Launch Templates
resource "aws_launch_template" "backend_lt" {
  name_prefix   = "pethome-backend-lt-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.medium"
  key_name      = aws_key_pair.deployer.key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = base64encode(templatefile("${path.module}/user-data-backend.sh", {
    environment = var.environment
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "pethome-backend-instance"
    }
  }
}

resource "aws_launch_template" "frontend_lt" {
  name_prefix   = "pethome-frontend-lt-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.small"
  key_name      = aws_key_pair.deployer.key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  vpc_security_group_ids = [aws_security_group.alb_sg.id]

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "pethome-frontend-instance"
    }
  }
}

# RDS MySQL Database
resource "aws_db_subnet_group" "pethome_db_subnet" {
  name       = "pethome-db-subnet"
  subnet_ids = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]

  tags = {
    Name = "pethome-db-subnet"
  }
}

resource "aws_db_instance" "pethome_database" {
  identifier             = "pethome-database"
  allocated_storage      = 100
  storage_type           = "gp3"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.medium"
  db_name                = "pethome"
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = aws_db_parameter_group.pethome_pg.name
  option_group_name      = aws_db_option_group.pethome_og.name
  db_subnet_group_name   = aws_db_subnet_group.pethome_db_subnet.name
  vpc_security_group_ids = [aws_security_group.database_sg.id]

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "pethome-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name = "pethome-database"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "pethome_cache_subnet" {
  name       = "pethome-cache-subnet"
  subnet_ids = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
}

resource "aws_elasticache_cluster" "pethome_cache" {
  cluster_id           = "pethome-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.pethome_cache_subnet.name
  security_group_ids   = [aws_security_group.redis_sg.id]

  tags = {
    Name = "pethome-cache"
  }
}

# SSL Certificate
resource "aws_acm_certificate" "pethome_cert" {
  domain_name       = "*.pethome.com"
  subject_alternative_names = ["pethome.com"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.pethome_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.pethome.zone_id
}

resource "aws_acm_certificate_validation" "pethome_cert" {
  certificate_arn         = aws_acm_certificate.pethome_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# S3 for Static Assets and Logs
resource "aws_s3_bucket" "pethome_static" {
  bucket = "pethome-static-assets-${random_string.bucket_suffix.result}"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Name = "pethome-static-assets"
  }
}

resource "aws_s3_bucket" "pethome_logs" {
  bucket = "pethome-logs-${random_string.bucket_suffix.result}"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Name = "pethome-logs"
  }
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/aws/pethome/backend"
  retention_in_days = 30

  tags = {
    Name = "pethome-backend-logs"
  }
}

resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/aws/pethome/frontend"
  retention_in_days = 30

  tags = {
    Name = "pethome-frontend-logs"
  }
}

# IAM Roles and Policies
resource "aws_iam_role" "ec2_role" {
  name = "pethome-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "pethome-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "ssm_managed" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Route 53 Hosted Zone
resource "aws_route53_zone" "pethome" {
  name = "pethome.com"

  tags = {
    Environment = var.environment
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.pethome.zone_id
  name    = "api.pethome.com"
  type    = "A"
  alias {
    name                   = aws_lb.pethome_alb.dns_name
    zone_id                = aws_lb.pethome_alb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.pethome.zone_id
  name    = "www.pethome.com"
  type    = "A"
  alias {
    name                   = aws_lb.pethome_alb.dns_name
    zone_id                = aws_lb.pethome_alb.zone_id
    evaluate_target_health = true
  }
}

# Data Sources
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

data "http" "myip" {
  url = "http://ipv4.icanhazip.com"
}

# Random String for Unique Resource Names
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Variables
variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.pethome_vpc.id
}

output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.pethome_alb.dns_name
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.pethome_database.endpoint
}

output "cache_endpoint" {
  description = "Cache endpoint"
  value       = aws_elasticache_cluster.pethome_cache.cache_nodes[0].address
}