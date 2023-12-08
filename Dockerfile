FROM node:18-alpine AS builder

WORKDIR /app

COPY . /app

# Install project dependencies
RUN yarn install --frozen-lockfile && \
    yarn build

FROM node:18-alpine AS runtime

# устанавливаем переменные среды
ENV NODE_ENV=production
ENV PM2_HOME=/app/.pm2

# делаем каталог 'app' текущим рабочим каталогом
WORKDIR /app

# копируем оба 'package.json' и 'package-lock.json' (если есть)
COPY --from=builder \
     /app/package.json \
     /app/yarn.lock \
     /app/.pm2-docker.json \
     ./

RUN yarn install --frozen-lockfile --production && \
    yarn cache clean --force

COPY --from=builder /app/dist dist

RUN chown -R node:"$(id -u node)" /app

USER node

CMD ["yarn", "start-docker"]
