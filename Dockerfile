FROM node:18-slim

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Build the application  
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]