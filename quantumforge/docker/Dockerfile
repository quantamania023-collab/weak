FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* /app/
RUN npm install --production
COPY server /app/server
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "server/server.js"]