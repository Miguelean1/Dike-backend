# Dikë — Comparte · Presta · Dona  | Backend API

Una plataforma comunitaria para dar una segunda vida a los objetos que ya no usas.


## Tecnologías

| Categoría | Tecnología |
|---|---|
| Framework | <img src="https://cdn.simpleicons.org/express/808080" width="16" height="16"> Express.js v5 |
| ORM / Base de datos | <img src="https://cdn.simpleicons.org/sequelize" width="16" height="16"> Sequelize + <img src="https://cdn.simpleicons.org/mysql" width="16" height="16"> MySQL2 |
| Autenticación | <img src="https://cdn.simpleicons.org/jsonwebtokens" width="16" height="16"> JWT (7 días) + <img src="https://cdn.simpleicons.org/npm" width="16" height="16"> bcryptjs |
| Almacenamiento de imágenes | <img src="https://cdn.simpleicons.org/cloudinary" width="16" height="16"> Cloudinary |
| Subida de archivos | <img src="https://cdn.simpleicons.org/npm" width="16" height="16"> Multer  |
| Validación | <img src="https://cdn.simpleicons.org/npm" width="16" height="16"> express-validator |
| Variables de entorno | <img src="https://cdn.simpleicons.org/dotenv" width="16" height="16"> dotenv |
| Dev server | <img src="https://cdn.simpleicons.org/nodemon" width="16" height="16"> nodemon |

---

## Requisitos previos

- Node.js >= 18
- MySQL 8+
- Cuenta en [Cloudinary](https://cloudinary.com/)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Miguelean1/Dike-backend
cd DikeBack

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver sección Variables de entorno)

# 4. Iniciar el servidor
npm run dev      # desarrollo (nodemon)
npm start        # producción
```

---

## Variables de entorno

Crear un fichero `.env` en la raíz del proyecto con las siguientes claves:

```env
PORT=3001

# Base de datos
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# JWT
JWT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Estructura del proyecto

```
DikeBack/
├── index.js                  # Punto de entrada — Express + Sequelize
└── src/
    ├── config/
    │   └── database.js       # Configuración de Sequelize
    ├── controllers/          # Lógica de negocio por recurso
    │   ├── auth.controller.js
    │   ├── categories.controller.js
    │   ├── messages.controller.js
    │   ├── posts.controller.js
    │   ├── ratings.controller.js
    │   ├── requests.controller.js
    │   ├── tags.controller.js
    │   └── users.controller.js
    ├── middleware/
    │   ├── auth.middleware.js # Validación de JWT (authGuard)
    │   ├── upload.js          # Multer + Cloudinary
    │   └── validate.js        # Wrapper de express-validator
    ├── models/
    │   ├── index.js           # Relaciones entre modelos
    │   ├── Category.js
    │   ├── Message.js
    │   ├── Post.js
    │   ├── Rating.js
    │   ├── Request.js
    │   ├── Tag.js
    │   └── User.js
    └── routes/               # Definición de rutas por recurso
        ├── auth.routes.js
        ├── categories.routes.js
        ├── messages.routes.js
        ├── posts.routes.js
        ├── ratings.routes.js
        ├── requests.routes.js
        ├── tags.routes.js
        └── users.routes.js
```

---





## Referencia de la API

La URL base en desarrollo es `http://localhost:3001/api`.

Las rutas marcadas con `auth` requieren el header:
```
Authorization: Bearer <token>
```


## Middleware

| Middleware | Descripción |
|---|---|
| `authGuard` | Extrae y verifica el JWT del header `Authorization`. Adjunta `req.user` con `id` y `role`. |
| `upload` | Multer en memoria + subida a Cloudinary. Deja la URL pública en `req.cloudinaryUrl`. |
| `validate` | Ejecuta los validators de express-validator y devuelve `400` con los errores si los hay. |

---

## Scripts disponibles

```bash
npm start      # node index.js
npm run dev    # nodemon index.js
```

---

## Licencia

MIT
