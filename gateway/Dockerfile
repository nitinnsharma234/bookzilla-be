FROM nginx:alpine

# Set working directory (optional)
WORKDIR /etc/nginx

# Copy configs
COPY default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY headerExtract.js /etc/nginx/headerExtract.js

# Copy frontend
COPY index.html /usr/share/nginx/html/index.html

# Expose port
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
