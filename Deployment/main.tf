terraform {
  required_version = ">= 0.14"

  required_providers {
    google = ">= 4.44.1"
    google-beta = ">= 4.44.1"
  }
}

provider "google" {
  project = var.project
  region  = var.region
}

provider "google-beta" {
  project = var.project
  region  = var.region
}


resource "google_project_service" "enabled_services" {
  project            = var.project
  service            = each.key
  for_each           = toset(["run.googleapis.com", "vpcaccess.googleapis.com", "compute.googleapis.com", "storage.googleapis.com", "dns.googleapis.com", "redis.googleapis.com"])
  disable_on_destroy = false
}