FROM node:20-alpine
LABEL authors="irinashevcenko"

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspace server

ENV NODE_ENV=production

COPY server/src ./server/src
COPY server/db ./server/db

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "server"]
