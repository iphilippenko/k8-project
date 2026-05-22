FROM node:20-alpine AS deps
LABEL authors="irinashevcenko"

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
RUN npm ci --workspace client

FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace client

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

