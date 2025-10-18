FROM node:18-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# copy package files and install only production deps using a reproducible install
COPY package*.json ./
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm ci --only=production

# copy app files after installing deps to leverage Docker cache
COPY . .

EXPOSE 5000

# run as a non-root user for better security
USER node

CMD ["node", "server.js"]