FROM node:10 as frontend-builder

ARG BUILD_ENV=dev

WORKDIR /frontend
COPY package.json /frontend/
RUN npm install

COPY . /frontend

RUN if [ "$BUILD_ENV" = "dev" ] ; then npm run build-dev --nomaps ; else npm run build --nomaps && rm -Rf /frontend/client/dist/*.map ; fi

FROM nginx
COPY --from=frontend-builder /frontend/client/dist/*.html /usr/share/nginx/html/
COPY --from=frontend-builder /frontend/client/dist /usr/share/nginx/html/static
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Save a template copy for app*.js
RUN cd /usr/share/nginx/html/static/ && cp app.*.js app.template
COPY startup.sh /
CMD /startup.sh