FROM node:10 as frontend-builder

WORKDIR /frontend
COPY package.json /frontend/
RUN npm install

COPY . /frontend
RUN npm run build

FROM nginx
COPY --from=frontend-builder /frontend/client/dist/*.html /usr/share/nginx/html
COPY --from=frontend-builder /frontend/client/dist /usr/share/nginx/html/static