# 🏋️ GimnasioBox - Sistema de Gestión de Reservas

Sistema web para gestión de reservas de clases de CrossFit/Functional Training con backend en Google Apps Script y frontend vanilla JavaScript.

## 🌟 Características

- ✅ **Sistema de Login** por documento de identidad
- ✅ **Reserva de Clases** con control de cupos en tiempo real
- ✅ **Gestión de Créditos Semanales** automática
- ✅ **Cancelación de Reservas** con ventana de 3 horas
- ✅ **Registro de Pagos** con soporte de comprobantes
- ✅ **Filtrado Inteligente** - No muestra clases ya reservadas
- ✅ **Zona Horaria Colombiana** (America/Bogota)
- ✅ **Manejo de Concurrencia** con LockService
- ✅ **Responsive Design** - Mobile-first

## 🏗️ Arquitectura

```
┌─────────────────┐
│   index.html    │  ← Frontend (Interfaz de Usuario)
│     app.js      │
│    config.js    │
└────────┬────────┘
         │ JSONP/REST
         ↓
┌─────────────────┐
│  Google Apps    │  ← Backend (Lógica de Negocio)
│     Script      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Google Sheets  │  ← Base de Datos
│  - Clientes     │
│  - Horarios     │
│  - Reservas     │
│  - Pagos        │
└─────────────────┘
```

## 📁 Estructura del Proyecto

```
GimnasioBox/
├── index.html                 # Interfaz principal (raíz)
├── package.json              # Configuración del proyecto
├── LICENSE                   # Licencia del proyecto
├── README.md                 # Este archivo
│
├── 📂 src/                   # Código fuente JavaScript
│   ├── app.js               # Lógica principal del frontend
│   └── config.js            # Configuración de la API
│
├── 📂 gas/                   # Google Apps Script (Backend)
│   ├── Code.gs              # Código del backend
│   ├── appsscript.json      # Configuración de Apps Script
│   ├── config.private.gs    # Configuración privada (no en Git)
│   └── config.private.example.gs  # Ejemplo de configuración
│
├── 📂 scripts/               # Scripts de utilidades
│   ├── crear_excel.py       # Genera estructura Excel base
│   └── setup.sh             # Script de instalación
│
├── 📂 images/                # Recursos gráficos
│   └── internationalBox.jpeg  # Logo del gimnasio
│
├── 📂 generated/             # Archivos generados (no en Git)
│   └── gimnasio_box.xlsx    # Excel generado por script
│
└── 📂 docs/                  # Documentación
    ├── SETUP-CLASP.md       # Guía desarrollo local con clasp
    ├── GITHUB-SETUP.md      # Configuración GitHub
    ├── GITHUB-PAGES.md      # Deploy en GitHub Pages
    └── INSCRIPCIONES.md     # Sistema de inscripciones
```

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/GimnasioBox.git
cd GimnasioBox
```

### 2. Configurar Variables de Entorno

```bash
# Frontend: Copiar el archivo de configuración
cp src/config.js src/config.js.local

# Editar src/config.js y agregar:
# - API_URL: URL de tu Web App desplegada

# Backend: Copiar configuración privada
cp gas/config.private.example.gs gas/config.private.gs

# Editar gas/config.private.gs y agregar:
# - SHEET_ID: ID de tu Google Sheets
```

### 3. Crear la Base de Datos (Google Sheets)

#### Opción A: Usar el script Python
```bash
cd scripts
python3 crear_excel.py
# El archivo se generará en generated/gimnasio_box.xlsx
```

#### Opción B: Manual
Crea un Google Sheet con las siguientes hojas:

**Hoja: Clientes**
| Documento | Nombre | Email | Plan Semanal | Créditos Usados | Membresía Anual | Estado |
|-----------|--------|-------|--------------|-----------------|-----------------|--------|
| 12345678  | Juan   | ...   | 3            | =FORMULA        | S/N             | Activo |

**Hoja: Horarios**
| ID Clase | Tipo      | Coach  | Fecha      | Hora  | Duración | Cupos Máx | Cupos Reservados |
|----------|-----------|--------|------------|-------|----------|-----------|------------------|
| CLASE001 | CrossFit  | Carlos | 2026-01-30 | 06:00 | 60min    | 15        | =FORMULA         |

**Hoja: Reservas**
| ID Reserva | Documento | ID Clase | Fecha Registro | Estado |
|------------|-----------|----------|----------------|--------|
| RES001     | 12345678  | CLASE001 | 2026-01-29...  | Activa |

**Hoja: Pagos**
| Fecha | Documento | Tipo Pago | Link Soporte | Estado |
|-------|-----------|-----------|--------------|--------|

### 3. Configurar Apps Script

1. Ve a [Google Apps Script](https://script.google.com)
2. Nuevo proyecto → Pega el contenido de `apps-script-backend.js`
3. Reemplaza `SHEET_ID` con el ID de tu Google Sheet
4. **Deploy → Nueva implementación:**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier usuario**
5. Copia la URL del deployment

### 4. Desplegar a Apps Script

```bash
# Generar Code.gs con tu configuración
./build-appsscript.sh

