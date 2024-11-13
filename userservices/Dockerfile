# Dockerfile

# Use node alpine as it's a small node image
FROM node:18-alpine

# Create the directory on the node image 
# where our Next.js app will live
RUN mkdir -p /userservices

# Set /app as the working directory
WORKDIR /userservices

# Copy package.json and package-lock.json
# to the /app working directory
COPY package*.json /userservices

# Install dependencies in /app
RUN npm install

# Copy the rest of our Next.js folder into /app
COPY . /userservices

# Ensure port 3000 is accessible to our system
EXPOSE 7001

# Run yarn dev, as we would via the command line 
CMD ["npm", "start"]