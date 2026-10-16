FROM node:24-alpine3.24 AS build
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public public
COPY src src
ARG VITE_API_URL
RUN : "${VITE_API_URL:?pass --build-arg VITE_API_URL}" && npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine3.24-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 8080