# Subir a Apps Script (si usas clasp)
./sync.sh

# O manualmente:
# 1. Ve a https://script.google.com
# 2. Copia el contenido de Code.gs
# 3. Deploy → Nueva implementación → Aplicación web
```

**Importante:** 
- `config.js` NO se sube al repositorio (está en .gitignore)
- Cada desarrollador configura su propio `config.js`
- `build-appsscript.sh` inyecta la configuración en Code.gs antes del deploy

### 5. Abrir la Aplicación

```bash
# Opción 1: Servidor local simple
python3 -m http.server 8000

# Opción 2: Live Server en VS Code
# Click derecho en index.html → Open with Live Server
```

Abre http://localhost:8000 en tu navegador.

## 🔧 Desarrollo Local

### Opción 1: clasp (Desarrollo Apps Script con Datos Reales)

```bash
# Instalar clasp
npm install -g @google/clasp

# Login
clasp login

# Configurar proyecto (obtén Script ID de Apps Script)
echo '{"scriptId":"TU_SCRIPT_ID","rootDir":"./"}' > .clasp.json

# Editar localmente
nano Code.gs

# Push cambios (5 segundos)
clasp push

# Ver logs en tiempo real
clasp logs --watch
```

Ver [SETUP-CLASP.md](docs/SETUP-CLASP.md) para guía completa.

### Opción 2: Backend Local Mock (Testing Rápido)

```bash
node backend-local.js
```

Edita `config.js`:
```javascript
API_URL: 'http://localhost:3000'
```

Ver [DESARROLLO-LOCAL.md](docs/DESARROLLO-LOCAL.md) para detalles.

## 🎨 Personalización

### Cambiar Logo
Reemplaza `internationalBox.jpeg` con tu logo.

### Modificar Estilos
Los estilos están en `<style>` dentro de `index.html` usando Tailwind CSS.

### Ajustar Reglas de Negocio
En `apps-script-backend.js`:
- **Ventana de cancelación**: Línea ~362 (`diffHoras < 3`)
- **Cupos por clase**: En hoja Horarios
- **Créditos semanales**: En hoja Clientes

## 📊 Fórmulas de Excel Importantes

### Créditos Usados (Columna E en Clientes)
```excel
=COUNTIFS(Reservas!$B:$B,A2,Reservas!$E:$E,"Activa")
```

### Cupos Reservados (Columna H en Horarios)
```excel
=COUNTIFS(Reservas!$C:$C,A2,Reservas!$E:$E,"Activa")
```

## 🐛 Troubleshooting

### Error: "API no configurada"
- Verifica que `config.js` tenga la URL correcta del deployment
- Asegúrate de haber deployado como "Aplicación web" en Apps Script

### Error: "Cliente no encontrado"
- Verifica que el documento exista en la hoja Clientes
- Revisa que el estado sea "Activo"

### Las clases ya reservadas aún aparecen
- Verifica que la columna Estado en Reservas sea exactamente "Activa"
- Revisa que el ID de clase coincida exactamente (sin espacios)

### Logs no aparecen en clasp logs
```bash
# Habilitar logs
clasp logs --watch --open
```

## 🚀 Optimizaciones Implementadas

✅ **Filtrado en Backend** - Reduce transferencia de datos  
✅ **LockService** - Evita condiciones de carrera  
✅ **Set() para búsquedas** - O(1) en vez de O(n)  
✅ **Zona horaria centralizada** - Consistencia temporal  

Ver [OPTIMIZACIONES.md](docs/OPTIMIZACIONES.md) para detalles y recomendaciones adicionales.

## 📈 Roadmap

- [ ] Implementar caché de cliente (LocalStorage)
- [ ] Sistema de notificaciones push
- [ ] Panel de administración para coaches
- [ ] Estadísticas y reportes
- [ ] Integración con pasarelas de pago
- [ ] App móvil nativa (React Native)
- [ ] Migración a Firebase/Supabase (si Apps Script es lento)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Fernando Páez**

## 🙏 Agradecimientos

- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide Icons](https://lucide.dev/) - Iconografía
- [Google Apps Script](https://developers.google.com/apps-script) - Backend serverless
- [clasp](https://github.com/google/clasp) - CLI para Apps Script

---

⭐ Si este proyecto te fue útil, dale una estrella en GitHub!
