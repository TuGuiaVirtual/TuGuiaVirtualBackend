# 🎷 TuGuíaVirtual Backend

API REST creada con **Node.js**, **Express** y **Prisma** para gestionar la lógica de usuarios de una app de audioguías. Soporta registro, login, autenticación con JWT, subida de imágenes a Cloudinary y recuperación segura de contraseña por email.

## 🚀 Tecnologías usadas

    - Node.js + Express
    - Prisma + PostgreSQL
    - Cloudinary (para imágenes)
    - JWT (autenticación)
    - Nodemailer (envío de correos)
    - Bcrypt (hashing de contraseñas)

## 📦 Instalación

    1. Clona el repositorio:
    git clone https://github.com/tuusuario/TuGuiaVirtualBackend.git
    cd TuGuiaVirtualBackend

    2. Instala dependencias:
    npm install

    3. Crea tu archivo `.env` en la raíz con:

    DATABASE_URL=postgresql://usuario:password@localhost:5432/yourvirtualguide?schema=public
    JWT_SECRET=clave_super_segura_jwt
    CLOUDINARY_CLOUD_NAME=tu_cloud
    CLOUDINARY_API_KEY=xxx
    CLOUDINARY_API_SECRET=xxx
    EMAIL_USER=tu_correo@gmail.com
    EMAIL_PASS=contraseña_app

    4. Ejecuta las migraciones:
    npx prisma migrate dev --name init


    5. Inicia el servidor:
    npm run dev


    Servidor corriendo en 👉 `http://localhost:5000`


## 📂 Estructura de carpetas

    TuGuiaVirtualBackend/
    │
    ├── controllers/         // Lógica de negocio
    ├── routes/              // Endpoints
    ├── middleware/          // Verificación JWT, multer, etc.
    ├── config/              // Config de Cloudinary
    ├── utils/               // Funciones como envío de email
    ├── prisma/              // Esquema y migraciones
    ├── index.js             // Entrada del servidor
    └── .env                 // Variables de entorno


## 🔐 Endpoints principales

    ### 📌 Autenticación
    - `POST /auth/register` – Registro de usuario
    - `POST /auth/login` – Login con email y contraseña
    - `GET /auth/me` – Obtener perfil (requiere token)

    ### 🧑‍💼 Perfil de usuario
    - `POST /upload/image` – Subida de imagen de perfil (requiere token)

    ### 🔑 Recuperación de contraseña
    - `POST /auth/forgot-password` – Enviar código por email
    - `POST /auth/reset-password` – Verificar código y cambiar contraseña

    ## ✉️ Email

    El backend usa `nodemailer` para enviar un código de recuperación al email del usuario.  
    Asegúrate de tener activada la verificación en 2 pasos y usar una contraseña de aplicación si usas Gmail.

    ## 🧪 Test rápido con Postman

    POST /auth/forgot-password
    {
    "email": "usuario@ejemplo.com"
    }

    POST /auth/reset-password
    {
    "email": "usuario@ejemplo.com",
    "code": "843125",
    "newPassword": "clave123"
    }

## ✨ Autor

Sebas — 💻  
Proyecto backend para la app [TuGuíaVirtual] 🗭

