terraform {
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = ">= 5.7.0"
    }
  }
}

provider "keycloak" {
  client_id = var.keycloak_client_id
  username  = var.keycloak_username
  password  = var.keycloak_password
  url       = var.keycloak_url
}

resource "keycloak_realm" "realm" {
  realm             = var.realm_name
  enabled           = true
  display_name      = var.realm_display_name
  display_name_html = "<b>${var.realm_display_name}</b>"

  login_theme = "keycloak"

  registration_allowed     = true
  remember_me              = false
  login_with_email_allowed = true
  ssl_required         = "external"

  default_signature_algorithm = "RS256"
  access_token_lifespan = "1h"
  access_code_lifespan   = "10m"
}

resource "keycloak_realm_user_profile" "user_profile" {
  realm_id = keycloak_realm.realm.id

  attribute {
    name = "username"
    display_name = "$${username}"
    permissions {
      view = [ "admin", "user" ]
      edit = [ "admin", "user" ]
    }
  }

  attribute {
    name = "email"
    display_name = "$${email}"
    required_for_roles = ["user"]
    permissions {
      view = [ "admin", "user" ]
      edit = [ "admin", "user" ]
    }

    validator {
      name = "email"
    }
  }

  attribute {
    name = "user_role"
    display_name = "I am a "
    required_for_roles = ["user"]
    multi_valued = false
    permissions {
      view = ["admin", "user"]
      edit = ["admin", "user"]
    }
    validator {
      name = "options"
      config = {
        options = jsonencode(["Customer", "Coach", "Gym Admin"])
      }
    }
    annotations = {
      "inputType"           = "select"
      "inputOptionLabels"   = jsonencode({
        "customer"  = "Customer",
        "coach"     = "Coach",
        "gym_admin" = "Gym Admin"
      })
      "inputOptionValues"   = jsonencode(["customer", "coach", "gym_admin"])
      "guiOrder"            = "10"
    }
  }
}

resource "keycloak_openid_client" "fittrack-client" {
  realm_id    = keycloak_realm.realm.id
  client_id   = "fittrack-client"
  name        = "FitTrack Client"
  enabled     = true

  access_type           = "PUBLIC"
  standard_flow_enabled = true
  valid_redirect_uris = [
    "fittrack://login/login_redirect"
  ]
  valid_post_logout_redirect_uris = [
    "fittrack://login"
  ]
  frontchannel_logout_enabled = true

  web_origins = [
    "*"
  ]

  pkce_code_challenge_method = "S256"

  use_refresh_tokens = true
}

resource "keycloak_openid_user_attribute_protocol_mapper" "user_attribute_mapper" {
  realm_id  = keycloak_realm.realm.id
  client_id = keycloak_openid_client.fittrack-client.id
  name      = "user_attribute_mapper"

  user_attribute = "user_role"
  claim_name     = "user_role"
}