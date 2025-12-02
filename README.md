# Backend - Gestión de Contratos y Ofertas

Este es el backend de un sistema de gestión de contratos, ofertas y entidades. Proporciona una API REST completa con autenticación JWT, documentación Swagger y base de datos PostgreSQL.

## 🚀 Características

- **API REST** con Express.js
- **Autenticación JWT** para seguridad
- **Base de datos PostgreSQL** con Sequelize ORM
- **Documentación automática** con Swagger
- **Logging** con Winston
- **Validaciones** robustas en endpoints
- **Gestión de relaciones** entre entidades
- **CORS** configurado para frontend

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **PostgreSQL** (versión 12 o superior)
- **Git**

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/davidquintanajob/Contract-Manager
cd backend
```

### 2. Instalar dependencias

```bash
# Con npm
npm install

# O con yarn
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Copiar el archivo de ejemplo (si existe)
cp .env.example .env

# O crear manualmente
touch .env
```

Configura las siguientes variables en el archivo `.env`:

```env
# Configuración del servidor
PORT=4000
CORS_OPTIONS=*
ENVIRONMENT=production #development

# Configuración de la base de datos
DB_NAME=GestionDeContratos
DB_USER=postgres
DB_PASSWORD=pg
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

# Configuración de JWT
JWT_SECRET=tu_clave_secreta_jwt_super_segura
REFRESH_TOKEN_SECRET=tu_clave_secreta_refresh_token_super_segura
```

### 4. Configurar la base de datos

1. **Crear la base de datos PostgreSQL:**

```sql
CREATE DATABASE contract_manager;
```

2. **Crear un usuario (opcional):**

```sql
CREATE USER tu_usuario WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE contract_manager TO tu_usuario;
```

### 5. Ejecutar el proyecto

#### Modo desarrollo (con nodemon):
```bash
npm run dev
# o
yarn dev
```

#### Modo producción:
```bash
npm start
# o
yarn start
```

El servidor estará disponible en: `http://localhost:4000`

## 📚 Documentación de la API

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación automática de la API:

- **Swagger UI**: `http://localhost:4000/api-docs`

## 🗄️ Estructura de la Base de Datos

El sistema incluye las siguientes entidades principales:

- **Usuarios** - Gestión de usuarios del sistema
- **Entidades** - Organizaciones o empresas
- **Tipos de Contrato** - Categorías de contratos
- **Contratos** - Contratos principales
- **Ofertas** - Ofertas de trabajo
- **Trabajadores Autorizados** - Trabajadores con permisos
- **Contrato-Trabajador** - Relación entre contratos y trabajadores

## 🔧 Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Linting (si está configurado)
npm run lint
```

## 🔒 Autenticación

El sistema utiliza autenticación JWT. Para acceder a los endpoints protegidos:

1. **Registrarse/Iniciar sesión** en `/usuario/register` o `/usuario/login`
2. **Obtener el token JWT** de la respuesta
3. **Incluir el token** en el header `Authorization: Bearer <token>`

## 🌐 Endpoints Principales

### Usuarios
- `POST /usuario/register` - Registrar usuario
- `POST /usuario/login` - Iniciar sesión
- `GET /usuario` - Obtener usuarios
- `PUT /usuario/UpdateUsuario/:id` - Actualizar usuario
- `DELETE /usuario/DeleteUsuario/:id` - Eliminar usuario

### Contratos
- `GET /contrato` - Obtener contratos
- `POST /contrato/CreateContrato` - Crear contrato
- `PUT /contrato/UpdateContrato/:id` - Actualizar contrato
- `DELETE /contrato/DeleteContrato/:id` - Eliminar contrato

### Entidades
- `GET /entidad` - Obtener entidades
- `POST /entidad/CreateEntidad` - Crear entidad
- `PUT /entidad/UpdateEntidad/:id` - Actualizar entidad
- `DELETE /entidad/DeleteEntidad/:id` - Eliminar entidad

### Ofertas
- `GET /oferta` - Obtener ofertas
- `POST /oferta/CreateOferta` - Crear oferta
- `PUT /oferta/UpdateOferta/:id` - Actualizar oferta
- `DELETE /oferta/DeleteOferta/:id` - Eliminar oferta

## 🚀 Despliegue en Producción

### 1. Preparar el entorno

```bash
# Instalar dependencias de producción
npm ci --only=production

# Configurar variables de entorno para producción
NODE_ENV=production
```

### 2. Usando PM2 (recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start app.js --name "contract-manager-backend"

# Configurar inicio automático
pm2 startup
pm2 save
```

### 3. Usando Docker (opcional)

Crear un `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

```bash
# Construir imagen
docker build -t contract-manager-backend .

# Ejecutar contenedor
docker run -p 4000:4000 --env-file .env contract-manager-backend
```

## 🔍 Troubleshooting

### Problemas comunes:

1. **Error de conexión a la base de datos:**
   - Verificar que PostgreSQL esté ejecutándose
   - Comprobar credenciales en `.env`
   - Verificar que la base de datos exista

2. **Puerto ya en uso:**
   - Cambiar el puerto en `.env`
   - O matar el proceso que usa el puerto

3. **Errores de dependencias:**
   - Eliminar `node_modules` y `package-lock.json`
   - Ejecutar `npm install` nuevamente