FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the production bundle (optional - depends on your workflow)
RUN npm run build

# Expose development server port
EXPOSE 3000

CMD ["npm", "start"]
