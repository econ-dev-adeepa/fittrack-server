# Infrastructure as Code

This directory contains infrastructure configurations for different environments.

## Structure

- `dev/` - Development environment (shared across all developers)

Future environments:
- `staging/` - Staging environment
- `prod/` - Production environment

## Setup

See the specific environment's README for setup instructions.

**Development:**
```bash
cd dev
terraform init
terraform plan
terraform apply
```
