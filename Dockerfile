FROM node:8-jessie

WORKDIR /app

ADD yarn.lock package.json ./
RUN yarn

ADD ./ ./

RUN yarn tsc && yarn build:web && yarn --production

EXPOSE 3000

CMD ["node", "."]