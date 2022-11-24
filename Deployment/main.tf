terraform {
  required_version = ">= 0.14"

  required_providers {
    google = ">= 3.3"
  }
}

provider "google" {
  project = "cloudcoursesdu"
  region  = "eu-west1"
}

# Enables the Cloud Run API
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"
  disable_on_destroy = true
}

# Create the Cloud Run backend service
resource "google_cloud_run_service" "run_service" {
  name = "backend"

  template {
    spec {
      containers {
        image = "gcr.io/google-samples/hello-app:1.0"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.run_api]
}