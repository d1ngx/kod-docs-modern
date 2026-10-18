FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@11.25.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY modern-docs ./modern-docs
COPY _data ./_data
COPY _layouts ./_layouts
COPY _includes ./_includes
COPY start ./start
COPY setup ./setup
COPY user ./user
COPY admin ./admin
COPY guide ./guide
COPY assets ./assets
COPY favicon.ico ./
RUN pnpm build

FROM node:24-alpine AS production
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --from=build --chown=node:node /app/modern-docs/dist ./modern-docs/dist
COPY --chown=node:node modern-docs/server.mjs ./modern-docs/server.mjs
COPY --chown=node:node modern-docs/public/search.mjs ./modern-docs/public/search.mjs
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:8080/api/health',{headers:process.env.DOCS_AUTH_USER?{Authorization:'Basic '+Buffer.from(process.env.DOCS_AUTH_USER+':'+process.env.DOCS_AUTH_PASSWORD).toString('base64')}: {}}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "modern-docs/server.mjs"]
