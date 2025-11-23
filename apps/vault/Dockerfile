# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy workspace files
COPY tsconfig.base.json ./
COPY apps/vault/package.json ./apps/vault/

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY apps/vault ./apps/vault

# Build the application
WORKDIR /app/apps/vault
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY apps/vault/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/apps/vault/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
