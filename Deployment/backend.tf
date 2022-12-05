# Enables the Cloud Run API

resource "google_vpc_access_connector" "connector" {
  name          = "primary-connector"
  ip_cidr_range = "10.8.0.0/28"
  network       = "default"
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
            name = "REDIS_URI"
            value = "redis://${google_redis_instance.cache.host}:6379"
        }
        env {
            name = "NODE_ENV"
            value = "production"
        }
        startup_probe {
          initial_delay_seconds = 30
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
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.connector.name
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.enabled_services, google_vpc_access_connector.connector]
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.run_service.location
  project     = google_cloud_run_service.run_service.project
  service     = google_cloud_run_service.run_service.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_compute_global_address" "backend" {
  name = "backend-lb-address"
}

resource "google_dns_record_set" "backend" {
  provider     = google
  name         = "api.${data.google_dns_managed_zone.gcp_dns.dns_name}"
  type         = "A"
  ttl          = 300
  managed_zone = data.google_dns_managed_zone.gcp_dns.name
  rrdatas      = [google_compute_global_address.backend.address]
}

resource "google_compute_region_network_endpoint_group" "cloudrun_neg" {
  provider              = google-beta
  name                  = "neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_service.run_service.name
  }
}

resource "google_compute_backend_service" "default" {
  name      = "lb-backend-service"
  protocol  = "HTTP"
  port_name = "http"
  timeout_sec = 30

  backend {
    group = google_compute_region_network_endpoint_group.cloudrun_neg.id
  }
}

resource "google_compute_url_map" "backend" {
  name            = "backend-urlmap"

  default_service = google_compute_backend_service.default.id
}

resource "google_compute_target_https_proxy" "default" {
  name   = "backend-https-proxy"

  url_map          = google_compute_url_map.backend.id
  ssl_certificates = [
    google_compute_managed_ssl_certificate.website.id
  ]
}

resource "google_compute_global_forwarding_rule" "backend" {
  name   = "backend-lb"

  target = google_compute_target_https_proxy.default.id
  port_range = "443"
  ip_address = google_compute_global_address.backend.address
}

resource "google_compute_url_map" "https_redirect_backend" {
  name            = "backend-https-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "https_redirect_backend" {
  name   = "backend-http-proxy"
  url_map          = google_compute_url_map.https_redirect_backend.id
}

resource "google_compute_global_forwarding_rule" "https_redirect_backend" {
  name   = "backend-lb-http"

  target = google_compute_target_http_proxy.https_redirect_backend.id
  port_range = "80"
  ip_address = google_compute_global_address.backend.address
}