FROM node:latest

WORKDIR /app

# Enable Corepack and use correct Yarn version
RUN corepack enable && \
    corepack prepare yarn@4.0.2 --activate

# Copy workspace files
COPY package.json ./
COPY frontend/package.json ./frontend/

# Copy .npmrc with network settings
COPY frontend/.npmrc ./

# Install dependencies
RUN yarn install

# Copy the frontend code
COPY frontend ./frontend/

WORKDIR /app/frontend
EXPOSE 3000

# Use yarn commands
CMD ["yarn", "local_start"]