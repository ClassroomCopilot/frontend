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

# Expose the port
EXPOSE ${PORT_FRONTEND}

# Start development server with hot reload
CMD ["npm", "run", "dev"]