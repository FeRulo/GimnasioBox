# 📄 Publicar en GitHub Pages

## 🌐 ¿Qué es GitHub Pages?

GitHub Pages te permite alojar tu aplicación web **gratis** directamente desde tu repositorio. Tu app estará disponible en:
```
https://TU_USUARIO.github.io/GimnasioBox/
```

---

## ✅ Paso 1: Verificar que config.js esté en el Repositorio

Ya está configurado para subirse. Verifica que contiene tu API_URL de Google Apps Script:

```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycby.../exec',
    // ...resto de configuración
};
```

⚠️ **IMPORTANTE:** Asegúrate de que el Google Apps Script esté desplegado como **Web App** y la API_URL sea la de producción, no de desarrollo.

---

## 🚀 Paso 2: Habilitar GitHub Pages

### Opción A: Desde la Rama `main` (Recomendado)

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source** (Origen):
   - Branch: `main`
   - Folder: `/ (root)`
5. Click en **Save**

GitHub tomará unos segundos en desplegar. Te mostrará la URL:
```
✅ Your site is published at https://TU_USUARIO.github.io/GimnasioBox/
```

### Opción B: Usando GitHub Actions (Avanzado)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## 🔧 Paso 3: Configurar URLs Correctamente

### En Google Apps Script:

1. Abre tu proyecto en Apps Script
2. Click en **Deploy** > **Manage deployments**
3. Copia la URL de **Web App**
4. **IMPORTANTE:** Configuración del deployment:
   - Execute as: **Me**
   - Who has access: **Anyone** (para que GitHub Pages pueda acceder)

### En config.js:

Actualiza la API_URL con la URL de producción:

```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec',
    // ... resto
};
```

---

## 📝 Paso 4: Actualizar y Subir Cambios

```bash
# Agregar config.js (ahora sí se sube a GitHub)
git add config.js .gitignore

# Commit
git commit -m "Add: config.js para GitHub Pages"

# Subir
git push origin main
```

**Espera 1-2 minutos** y tu app estará en vivo en:
```
https://TU_USUARIO.github.io/GimnasioBox/
```

---

## 🌍 Paso 5: Usar Dominio Personalizado (Opcional)

### Si tienes un dominio propio:

1. En tu proveedor de dominios (Namecheap, GoDaddy, etc.), crea un registro DNS:
   ```
   Tipo: CNAME
   Host: www (o gimnasiobox)
   Valor: TU_USUARIO.github.io
   ```

2. En GitHub Pages Settings:
   - Custom domain: `www.tudominio.com`
   - ✅ Enforce HTTPS

3. Espera propagación DNS (hasta 24 horas)

---

## 🔒 Seguridad: ¿Es seguro subir config.js?

### ✅ SÍ, porque:

1. **API_URL es pública por diseño:**
   - Cualquier usuario que acceda a tu app ve esta URL en las peticiones HTTP
   - Es el endpoint público de tu Web App
   - No expone credenciales

2. **Datos sensibles están protegidos:**
   - `SHEET_ID` está en `config.private.gs` (NO se sube a GitHub)
   - `Code.gs` con la lógica del backend NO se sube a GitHub
   - Solo se accede al Sheet desde Google Apps Script (servidor)

3. **Protección adicional en Apps Script:**
   - Tu Web App valida permisos
   - Usuarios solo pueden ver sus propios datos
   - Google maneja la autenticación

### ❌ NUNCA subas a GitHub:
- Contraseñas
- API Keys privadas
- Tokens de acceso
- IDs de hojas de cálculo
- Archivos con datos de clientes

---

## 🧪 Paso 6: Probar la Aplicación

1. Abre `https://TU_USUARIO.github.io/GimnasioBox/`
2. Verifica que carga correctamente
3. Prueba el login con un documento de prueba
4. Revisa la consola del navegador (F12) para errores:
   - ✅ Peticiones exitosas a Apps Script
   - ❌ Errores CORS (si hay, revisa el deployment de Apps Script)

---

## 🐛 Solución de Problemas

### Problema: "404 - Page not found"

**Causa:** GitHub Pages no encuentra index.html

**Solución:**
- Verifica que `index.html` esté en la raíz del repo
- Espera 1-2 minutos después de habilitar Pages
- Revisa Settings > Pages > Source esté en `main` / `/ (root)`

### Problema: "La app no carga datos"

**Causa:** API_URL incorrecta o Apps Script mal configurado

**Solución:**
1. Abre consola del navegador (F12) > Network
2. Busca peticiones a `script.google.com`
3. Revisa la respuesta:
   - Si es HTML: Tu script no está desplegado correctamente
   - Si es JSON con error: Revisa el código de Apps Script
4. Verifica deployment de Apps Script:
   - Execute as: **Me**
   - Who has access: **Anyone**

### Problema: Error CORS

**Causa:** Restricciones de dominio cruzado

**Solución:**
Apps Script no tiene problemas de CORS si está configurado como "Anyone".
Si persiste:
1. Redeploya el Apps Script con una nueva versión
2. Actualiza la API_URL en config.js
3. Limpia caché del navegador (Ctrl+Shift+R)

### Problema: "Script function not found: doGet"

**Causa:** El archivo `Code.gs` no se subió con clasp

**Solución:**
```bash
# Asegúrate de que Code.gs existe localmente
ls Code.gs

# Subir a Apps Script
clasp push

# Redeploy
clasp deploy --description "Deploy para GitHub Pages"
```

---

## 🎯 Checklist Completo

- [ ] Config.js actualizado con API_URL de producción
- [ ] Google Apps Script desplegado con acceso "Anyone"
- [ ] Config.js incluido en el repositorio (removido de .gitignore)
- [ ] Código subido a GitHub: `git push origin main`
- [ ] GitHub Pages habilitado en Settings > Pages
- [ ] Esperado 1-2 minutos para deployment
- [ ] URL funcionando: `https://TU_USUARIO.github.io/GimnasioBox/`
- [ ] Login probado exitosamente
- [ ] Sin errores en consola del navegador (F12)

---

## 📊 Monitoreo y Analytics (Opcional)

### Google Analytics

Agrega al final de `index.html` (antes de `</body>`):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🚀 Comandos Rápidos

```bash
# Ver archivos que se subirán
git status

# Agregar cambios
git add config.js .gitignore

# Commit y push
git commit -m "Deploy: Configurar para GitHub Pages"
git push origin main

# Ver URL de GitHub Pages
echo "https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | tr '[:upper:]' '[:lower:]' | sed 's/\//.github.io\//').github.io/"
```

---

## 🎉 ¡Listo!

Tu aplicación ahora está publicada en:
```
https://TU_USUARIO.github.io/GimnasioBox/
```

**Comparte el enlace** con tus clientes y empieza a usarla. 🏋️

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Fix: descripción del cambio"
git push origin main
```

GitHub Pages **se actualiza automáticamente** en 1-2 minutos. 🚀
