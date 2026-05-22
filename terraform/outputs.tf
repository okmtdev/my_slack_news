output "external_ip" {
  description = "External IP address of the Compute Engine instance"
  value       = google_compute_address.app.address
}

output "instance_name" {
  description = "Name of the Compute Engine instance"
  value       = google_compute_instance.app.name
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh ${var.deploy_user}@${google_compute_address.app.address}"
}
