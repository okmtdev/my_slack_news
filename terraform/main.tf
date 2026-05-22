provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Static external IP
resource "google_compute_address" "app" {
  name   = "slack-news-ip"
  region = var.region
}

# Firewall: allow HTTP, HTTPS, SSH
resource "google_compute_firewall" "allow_web" {
  name    = "slack-news-allow-web"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["slack-news"]
}

# Startup script: install Docker, Docker Compose, Nginx
locals {
  startup_script = <<-EOF
    #!/bin/bash
    set -e

    # Update and install dependencies
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx

    # Install Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Add deploy user to docker group
    usermod -aG docker ${var.deploy_user}

    # Create app directory
    mkdir -p /app/data
    chown -R ${var.deploy_user}:${var.deploy_user} /app

    # Enable and start Docker
    systemctl enable docker
    systemctl start docker

    echo "Startup complete"
  EOF
}

# Compute Engine instance
resource "google_compute_instance" "app" {
  name         = "slack-news-app"
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["slack-news"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = var.disk_size_gb
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.app.address
    }
  }

  metadata = {
    ssh-keys       = "${var.deploy_user}:${var.ssh_public_key}"
    startup-script = local.startup_script
  }

  service_account {
    scopes = ["cloud-platform"]
  }

  lifecycle {
    ignore_changes = [metadata["startup-script"]]
  }
}
