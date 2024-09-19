# Stage 1: Build the Vue.js application
FROM node:16-alpine AS build-stage

# Install required packages for canvas
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files from the host to the container
COPY . .

# Set environment variables
ARG VITE_API_URL
ARG VITE_APP_GOOGLE_CLIENT_ID
ARG VITE_API_STD_URL

# Build the Vue.js app with environment variables
RUN VITE_API_URL=$VITE_API_URL VITE_APP_GOOGLE_CLIENT_ID=$VITE_APP_GOOGLE_CLIENT_ID VITE_API_STD_URL=$VITE_API_STD_URL npm run build

# Stage 2: Serve the built files using Nginx
FROM nginx:stable-alpine AS production-stage

# Copy the build output to the Nginx web server directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
