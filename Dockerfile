FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package.json and lock file first
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Generate Prisma client inside container
RUN pnpm prisma generate

# Expose port
EXPOSE 3000

# Start app
CMD ["pnpm", "dev"]
