# Use an official Node.js runtime as the base image
FROM node:alpine
WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]