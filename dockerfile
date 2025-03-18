FROM node:18-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package.json ./
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port
EXPOSE 5000

# Démarrer l'application
CMD ["node", "backend/server.js"]