FROM node:18-alpine

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml ./
RUN pnpm i

COPY . .

RUN pnpm build

CMD ["node", "dist/index.js"]
