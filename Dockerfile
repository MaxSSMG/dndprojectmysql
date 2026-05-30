# Build stage for frontend
FROM node:20-alpine AS build-stage

WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build Vite app
RUN npm run build

# Production stage
FROM node:20-alpine AS production-stage

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built frontend
COPY --from=build-stage /app/dist ./dist

# Copy server code (create a basic server.js if missing)
COPY server/ ./server/

# Expose port 3001 for the backend
EXPOSE 3001

# Start the server
CMD ["node", "server/server.js"]

