# 📝 Sistema de Inscripciones - Internacional Box

## Descripción General

Se ha implementado un formulario de inscripción completo para nuevos atletas que deseen unirse a Internacional Box. Este formulario está disponible directamente desde la pantalla de inicio, junto al acceso de atletas existentes.

## Características Implementadas

### 1. Botón de Inscripción
- **Ubicación**: Pantalla de login/inicio
- **Diseño**: Botón rojo destacado debajo del botón de acceso para atletas
- **Texto**: "📝 Nueva Inscripción"

### 2. Formulario de Inscripción

El formulario incluye los siguientes campos:

#### Campos Obligatorios (*)
- **Nombre Completo**: Nombre completo del atleta
- **Fecha de Nacimiento**: Calcula automáticamente la edad
- **Contacto**: Número de teléfono
- **Cédula**: Número de documento de identidad
- **EPS**: Entidad promotora de salud
- **Objetivos**: Selección de objetivo principal (dropdown):
  - Acondicionamiento Funcional
  - Perder Peso
  - Aumentar Masa Muscular
  - Aprender Boxeo

#### Campos Opcionales
- **Acudiente**: Nombre del acudiente (para menores o si aplica)
- **Contacto Acudiente**: Teléfono del acudiente
- **Antecedentes Médicos**: Textarea para información médica relevante

### 3. Cálculo Automático de Edad
- Al seleccionar la fecha de nacimiento, se muestra automáticamente la edad calculada
- La edad se envía junto con los demás datos al backend

### 4. Consentimiento Informado

#### Checkbox Obligatorio
- El usuario debe marcar el checkbox para aceptar las condiciones antes de enviar
- Incluye un link que abre el modal con las reglas completas

#### Modal de Condiciones
- **Diseño**: Modal overlay con scroll vertical
- **Contenido**: Reglas de Juego Internacional Box completas
- **Secciones incluidas**:
  1. Reprogramación y cancelación de clases
  2. Derechos de autor y uso de material
  3. Reposición de clases
  4. Actualización de tarifas – Año 2026
  5. Definiciones importantes (Membresía, Sesión de clase)
  6. Requisitos Administrativos

## Flujo de Trabajo

### Frontend (Usuario)
1. Usuario hace clic en "Nueva Inscripción"
2. Completa el formulario
3. Lee y acepta las condiciones (obligatorio)
4. Hace clic en "Enviar Inscripción"
5. Recibe confirmación de envío exitoso
6. Es redirigido a la pantalla de login

### Backend (Google Apps Script)

#### Nueva Acción: `registrarInscripcion`
```javascript
Parámetros:
- nombre
- fechaNacimiento
- edad
- contacto
- cedula
- eps
- acudiente
- contactoAcudiente
- antecedentes
- objetivos
```

#### Proceso Backend:
1. Verifica que la cédula no esté ya registrada en "Clientes"
2. Agrega una nueva fila directamente a la hoja "Clientes"
3. Estado inicial: "Pendiente"
4. Plan_Semanal: 0 (hasta que se apruebe)
5. Membresia_Anual: "N" (hasta que se apruebe)
6. Aplica automáticamente la fórmula de Creditos_Usados
7. Retorna confirmación exitosa

## Estructura de Datos

### Hoja: "Clientes" (Actualizada con nuevas columnas)

| Columna | Campo | Descripción | Tipo | Valores por Defecto |
|---------|-------|-------------|------|---------------------|
| A | Documento | Número de cédula | Text/Number | - |
| B | Nombre | Nombre completo | Text | - |
| C | Email | Correo electrónico | Text | Vacío (opcional) |
| D | Plan_Semanal | Días por semana | Number | 0 (hasta aprobación) |
| E | Creditos_Usados | Clases usadas (fórmula) | Formula | =COUNTIFS(...) |
| F | Membresia_Anual | Membresía pagada | Text (S/N) | "N" |
| G | Estado | Estado del cliente | Text | "Pendiente" o "Activo" |
| H | Fecha_Nacimiento | Fecha de nacimiento | Date | - |
| I | Edad | Edad calculada | Number | - |
| J | Contacto | Teléfono | Text | - |
| K | EPS | Entidad de salud | Text | - |
| L | Acudiente | Nombre acudiente | Text | Vacío (opcional) |
| M | Contacto_Acudiente | Teléfono acudiente | Text | Vacío (opcional) |
| N | Antecedentes | Info médica | Text | Vacío (opcional) |
| O | Objetivos | Objetivo principal | Text | - |

## Validaciones Implementadas

### Frontend
- ✅ Validación de campos obligatorios
- ✅ Validación de checkbox de consentimiento
- ✅ Cálculo automático de edad
- ✅ Limpieza del formulario después del envío

