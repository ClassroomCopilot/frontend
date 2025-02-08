FROM node:latest as builder

# Declare build arguments
ARG VITE_SITE_URL
ARG VITE_APP_NAME
ARG VITE_SUPER_ADMIN_EMAIL
ARG VITE_DEV
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set environment variables from build args
ENV VITE_SITE_URL=${VITE_SITE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_SUPER_ADMIN_EMAIL=${VITE_SUPER_ADMIN_EMAIL}
ENV VITE_DEV=${VITE_DEV}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

WORKDIR /app

# Copy package files
COPY package*.json ./

# First generate package-lock.json if it doesn't exist, then do clean install
RUN npm install --package-lock-only && npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN echo "Starting build process..." && \
    npm run build && \
    echo "Build completed. Contents of /app:" && \
    ls -la /app && \
    echo "Contents of /app/dist:" && \
    ls -la /app/dist

# Use nginx to serve the static files
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Create the directory first
RUN mkdir -p /usr/share/nginx/html

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Debug: List contents after copying
RUN echo "Contents of /usr/share/nginx/html after copying:" && \
    ls -la /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]