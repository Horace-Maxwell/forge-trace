FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps
COPY examples ./examples
COPY wrangler.toml ./

RUN npm install
RUN npm run build

EXPOSE 8787

CMD ["npx", "wrangler", "dev", "--ip", "0.0.0.0"]
