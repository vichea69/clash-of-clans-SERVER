# Use an official Node.js runtime as the base image for building dependencies
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Use a lightweight base image for the final container
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app /usr/src/app

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Define the command to run the application
CMD ["node", "server.js"]