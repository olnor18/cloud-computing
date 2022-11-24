FROM node:current-alpine as develop-stage

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY src src
COPY public public
COPY tsconfig.json .

FROM develop-stage as build-stage

# build app for production with minification
RUN npm run build

FROM nginx:alpine as production-stage

LABEL org.opencontainers.image.source=https://github.com/olnor18/cloud-computing
LABEL org.opencontainers.image.description="Image for the Frontend component of the SEM9 Cloud project"


COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

