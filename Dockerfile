# FROM node:18 as builder
FROM node:22

WORKDIR /
COPY . .
RUN npm install

EXPOSE 80
ENTRYPOINT npm start