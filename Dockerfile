FROM node:20-alpine

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (bcrypt will be compiled for Alpine)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start script that runs migrations, seeds, and starts the app
CMD ["sh", "-c", "npm run migration:run && npm run seed:run && npm run start:prod"]
