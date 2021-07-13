FROM node:14-alpine

WORKDIR /usr

COPY package.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm install

COPY src ./src

RUN npm run build

CMD ["node","/usr/dist/server.js"]