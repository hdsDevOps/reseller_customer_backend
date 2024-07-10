# Dockerfile

# Use node alpine as it's a small node image
FROM node:18-alpine

# Create the directory on the node image 
# where our Next.js app will live
RUN mkdir -p /adminservices

# Set /app as the working directory
WORKDIR /adminservices

# Install nodemon globally
RUN npm install -g nodemon

# Copy package.json and package-lock.json
# to the /app working directory
COPY package*.json /adminservices

# Install dependencies in /app
RUN npm install

# Copy the rest of our Next.js folder into /app
COPY . /adminservices

# Ensure port 3000 is accessible to our system
EXPOSE 8001

# Run yarn dev, as we would via the command line 
CMD ["nodemon", "index.js"]