# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose the port your Express app runs on (adjust if needed)
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]