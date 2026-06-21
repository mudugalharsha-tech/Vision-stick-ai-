FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Final image
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p logs

ENV NODE_ENV=production
EXPOSE 5000
USER node
CMD ["node", "server.js"]
