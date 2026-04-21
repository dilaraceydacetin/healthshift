variable "resource_group_name" {
  description = "Azure Resource Group name"
  type        = string
  default     = "healthshift-rg"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "norwayeast"
}

variable "database_url" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "llm_api_key" {
  description = "Groq API key"
  type        = string
  sensitive   = true
}

variable "llm_model" {
  description = "LLM model name"
  type        = string
  default     = "llama-3.3-70b-versatile"
}

variable "llm_base_url" {
  description = "LLM base URL"
  type        = string
  default     = "https://api.groq.com/openai/v1"
}