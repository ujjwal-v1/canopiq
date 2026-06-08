#!/bin/sh
set -e
sed "s/PORT_PLACEHOLDER/${PORT:-80}/" \
  /etc/nginx/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
