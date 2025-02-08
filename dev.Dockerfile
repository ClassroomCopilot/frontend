FROM node:18

WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./

# Install dependencies with full dev dependencies
RUN npm install

# Add node_modules/.bin to PATH
ENV PATH /app/node_modules/.bin:$PATH

# Create a volume mount point for node_modules
VOLUME /app/node_modules

# Copy the source code
COPY . .

# Expose the port from environment variable
EXPOSE ${PORT_FRONTEND}

# Set environment variables for Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DEV
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_DEV=${VITE_DEV}

# Start development server with hot reload
ENV VITE_PORT=${PORT_FRONTEND}
CMD ["sh", "-c", "npm run dev -- --port ${PORT_FRONTEND} --host 0.0.0.0"]