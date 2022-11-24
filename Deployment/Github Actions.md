* Enable Container Registry API on the project
* Create a role based on Storage Legacy Bucket Writer ( https://dev.to/jpoehnelt/using-google-container-registry-docker-buildx-and-github-actions-d22 as per https://cloud.google.com/container-registry/docs/access-control?hl=en-GB)
* Add secrets to Github Actions
* Remember to tag images with eu.gcr.io
* buildx is borked for now