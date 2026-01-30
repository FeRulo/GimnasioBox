# Guía: Desarrollo Local de Apps Script con Datos Reales

## 📦 Instalación de clasp

```bash
# Instalar clasp globalmente
npm install -g @google/clasp

# O usar el script del package.json
npm run clasp:install
```

## 🔐 Autenticación

```bash
# Login con tu cuenta de Google
clasp login
```

Esto abrirá el navegador para que autorices el acceso a tu cuenta.

## 🔗 Conectar con tu Proyecto Existente

### Opción A: Si YA tienes el proyecto en Apps Script

```bash
# 1. Obtén el Script ID de tu proyecto
# Ve a: https://script.google.com → Tu proyecto → Configuración → ID de script
# Ejemplo: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t

# 2. Crea el archivo .clasp.json
echo '{"scriptId":"TU_SCRIPT_ID_AQUI","rootDir":"./"}' > .clasp.json

# 3. Descarga el código actual
clasp pull
```

### Opción B: Crear Proyecto Nuevo

```bash
# Crear nuevo proyecto Apps Script
clasp create --title "GimnasioBox Backend" --type webapp

# Esto crea automáticamente .clasp.json
```

## 📝 Estructura de Archivos

Renombra tu archivo para Apps Script:

```bash
# Apps Script requiere extensión .gs
cp apps-script-backend.js Code.gs
```

Tu estructura quedará:
```
GimnasioBox/
├── Code.gs                    # ← Código Apps Script
├── .clasp.json               # ← Configuración clasp
├── .claspignore              # ← Archivos a ignorar
├── app.js                    # Frontend (no se sube)
├── index.html                # Frontend (no se sube)
└── config.js                 # Frontend (no se sube)
```

## 🚫 Configurar .claspignore

```bash
# Crear archivo para ignorar archivos que NO quieres subir
cat > .claspignore << 'EOF'
node_modules/
*.md
app.js
index.html
config.js
crear_excel.py
backend-local.js
package.json
package-lock.json
.git/
EOF
```

## 🚀 Workflow de Desarrollo

### 1. Editar localmente
Edita `Code.gs` en tu editor favorito (VS Code)

### 2. Subir cambios
```bash
# Push del código al servidor
clasp push

# Si quieres ver qué archivos se subirán
clasp push --watch
```

### 3. Ver logs en tiempo real
```bash
# En una terminal aparte
clasp logs --watch

# O usar el script
npm run clasp:logs
```

### 4. Probar la URL
```bash
# Obtener la URL de deployment
clasp deployments

# O abrir el proyecto en el navegador
clasp open
```

## 🧪 Testing con Logs en Tiempo Real

### Terminal 1: Editor
```bash
# Edita Code.gs
code Code.gs
```

### Terminal 2: Push automático
```bash
# Push automático en cada cambio
clasp push --watch
```

### Terminal 3: Ver logs
```bash
# Logs en tiempo real
clasp logs --watch
```

### Terminal 4: Hacer requests
```bash
# Probar el endpoint
curl "https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec?action=getHorarios&documento=12345678"
```

## 📊 Ver Logs Detallados

Después de hacer una request, verás los logs así:

```
Jan 30, 2026 10:15:32 AM Info 🔍 DEBUG: Buscando reservas para documento: 12345678
Jan 30, 2026 10:15:32 AM Info Fila 1: Doc="12345678" | Estado="Activa" | IdClase="CLASE001"
Jan 30, 2026 10:15:32 AM Info ✅ Agregado a filtro: CLASE001
Jan 30, 2026 10:15:32 AM Info 📋 Clases reservadas encontradas: CLASE001
Jan 30, 2026 10:15:32 AM Info 🚫 Clase CLASE001 FILTRADA (ya reservada)
Jan 30, 2026 10:15:32 AM Info ✅ Clase CLASE002 INCLUIDA en resultados
```

## 🔄 Comandos Útiles

```bash
# Ver info del proyecto
clasp list

# Ver deployments
clasp deployments

# Crear nuevo deployment
clasp deploy --description "Version con filtro optimizado"

# Abrir en navegador
clasp open

# Ver versiones
clasp versions

# Revertir cambios (pull desde servidor)
clasp pull
```

## ⚡ Ventajas de este Setup

✅ **Editas localmente** con tu editor favorito (VS Code, etc.)
✅ **Push en segundos** (5-10s vs 30s+ manualmente)
✅ **Logs en tiempo real** en tu terminal
✅ **Control de versiones** (Git + clasp)
✅ **Trabaja con datos reales** del Google Sheet
✅ **No necesitas abrir Apps Script web** para cada cambio
✅ **IntelliSense/Autocomplete** si instalas `@types/google-apps-script`

## 🎯 Workflow Recomendado

1. **Desarrollo**: Edita `Code.gs` localmente
2. **Push**: `clasp push` (5 segundos)
3. **Test**: Llama a la URL desde tu app o curl
4. **Debug**: `clasp logs --watch` muestra todo en tiempo real
5. **Repite** hasta que funcione
6. **Deploy**: `clasp deploy` para nueva versión pública

## 📱 Integración con tu App

Tu `config.js` sigue usando la misma URL:
```javascript
API_URL: 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec'
```

No cambia nada en el frontend, solo mejoras tu workflow de desarrollo.

## 🐛 Troubleshooting

### Error: "User has not enabled the Apps Script API"
```bash
# Habilitar API
# Ve a: https://script.google.com/home/usersettings
# Activa "Google Apps Script API"
```

### Error: "No 'scriptId' found in .clasp.json"
```bash
# Obtener Script ID
clasp open
# En el navegador: Configuración → ID de script
# Agregar a .clasp.json
```

### Push no funciona
```bash
# Verificar archivos que se subirán
clasp status

# Forzar push
clasp push --force
```

---

## 🚀 Inicio Rápido (TL;DR)

```bash
# 1. Instalar
npm install -g @google/clasp

# 2. Login
clasp login

# 3. Conectar proyecto (reemplaza con tu Script ID)
echo '{"scriptId":"TU_SCRIPT_ID_AQUI","rootDir":"./"}' > .clasp.json

# 4. Renombrar archivo
cp apps-script-backend.js Code.gs

# 5. Crear .claspignore
cat > .claspignore << 'EOF'
*.md
app.js
index.html
config.js
*.py
backend-local.js
package*.json
node_modules/
.git/
EOF

# 6. Push inicial
clasp push

# 7. Ver logs en tiempo real
clasp logs --watch

# 8. ¡Listo! Edita Code.gs y haz clasp push
```
