/**
 * ARCHIVO DE EJEMPLO - Configuración privada
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a: config.private.gs
 * 2. Reemplaza 'TU_ID_DE_GOOGLE_SHEETS_AQUI' con el ID real de tu Google Sheets
 * 3. El ID se encuentra en la URL del Sheet: 
 *    https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
 * 4. Reemplaza 'TU_ID_DE_CARPETA_DRIVE_AQUI' con el ID de la carpeta "Soportes de Pago"
 * 5. Para obtener el ID de carpeta:
 *    a) Ve a Drive y crea/abre la carpeta "Soportes de Pago"
 *    b) Copia el ID de la URL: https://drive.google.com/drive/folders/[ESTE_ES_EL_ID]
 * 6. CAMBIA el SALT por un valor único y secreto (usa un generador de strings aleatorios)
 * 7. NO subas config.private.gs a Git (ya está en .gitignore)
 * 8. SÍ súbelo con clasp push (no está en .claspignore)
 */

// Reemplazar con el ID real de tu Google Sheets
const SHEET_ID = 'TU_ID_DE_GOOGLE_SHEETS_AQUI';

// Reemplazar con el ID de tu carpeta "Soportes de Pago" en Drive
const FOLDER_ID = 'TU_ID_DE_CARPETA_DRIVE_AQUI';

// SALT para hashing de contraseñas (CAMBIAR a un valor único y secreto)
// Este valor se usa para generar hashes seguros de contraseñas
// IMPORTANTE: Una vez establecido, NO cambiar o invalidarás todas las contraseñas
// Ejemplo: 'mi_gimnasio_salt_ultra_secreto_2026_xyz123'
const SALT = 'TU_SALT_SECRETO_AQUI';
