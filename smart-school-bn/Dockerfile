FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy rest of the source code
COPY . .

# Build TypeScript to dist
RUN npm run build

EXPOSE 5000

# Start the app
CMD ["npm", "start"]
