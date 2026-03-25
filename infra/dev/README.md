# Infrastructure (dev)

This directory contains Terraform configuration for the development environment.

## Setup

1. **Initialize Terraform:**
   ```bash
   terraform init
   ```

2. **Apply the configuration:**
   ```bash
   terraform plan  # Review changes first
   terraform apply
   ```

## Shared Development Environment

Since this is a dev environment that should be identical across all developers:

- **`terraform.tfvars`** is committed and shared—all developers use the same dev configuration
- **State files** (`*.tfstate`, `*.tfstate.backup`) are **NOT committed** and are in `.gitignore`
- The dev Keycloak instance is expected to be running locally on all machines with the same credentials

## Important Notes

- Keep your state files locally—do not commit them
- Do not create local override files unless you have a specific development need (use `*_override.tfvars`)
- Coordinate with team members if making changes to shared resources or base configuration
- For staging/production, use remote state and proper CI/CD workflows (not implemented yet)
