variable "keycloak_client_id" {
  description = "Client ID for Keycloak provider"
  type        = string
  default     = "admin-cli"
}

variable "keycloak_username" {
  description = "Username for Keycloak provider"
  type        = string
  sensitive   = true
}

variable "keycloak_password" {
  description = "Password for Keycloak provider"
  type        = string
  sensitive   = true
}

variable "keycloak_url" {
  description = "URL of the Keycloak server"
  type        = string
}

variable "realm_name" {
  description = "Name of the Keycloak realm"
  type        = string
  default     = "fittrack-test-realm"
}

variable "realm_display_name" {
  description = "Display name of the Keycloak realm"
  type        = string
  default     = "FitTrack Test Realm"
}
