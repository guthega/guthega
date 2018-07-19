FROM node:10.3-alpine

ENV NODE_ENV production \
  LOG_LEVEL info

WORKDIR /opt/app/guthega

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ADD https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 /usr/local/bin/jq
RUN chmod +x /usr/local/bin/jq

ENTRYPOINT [ "/opt/docker-entrypoint.sh" ]
CMD []

ADD package.json dist /opt/app/guthega/
RUN npm install --production

ADD container/opt/docker-entrypoint.sh /opt
