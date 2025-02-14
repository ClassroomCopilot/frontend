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

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with clean install and frozen lockfile
RUN npm ci --prefer-offline --no-audit

# Copy the rest of the application
COPY . .

# Generate runtime config
RUN echo "window.__RUNTIME_CONFIG__ = { \
    VITE_SITE_URL: '${VITE_SITE_URL}', \
    VITE_APP_NAME: '${VITE_APP_NAME}', \
    BUILD_TIME: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")' \
};" > /app/public/config.js

# Build the application
RUN npm run build

# Use nginx to serve the static files
FROM nginx:alpine

# Install bash and other required tools
RUN apk add --no-cache bash sed

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Create necessary directories
RUN mkdir -p /usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/public/config.js /usr/share/nginx/html/

# Create a directory for custom scripts
RUN mkdir -p /docker-entrypoint.d

# Create the entrypoint script directly (avoiding heredoc issues)
RUN printf '#!/bin/sh\n\
if [ -n "$RUNTIME_CONFIG" ]; then\n\
    echo "$RUNTIME_CONFIG" > /usr/share/nginx/html/config.js\n\
fi\n\
\n\
TIMESTAMP=$(date +%%s)\n\
find /usr/share/nginx/html -type f -name "*.html" -exec sed -i "s/CACHE_BUST/$TIMESTAMP/g" {} +\n\
\n\
exec nginx -g "daemon off;"\n' > /docker-entrypoint.sh

# Make the entrypoint script executable and verify
RUN chmod +x /docker-entrypoint.sh && \
    cat /docker-entrypoint.sh && \
    ls -la /docker-entrypoint.sh

# Add cache control headers to nginx config if they don't exist
RUN if ! grep -q "Cache-Control" /etc/nginx/conf.d/default.conf; then \
    printf '\nlocation ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n\
    expires 30d;\n\
    add_header Cache-Control "public, no-transform";\n\
}\n\
location ~* \.(html|json)$ {\n\
    expires 1h;\n\
    add_header Cache-Control "public, no-cache";\n\
}\n' >> /etc/nginx/conf.d/default.conf; \
    fi

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80 for nginx
EXPOSE 80

# Use the entrypoint script
CMD ["/bin/sh", "/docker-entrypoint.sh"]