# Verwende ein Basisimage mit Node.js, um UI5-Anwendungen zu erstellen
FROM node:latest

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und package-lock.json, um Abhängigkeiten zu installieren
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den gesamten Anwendungscode in das Arbeitsverzeichnis
COPY . .

# Setze die Umgebungsvariable für den UI5-Server
ENV PORT=8080

# Öffne den Port für den UI5-Server
EXPOSE 8080

# Befehl zum Starten des UI5-Servers
CMD ["npm", "run", "dev"]
