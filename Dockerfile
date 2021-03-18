FROM node:14-alpine

WORKDIR /app

COPY package.json /app/package.json
RUN yarn

COPY ./ /app/

ARG PORT=8888
ENV PORT=${PORT}

EXPOSE ${PORT}
CMD [ "node", "index.js" ]