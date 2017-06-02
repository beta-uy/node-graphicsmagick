FROM mhart/alpine-node:8

RUN apk --update add graphicsmagick && rm -rf /var/cache/apk/*

RUN mkdir /app
WORKDIR /app

COPY package.json /app
RUN yarn

COPY . /app

CMD ["node", "/app/index.js"]
