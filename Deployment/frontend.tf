#https://github.com/kevinpz/terraform-gcp-examples/blob/master/code/static-website/cdn.tf

# Static website

# Bucket to store website
resource "google_storage_bucket" "website" {
  provider = google
  location = var.region
  name     = var.webbucketname

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

}

resource "google_storage_bucket_access_control" "public_bucket_rule" {
  bucket = google_storage_bucket.website.name
  role   = "READER"
  entity = "allUsers"
}

resource "google_storage_default_object_access_control" "public_bucket_rule" {
  bucket = google_storage_bucket.website.name
  role   = "READER"
  entity = "allUsers"
}

# Reserve an external IP
resource "google_compute_global_address" "website" {
  provider = google
  name     = "website-lb-ip"
}

# Get the managed DNS zone
data "google_dns_managed_zone" "gcp_dns" {
  provider = google
  name     = var.dnszone
}

# Add the IP to the DNS
resource "google_dns_record_set" "website" {
  provider     = google
  name         = "website.${data.google_dns_managed_zone.gcp_dns.dns_name}"
  type         = "A"
  ttl          = 300
  managed_zone = data.google_dns_managed_zone.gcp_dns.name
  rrdatas      = [google_compute_global_address.website.address]
}

# Add the bucket as a CDN backend
resource "google_compute_backend_bucket" "website" {
  provider    = google
  name        = "website-backend"
  description = "Contains files needed by the website"
  bucket_name = google_storage_bucket.website.name
  enable_cdn  = true
}

# Create HTTPS certificate
resource "google_compute_managed_ssl_certificate" "website" {
  provider = google-beta
  name     = "website-cert"
  managed {
    domains = [google_dns_record_set.website.name, google_dns_record_set.backend.name]
  }
}

# GCP URL MAP
resource "google_compute_url_map" "website" {
  provider        = google
  name            = "website-url-map"
  default_service = google_compute_backend_bucket.website.self_link
}

# GCP target proxy
resource "google_compute_target_https_proxy" "website" {
  provider         = google
  name             = "website-target-proxy"
  url_map          = google_compute_url_map.website.self_link
  ssl_certificates = [google_compute_managed_ssl_certificate.website.self_link]
}

# GCP forwarding rule
resource "google_compute_global_forwarding_rule" "frontend" {
  provider              = google
  name                  = "website-forwarding-rule"
  load_balancing_scheme = "EXTERNAL"
  ip_address            = google_compute_global_address.website.address
  ip_protocol           = "TCP"
  port_range            = "443"
  target                = google_compute_target_https_proxy.website.self_link
}


resource "google_compute_url_map" "https_redirect_website" {
  name            = "frontend-https-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "https_redirect_website" {
  name   = "frontend-http-proxy"
  url_map          = google_compute_url_map.https_redirect_website.id
}

resource "google_compute_global_forwarding_rule" "https_redirect_website" {
  name   = "frontend-lb-http"

  target = google_compute_target_http_proxy.https_redirect_website.id
  port_range = "80"
  ip_address = google_compute_global_address.website.address
}