FROM node:18.14.2

#create destination directory
RUN npm install -g pnpm
RUN mkdir -p /app
WORKDIR /app

ENV HOST 0.0.0.0
EXPOSE 8000

CMD ["npm", "run", "serve"]
