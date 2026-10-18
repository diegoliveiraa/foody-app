FROM node:26-alpine3.24 AS build
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json nginx.conf.template ./
COPY public public
COPY src src
ARG VITE_API_URL
RUN : "${VITE_API_URL:?pass --build-arg VITE_API_URL}" && npm run build
RUN api_origin="$(printf '%s' "$VITE_API_URL" | sed -nE 's|^(https?://[A-Za-z0-9.-]+(:[0-9]+)?)([/?#].*)?$|\1|p')" \
    && if [ -z "$api_origin" ]; then echo "VITE_API_URL must be an http(s) URL" >&2; exit 1; fi \
    && sed "s|__API_ORIGIN__|${api_origin}|" nginx.conf.template > nginx.conf

FROM nginxinc/nginx-unprivileged:stable-alpine3.24-slim
COPY --from=build /workspace/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 8080
