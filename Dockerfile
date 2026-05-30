# Production stage
FROM nginx:alpine AS production-stage

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]