FROM node:20-alpine
WORKDIR /app
COPY server/watcherai/package*.json ./server/watcherai/
COPY server/worker/package*.json ./server/worker/
RUN cd server/watcherai && npm install
RUN cd server/worker && npm install --legacy-peer-deps
COPY server/watcherai/ ./server/watcherai/
COPY server/worker/ ./server/worker/
RUN cd server/worker && npm run build
WORKDIR /app/server/worker
CMD ["npm", "start"]
