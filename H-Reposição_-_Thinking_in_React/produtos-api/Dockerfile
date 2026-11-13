# Dockerfile para o Backend (Node 24 + Express 5 + SQLite)
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Instala ferramentas de compilação nativas necessárias para better-sqlite3 e argon2
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads

EXPOSE 3333

CMD ["node", "dist/server.js"]

