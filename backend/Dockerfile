FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install && ls -la node_modules/.bin
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
