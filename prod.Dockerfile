FROM node:latest

WORKDIR /app

# Copy package files
COPY package*.json ./

# First generate package-lock.json if it doesn't exist, then do clean install
RUN npm install --package-lock-only && npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "start"]