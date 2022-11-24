# Enables the Cloud Run API

resource "google_compute_network" "primary_custom_vpc" {
  project = var.project
  name = "vpcnetwork"
}

resource "google_vpc_access_connector" "connector" {
  name          = "primary-connector"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.primary_custom_vpc.name
  depends_on    = [google_project_service.enabled_services]
}

resource "google_redis_instance" "cache" {
  name           = "memory-cache"
  tier           = "BASIC"
  memory_size_gb = 1
  depends_on = [google_project_service.enabled_services]
}

# Create the Cloud Run backend service
resource "google_cloud_run_service" "run_service" {
  name = "backend"
  provider = google-beta
  location = var.region
  template {
    spec {
      containers {
        image = "eu.gcr.io/${var.project}/cloud-computing-backend:latest"
        ports {
          container_port = 3000
          protocol = "TCP"
        }
        env {
            name = "DB_NAME"
            value = "emergency"
        }
        env {
            name = "MONGO_URL"
            value = var.mongoconnectionstr
        }
        env {
            name = "REDIS_URL"
            value = "redis://${google_redis_instance.cache.host}:6379"
        }
        env {
            name = "NODE_ENV"
            value = "production"
        }
        startup_probe {
          initial_delay_seconds = 0
          timeout_seconds = 1
          period_seconds = 3
          failure_threshold = 1
          tcp_socket {
            port = 3000
          }
        }
        liveness_probe {
          http_get {
            path = "/health"
          }
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"        = "5"
        "autoscaling.knative.dev/min-scale"       = "2"
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.connector.name
        "run.googleapis.com/vpc-access-egress" : "all"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.enabled_services]
}
