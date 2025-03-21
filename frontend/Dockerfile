# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy frontend code
COPY . .

# Build frontend
RUN npm run build

# Install 'serve' to serve the React app
RUN npm install -g serve

# Expose port 3000 for React
EXPOSE 8080

# Serve the frontend
CMD ["npx","serve", "-s", "build", "-l", "8080"]
