FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY posts.json /usr/share/nginx/html/
COPY scripts.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY media/ /usr/share/nginx/html/media/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
