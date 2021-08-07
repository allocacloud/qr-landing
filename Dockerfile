FROM keymetrics/pm2:14-alpine AS build

WORKDIR /build

COPY package.json /build/package.json
COPY controllers /build/controllers
COPY lib /build/lib/
COPY routes /build/routes/
COPY sass /build/sass/
COPY scripts /build/scripts/
COPY static /build/static/
COPY views /build/views/
COPY app.js config-docker.js server.js gulpfile.js /build/
RUN mv /build/config-docker.js /build/config.js

RUN set -eux \
    && apk add --no-cache \
        git \
    && npm install \
    && npm cache clean --force

RUN ./node_modules/gulp/bin/gulp.js deploy

FROM keymetrics/pm2:14-alpine

ENV NODE_ENV="production"
ENV APPPORT="8080"
ENV APPHOST="0.0.0.0"

RUN mkdir -p /app
RUN mkdir -p /app/host-static
WORKDIR /app

COPY --from=build /build/package.json /app/package.json
COPY --from=build /build/controllers /app/controllers
COPY --from=build /build/lib /app/lib/
COPY --from=build /build/routes /app/routes/
COPY --from=build /build/sass /app/sass/
COPY --from=build /build/scripts /app/scripts/
COPY --from=build /build/static /app/static/
COPY --from=build /build/views /app/views/
COPY --from=build /build/app.js /build/config.js /build/server.js /build/gulpfile.js /app/

RUN set -eux \
    && apk add --no-cache \
        git \
    && npm install \
    && npm cache clean --force

EXPOSE 8080

CMD cp -r /app/static/* /app/host-static/ ; pm2-runtime server.js --name SITE
