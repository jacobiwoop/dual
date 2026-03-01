# Étape 1 : Build de l'application basic
FROM node:20-alpine AS basic-builder

WORKDIR /app
COPY basic/package*.json ./basic/
WORKDIR /app/basic
RUN npm install
COPY basic/ ./
RUN npm run build

# Étape 2 : Build de l'application creator
FROM node:20-alpine AS creator-builder

WORKDIR /app
COPY creator/package*.json ./creator/
WORKDIR /app/creator
RUN npm install
COPY creator/ ./
# On injecte la variable d'environnement au moment du build
ENV VITE_BASE_PATH=/creator/
RUN npm run build

# Étape 3 : Serveur Nginx de production
FROM nginx:alpine

# Copie de la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers buildés de basic vers la racine de Nginx
COPY --from=basic-builder /app/basic/dist /usr/share/nginx/html

# Copie des fichiers buildés de creator vers le sous-dossier /creator de Nginx
COPY --from=creator-builder /app/creator/dist /usr/share/nginx/html/creator

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
