FROM node:11-stretch-slim


WORKDIR /web-app


COPY package.json .

RUN npm install

COPY . . 

EXPOSE 3000

CMD npm start