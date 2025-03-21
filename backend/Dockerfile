# Use Node.js as the base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./


# Install dependencies
RUN npm install

# Copy the entire backend code to the container
COPY . .

# Expose port 8080 (or the port your backend runs on)
EXPOSE 8080

# Start the backend server
CMD ["npm", "start"]
