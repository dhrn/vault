# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy workspace files
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY apps/api ./apps/api

# Build the application
WORKDIR /app/apps/api
RUN yarn build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy workspace files
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN yarn workspaces focus @org/api --production

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/nest-cli.json ./apps/api/

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/api/dist/main.js"]
