# 🚀 Guía para Subir a GitHub y Publicar con GitHub Pages

## 📦 Resumen: ¿Qué se sube a GitHub?

**Archivos que SÍ se suben:**
- ✅ `config.js` - Contiene la API_URL pública de tu Google Apps Script
- ✅ `index.html` - Frontend de la aplicación
- ✅ `app.js` - Lógica del cliente
- ✅ `config.private.example.gs` - Ejemplo de configuración
- ✅ `README.md` y documentación

**Archivos que NO se suben (están en .gitignore):**
- ❌ `config.private.gs` - Contiene el SHEET_ID (solo en Google Apps Script)
- ❌ `.clasp.json` - Tu Script ID personal
- ❌ `Code.gs` - Backend (se sube solo con `clasp push`)
- ❌ Archivos Excel con datos sensibles

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `GimnasioBox` (o el que prefieras)
3. Descripción: "Sistema de gestión de reservas para gimnasio CrossFit"
4. **NO** marques "Add README" (ya lo tienes)
5. **NO** marques "Add .gitignore" (ya lo tienes)
6. Click en "Create repository"

## Paso 2: Conectar tu Repositorio Local con GitHub

```bash
# Agregar remote de GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/GimnasioBox.git

# Renombrar rama a main (opcional, GitHub recomienda main en vez de master)
git branch -M main

# Subir código
git push -u origin main
```

## Paso 3: Verificar Archivos Sensibles (✅ Ya Protegidos)

Tu `.gitignore` ya está configurado para NO subir:
- ✅ `config.private.gs` (contiene tu SHEET_ID)
- ✅ `.clasp.json` (contiene tu Script ID)
- ✅ `Code.gs` (backend, solo se sube con clasp)
- ✅ `gimnasio_box.xlsx` (datos sensibles)
- ✅ `.venv/` (entorno virtual Python)
- ✅ `node_modules/` (dependencias)

**NOTA:** `config.js` SÍ se sube a GitHub porque:
1. Solo contiene la API_URL pública de tu Web App (ya es pública)
2. GitHub Pages necesita acceso a este archivo para funcionar
3. No expone datos sensibles (el SHEET_ID está en `config.private.gs`)

## Paso 4: Personalizar el README (Opcional)

Edita `README.md` y actualiza:
- Enlace del repositorio
- Tu nombre de usuario de GitHub
- Información de contacto
- Screenshots (si deseas)

## Paso 5: Agregar Badges (Opcional pero Pro 😎)

Agrega al inicio de tu `README.md`:

```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
```

## Paso 6: Crear un .github/workflows (CI/CD - Opcional)

Para validaciones automáticas:

```bash
mkdir -p .github/workflows
```

Crear `.github/workflows/validate.yml`:

```yaml
name: Validate Code
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check files
        run: |
          echo "✅ Código validado"
```

## Comandos Útiles

```bash
# Ver status
git status

# Ver log de commits
git log --oneline

# Crear nueva rama para features
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Agregar cambios
git add .
git commit -m "Descripción del cambio"
git push

# Ver remotes configurados
git remote -v

# Actualizar desde GitHub
git pull origin main
```

## 📸 Agregar Screenshots (Recomendado)

1. Crea una carpeta `screenshots/`
2. Agrega imágenes de tu app
3. Inclúyelas en el README:

```markdown
## 📸 Screenshots

![Login](screenshots/login.png)
![Reservas](screenshots/reservas.png)
```

## 🏷️ Crear Release (Primera Versión)

1. En GitHub: Click en "Releases" → "Create a new release"
2. Tag: `v1.0.0`
3. Título: "Versión 1.0.0 - Lanzamiento Inicial"
4. Descripción:
```
## 🎉 Primera Versión Estable

### Características
- Sistema de login por documento
- Reserva de clases con control de cupos
- Cancelación con ventana de 3 horas
- Gestión de créditos semanales
- Filtrado de clases ya reservadas
- Zona horaria Colombia

### Tecnologías
- Frontend: HTML/CSS/JS Vanilla
- Backend: Google Apps Script
- Base de datos: Google Sheets
```

## 🔐 Proteger Rama Main (Recomendado)

En GitHub:
1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Marca:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass

## 🤝 Colaboración

Para colaboradores:

```bash
# 1. Fork el repositorio en GitHub
# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/GimnasioBox.git

# 3. Agregar upstream (el original)
git remote add upstream https://github.com/USUARIO_ORIGINAL/GimnasioBox.git

# 4. Crear rama para tu feature
git checkout -b feature/mi-mejora

# 5. Hacer cambios, commit y push
git add .
git commit -m "Add: nueva característica"
git push origin feature/mi-mejora

# 6. Crear Pull Request en GitHub
```

## ✅ Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Remote agregado localmente
- [ ] Primera subida exitosa (`git push -u origin main`)
- [ ] Verificar que archivos sensibles NO se subieron
- [ ] README.md personalizado
- [ ] Licencia agregada (MIT)
- [ ] .gitignore configurado
- [ ] Badges agregados (opcional)
- [ ] Screenshots agregados (opcional)
- [ ] Release v1.0.0 creado (opcional)

---

## 🎯 Comando Todo en Uno

```bash
# Ejecutar todo de una vez (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/GimnasioBox.git && \
git branch -M main && \
git push -u origin main && \
echo "🎉 ¡Proyecto subido exitosamente a GitHub!"
```

---

¿Listo? ¡Tu proyecto está en GitHub! 🚀
