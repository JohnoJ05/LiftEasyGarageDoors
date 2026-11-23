FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/
# The server config isn't part of the website
RUN rm -f /usr/share/nginx/html/nginx.conf
EXPOSE 80