### Backend
- ✅ Verificación de cédula duplicada
- ✅ Creación automática de hoja "Inscripciones"
- ✅ Registro con timestamp
- ✅ Manejo de errores y respuestas

## Próximos Pasos (Recomendados)

### 1. Regenerar el Excel
```bash
python3 crear_excel.py
```
Esto creará el archivo con las nuevas columnas en la hoja "Clientes"

### 2. Subir a Google Sheets
- Subir el nuevo archivo Excel a Google Drive
- Importar/Reemplazar el Google Sheet existente (o actualizar las columnas manualmente)
- Verificar que las fórmulas se mantengan en la columna "Creditos_Usados"

### 3. Proceso de Aprobación
- El coach/admin debe revisar los registros con Estado = "Pendiente"
- Cambiar estado de "Pendiente" a "Activo"
- Asignar el Plan_Semanal correspondiente (1-5 días)
- Marcar Membresia_Anual = "S" si corresponde
- Agregar Email si está disponible

### 4. Notificaciones
- Implementar envío de email automático al recibir inscripción
- Notificar al atleta cuando su inscripción sea aprobada

### 5. Panel de Administración
- Vista para que el coach revise inscripciones pendientes
- Botones para aprobar/editar directamente desde la interfaz

### 6. Documentos Requeridos
Según las reglas, se requieren:
- Consentimiento informado (físico)
- Certificado de EPS (virtual o físico)
- Cuestionario PAR-Q (virtual o físico)

**Sugerencia**: Agregar upload de documentos al formulario de inscripción

## Archivos Modificados

1. **index.html**
   - Agregado botón de inscripción en vista login
   - Nueva vista "view-register" con formulario completo
   - Modal "modalCondiciones" con reglas completas

2. **app.js**
   - `showModal()`: Muestra el modal de condiciones
   - `closeModal()`: Cierra el modal
   - `submitRegistration()`: Valida y envía inscripción
   - `calcularEdad()`: Calcula edad desde fecha de nacimiento
   - `limpiarFormularioRegistro()`: Limpia todos los campos
   - Event listener para cálculo automático de edad

3. **Code.gs**
   - Nueva acción en `doGet()` y `doPost()`: `registrarInscripcion`
   - Nueva función `registrarInscripcion()`: Agrega directamente a "Clientes" con estado "Pendiente"

4. **crear_excel.py**
   - Actualizada la hoja "Clientes" con 8 nuevas columnas:
     - Fecha_Nacimiento
     - Edad
     - Contacto
     - EPS
     - Acudiente
     - Contacto_Acudiente
     - Antecedentes
     - Objetivos
   - Datos dummy actualizados con información completa

## Testing

### Probar Inscripción:
1. **Regenerar el Excel**: Ejecutar `python3 crear_excel.py` para crear el archivo con las nuevas columnas
2. **Actualizar Google Sheets**: Subir/importar el nuevo Excel o agregar manualmente las columnas H a O
3. Abrir la aplicación web
4. Hacer clic en "Nueva Inscripción"
5. Completar todos los campos obligatorios
6. Seleccionar fecha de nacimiento (ver edad calculada)
7. Hacer clic en "condiciones y reglas" para ver el modal
8. Marcar el checkbox de consentimiento
9. Hacer clic en "Enviar Inscripción"
10. Verificar mensaje de éxito
11. Revisar Google Sheets hoja "Clientes"
12. Verificar que aparezca una nueva fila con:
    - Estado = "Pendiente"
    - Plan_Semanal = 0
    - Membresia_Anual = "N"
    - Todos los datos de inscripción en las columnas H-O

### Probar Validaciones:
- Intentar enviar sin completar campos obligatorios
- Intentar enviar sin marcar el checkbox
- Intentar registrar una cédula que ya existe en "Clientes"

### Probar Aprobación (Manual):
1. En Google Sheets, localizar la fila con Estado = "Pendiente"
2. Cambiar Estado a "Activo"
3. Asignar un Plan_Semanal (ej: 3)
4. Cambiar Membresia_Anual a "S" si corresponde
5. Agregar Email si está disponible
6. El atleta ahora podrá hacer login con su documento

## Diseño Responsive

El formulario es completamente responsive:
- **Mobile**: Formulario de una columna
- **Tablet/Desktop**: Ancho máximo de 900px, centrado
- **Modal**: Adaptable con scroll vertical en pantallas pequeñas

## Estilo Visual

- Diseño consistente con el resto de la aplicación
- Uso de Tailwind CSS
- Iconos de Lucide
- Colores de marca (navy-900, red-600)
- Sombras y bordes redondeados modernos

---

**Desarrollado para Internacional Box**  
Sistema de Gestión Deportiva 🥊
