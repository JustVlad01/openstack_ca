FROM node:21-alpine3.18 AS build
# Define which port the app will listen on
EXPOSE 80
# Create working directory if it doesn't exist
WORKDIR /app
# Copy all files from parent directory to workdir
COPY .. .
# Install node libraries
RUN npm install
# Build the application
RUN npm run build
# Add nginx web server
FROM nginx:alpine
# Copy the built application to nginx's html directory
COPY --from=build /app/dist/car-management/browser /usr/share/nginx/html
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
