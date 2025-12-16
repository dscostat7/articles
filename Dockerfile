FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start script that runs migrations, seeds, and starts the app
CMD ["sh", "-c", "npm run migration:run && npm run seed:run && npm run start:prod"]
