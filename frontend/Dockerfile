FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
RUN apk add --no-cache gettext
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_URL=http://localhost:8000
ENV PORT=80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
