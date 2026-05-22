#!/bin/sh
set -eu

envsubst '${VITE_API_BASE_URL}' < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js
exec nginx -g 'daemon off;'
