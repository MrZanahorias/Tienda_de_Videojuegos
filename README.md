# 🎮 CRUD de Videojuegos - Tienda Gaming

Sistema de gestión de inventario para tienda de videojuegos con Django + PostgreSQL + HTML/CSS/JS.

## 🚀 Características

- ✅ API REST con Django
- ✅ Base de datos PostgreSQL
- ✅ CRUD completo de videojuegos (título, plataforma, género, desarrollador, precio, stock)
- ✅ Frontend responsive con HTML5, CSS3 y JavaScript vanilla
- ✅ Variables de entorno con python-decouple

## 📋 Requisitos

- Python 3.8+
- PostgreSQL 12+

## 🔧 Instalación Rápida

### 1. Configurar PostgreSQL

Ejecuta estos comandos en PostgreSQL:

```sql
-- Conectarse a PostgreSQL (Windows: psql -U postgres)
CREATE DATABASE videojuegos_db;
CREATE USER videojuegos_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE videojuegos_db TO videojuegos_user;

-- Conectarse a la base de datos
\c videojuegos_db

-- Dar permisos al esquema public (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO videojuegos_user;
```

### 2. Configurar el proyecto

```bash
# Clonar/descargar el proyecto
cd Crud-Django

# Crear entorno virtual
py -m venv .venv                    # Windows
.\.venv\Scripts\activate            # Windows
# python3 -m venv .venv             # Linux/Mac
# source .venv/bin/activate         # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env              # Windows
# cp .env.example .env              # Linux/Mac
```

### 3. Editar archivo `.env`

```env
# Django Settings
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database PostgreSQL Settings
DB_ENGINE=django.db.backends.postgresql
DB_NAME=videojuegos_db
DB_USER=videojuegos_user
DB_PASSWORD=tu_password_seguro
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

### 4. Migrar y ejecutar

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

**Acceder a:** http://localhost:8000

## 🔌 API Endpoints

- **GET** `/api/videojuegos/` - Listar todos
- **GET** `/api/videojuegos/{id}/` - Obtener uno
- **POST** `/api/videojuegos/crear/` - Crear
- **PUT** `/api/videojuegos/{id}/actualizar/` - Actualizar
- **DELETE** `/api/videojuegos/{id}/eliminar/` - Eliminar

**Ejemplo JSON:**
```json
{
  "titulo": "The Legend of Zelda: Breath of the Wild",
  "descripcion": "Juego de aventura y exploración",
  "precio": 59.99,
  "stock": 10,
  "plataforma": "SWITCH",
  "genero": "AVENTURA",
  "desarrollador": "Nintendo",
  "fecha_lanzamiento": "2017-03-03"
}
```

## 🛠️ Stack Tecnológico

**Backend:** Django 5.2.8, PostgreSQL, python-decouple, django-cors-headers  
**Frontend:** HTML5, CSS3, JavaScript (Fetch API)

## 📝 Modelo de Datos

**Videojuego:**
- `titulo` (CharField)
- `descripcion` (TextField, opcional)
- `precio` (DecimalField)
- `stock` (IntegerField)
- `plataforma` (CharField con choices: PC, PS5, PS4, Xbox Series, Xbox One, Switch, Multi)
- `genero` (CharField con choices: Acción, Aventura, RPG, Deportes, etc.)
- `desarrollador` (CharField, opcional)
- `fecha_lanzamiento` (DateField, opcional)

---

**Admin:** http://localhost:8000/admin  
**Frontend:** http://localhost:8000
