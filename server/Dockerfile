# Use a small, up-to-date Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copy source
COPY . .

# Expose the default port (your app uses process.env.PORT or 5000)
EXPOSE 5000

# Use a non-root user (optional security)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the app
CMD ["node", "src/app.js"]
