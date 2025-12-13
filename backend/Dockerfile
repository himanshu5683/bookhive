# Use Node.js 20.8.0 as specified in our requirements
FROM node:20.8.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove old deprecated production flag and install only production dependencies
RUN npm config delete production
RUN npm ci --omit=dev --no-production

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]