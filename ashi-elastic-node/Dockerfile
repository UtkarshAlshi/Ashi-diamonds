# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the .env file into the image (it will be created by the GitHub Actions pipeline)
COPY .env .env

# Debug: Check if the .env file has been copied correctly
RUN cat .env

# Bundle your app source
COPY . .

# Expose port 8090
EXPOSE 8090

# Define the command to run your application
CMD ["npm", "start"]
