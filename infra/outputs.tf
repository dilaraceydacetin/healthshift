output "energy_url" {
  description = "EnergyShift API URL"
  value       = "https://${azurerm_linux_web_app.energy.default_hostname}"
}

output "symptom_url" {
  description = "SymptomLog API URL"
  value       = "https://${azurerm_linux_web_app.symptom.default_hostname}"
}