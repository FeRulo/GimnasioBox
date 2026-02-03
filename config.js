/**
 * CONFIGURACIÓN DEL BACKEND
 * Reemplaza la URL con la de tu Google Apps Script Web App
 */

const CONFIG = {
    
    // URL de tu Web App de Google Apps Script
    // Ejemplo: 'https://script.google.com/macros/s/AKfycby.../exec'
    API_URL: 'https://script.google.com/macros/s/AKfycbxd_nKx9uNx9sLgbFe_DwyTwsVqSLMDayoYGSLJv3phFQdMBRX-7aKCdS35VZX9TA8/exec',
    
    // Configuración de la aplicación
    APP_NAME: 'Internacional Box',
    VERSION: '1.0.0',
    
    // Mensajes de error
    MESSAGES: {
        ERROR_CONEXION: 'Error de conexión. Verifica tu internet.',
        ERROR_SERVIDOR: 'Error en el servidor. Intenta más tarde.',
        ERROR_NO_AUTORIZADO: 'No tienes autorización para esta acción.'
    }
};

// Verificar si la API está configurada
console.log('🔧 CONFIG - API URL:', CONFIG.API_URL);
console.log('📍 Para probar la API, abre esta URL en tu navegador:');
console.log(CONFIG.API_URL + '?action=getHorarios&callback=test');
