FROM node:15.4.0

LABEL org.opencontainers.image.source=https://github.com/olnor18/cloud-computing
LABEL org.opencontainers.image.description="Image for the Backend component of the SEM9 Cloud project"

COPY . /app
WORKDIR /app

EXPOSE 3000

RUN npm install

CMD ["npm", "start"]
