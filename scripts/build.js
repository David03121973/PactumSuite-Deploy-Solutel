const fs = require('fs');
const path = require('path');
const process = require('process');

const distPath = path.join(process.cwd(), 'dist');
const logsPath = path.join(distPath, 'logs');
const logFilePath = path.join(logsPath, 'app.log');
const envFilePath = path.join(distPath, '.env');

const envContent = `# Configuración del servidor FrontEnd
NUXT_PUBLIC_BACKEND_HOST=http://localhost:4000
NITRO_PORT=3000
NUXT_PUBLIC_SITE_URL=http://localhost:4000

# Configuración del servidor BackEnd
PORT=4000
CORS_OPTIONS=*
ENVIRONMENT=production 

# Configuración de JWT
JWT_SECRET=tu_clave_secreta_jwt_super_segura
REFRESH_TOKEN_SECRET=tu_clave_secreta_refresh_token_super_segura

# Configuración de la base de datos local
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=PactumSuite#Q123
DB_HOST=localhost
DB_DIALECT=postgres`;

// Create logs directory
if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true });
    console.log('Created logs directory.');
}

// Create app.log file
fs.writeFileSync(logFilePath, '');
console.log('Created app.log file.');

// Create .env file
fs.writeFileSync(envFilePath, envContent);
console.log('Created .env file.');
