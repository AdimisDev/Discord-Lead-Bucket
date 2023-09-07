# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the node_modules directory from your local machine to the container
#COPY node_modules/ ./node_modules/

# Copy all app files to the container
COPY . .

# Copy .env file into the container
COPY .env .env

# Expose the port the app runs on
EXPOSE 8020

# Start the app
CMD ["node", "index.js"]