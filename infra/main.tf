terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "healthshift" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_service_plan" "healthshift" {
  name                = "healthshift-plan"
  resource_group_name = azurerm_resource_group.healthshift.name
  location            = azurerm_resource_group.healthshift.location
  os_type             = "Linux"
  sku_name            = "F1"
}

resource "azurerm_linux_web_app" "energy" {
  name                = "healthshift-energy"
  resource_group_name = azurerm_resource_group.healthshift.name
  location            = azurerm_resource_group.healthshift.location
  service_plan_id     = azurerm_service_plan.healthshift.id

  site_config {
    application_stack {
      docker_image_name = "healthshift-energy:latest"
    }
  }

  app_settings = {
    DATABASE_URL = var.database_url
    LLM_API_KEY  = var.llm_api_key
    LLM_MODEL    = var.llm_model
    LLM_BASE_URL = var.llm_base_url
  }
}

resource "azurerm_linux_web_app" "symptom" {
  name                = "healthshift-symptom"
  resource_group_name = azurerm_resource_group.healthshift.name
  location            = azurerm_resource_group.healthshift.location
  service_plan_id     = azurerm_service_plan.healthshift.id

  site_config {
    application_stack {
      docker_image_name = "healthshift-symptom:latest"
    }
  }

  app_settings = {
    DATABASE_URL = var.database_url
    LLM_API_KEY  = var.llm_api_key
    LLM_MODEL    = var.llm_model
    LLM_BASE_URL = var.llm_base_url
  }
}