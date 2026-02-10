const app = {
    user: null,
    sessions: [],
    userReservations: [],

    // ========== LOADER ==========
    showLoader() {
        document.getElementById('loader').classList.remove('hidden');
    },

    hideLoader() {
        document.getElementById('loader').classList.add('hidden');
    },

    // ========== UTILIDADES DE API ==========
    async apiCall(action, params = {}) {
        try {
            // Verificar si la API está configurada
            if (!CONFIG.API_URL || CONFIG.API_URL === 'TU_URL_DE_WEB_APP_AQUI') {
                console.error('❌ API URL no configurada');
                this.notify('API no configurada. Revisa config.js', 'alert-triangle');
                return { success: false, error: 'API no configurada' };
            }

            // Usar text/plain para evitar preflight OPTIONS
            // Google Apps Script no soporta OPTIONS, pero sí POST con text/plain
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // ← Evita preflight CORS
                },
                body: JSON.stringify({
                    action: action,
                    ...params
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en apiCall:', error);
            this.notify(error.message || 'Error de conexión', 'wifi-off');
            return { success: false, error: error.message };
        }
    },

    // ========== LOGIN ==========
    async login() {
        const doc = document.getElementById('docInput').value;
        if(!doc) return this.notify("Ingresa tu documento", "alert-circle");

        const btn = document.getElementById('loginBtn');
        btn.innerText = "Verificando...";
        btn.classList.add('opacity-50');
        btn.disabled = true;
        this.showLoader();

        const result = await this.apiCall('login', { documento: doc });
        
        if (result.success) {
            const cliente = result.cliente;
            this.user = {
                doc: cliente.documento,
                name: cliente.nombre,
                email: cliente.email,
                tieneMembresia: cliente.tieneMembresiaAnual === 'SI',
                vencimientoMembresia: cliente.vencimientoMembresia,
                planActivo: cliente.tipoPlan || 'Sin Plan',
                creditsWeekly: cliente.creditosSemanales || 0,
                creditsUsed: cliente.creditosUsados || 0,
                creditsAvailable: cliente.creditosDisponibles || 0,
                estado: cliente.estado,
                puedeReservar: cliente.puedeReservar
            };
            
            // Solo actualizar UI básica, sin cargar datos adicionales
            this.syncUIBasic();
            this.changeView('main');
            this.notify(`¡Hola, ${cliente.nombre.split(' ')[0]}!`, "check-circle");
        } else {
            this.notify(result.error || "Cliente no encontrado", "x-circle");
        }
        
        this.hideLoader();
        btn.innerText = "Entrar al Sistema";
        btn.classList.remove('opacity-50');
        btn.disabled = false;
    },

    // ========== LOGIN ADMINISTRADOR ==========
    async loginAdmin() {
        const doc = document.getElementById('adminDocInput').value;
        const password = document.getElementById('adminPasswordInput').value;
        
        if(!doc) return this.notify("Ingresa tu documento", "alert-circle");
        if(!password) return this.notify("Ingresa tu contraseña", "alert-circle");

        const btn = document.getElementById('loginAdminBtn');
        btn.innerText = "Verificando credenciales...";
        btn.classList.add('opacity-50');
        btn.disabled = true;
        this.showLoader();

        const result = await this.apiCall('loginAdmin', { documento: doc, password: password });
        
        if (result.success) {
            const admin = result.data;
            this.user = {
                doc: admin.documento,
                name: admin.nombre,
                email: admin.email,
                rol: admin.rol,
                esAdmin: true,
                token: admin.token,
                tokenExpira: Date.now() + admin.expiraEn,
                // Valores por defecto para admin
                tieneMembresia: true,
                vencimientoMembresia: '',
                planActivo: 'Administrador',
                creditsWeekly: '∞',
                creditsUsed: 0,
                creditsAvailable: '∞',
                estado: 'Activo',
                puedeReservar: true
            };
            
            // Guardar token en localStorage
            localStorage.setItem('adminToken', admin.token);
            localStorage.setItem('adminDoc', admin.documento);
            localStorage.setItem('tokenExpira', this.user.tokenExpira);
            
            // Actualizar UI
            this.syncUIBasic();
            this.changeView('main');
            
            // Mostrar botón de admin
            document.getElementById('adminPanelBtn').classList.remove('hidden');
            
            this.notify(`¡Bienvenido, ${admin.nombre.split(' ')[0]}!`, "shield-check");
        } else {
            this.notify(result.error || "Credenciales inválidas", "x-circle");
        }
        
        this.hideLoader();
        btn.innerText = "🔐 Acceder como Admin";
        btn.classList.remove('opacity-50');
        btn.disabled = false;
    },

    // Verificar si hay sesión de admin activa al cargar
    checkAdminSession() {
        const token = localStorage.getItem('adminToken');
        const doc = localStorage.getItem('adminDoc');
        const expira = parseInt(localStorage.getItem('tokenExpira'));
        
        if (token && doc && expira > Date.now()) {
            // Token válido, restaurar sesión
            return { token, doc };
        } else {
            // Token expirado o no existe
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminDoc');
            localStorage.removeItem('tokenExpira');
            return null;
        }
    },

    // ========== FUNCIONES DE ADMINISTRACIÓN ==========
    async agregarClase() {
        if (!this.user || !this.user.esAdmin) {
            return this.notify("No tienes permisos de administrador", "x-circle");
        }

        const fecha = document.getElementById('adminFecha').value;
        const hora = document.getElementById('adminHora').value;
        const tipo = document.getElementById('adminTipo').value;
        const coach = document.getElementById('adminCoach').value;
        const duracion = document.getElementById('adminDuracion').value;
        const cuposMax = document.getElementById('adminCupos').value;

        if (!fecha || !hora || !tipo || !coach || !duracion || !cuposMax) {
            return this.notify("Completa todos los campos", "alert-circle");
        }

        this.showLoader();
        const result = await this.apiCall('agregarClase', {
            documento: this.user.doc,
            token: this.user.token,
            fecha: fecha,
            hora: hora,
            tipo: tipo,
            coach: coach,
            duracion: duracion,
            cuposMax: parseInt(cuposMax)
        });

        if (result.success) {
            this.notify("Clase agregada exitosamente", "check-circle");
            // Limpiar formulario
            document.getElementById('adminFecha').value = '';
            document.getElementById('adminHora').value = '';
            document.getElementById('adminCupos').value = '8';
            // Recargar lista de clases
            this.cargarClasesAdmin();
        } else {
            this.notify(result.error || "Error al agregar clase", "x-circle");
        }
        this.hideLoader();
    },

    async eliminarClase(idClase) {
        if (!this.user || !this.user.esAdmin) {
            return this.notify("No tienes permisos de administrador", "x-circle");
        }

        if (!confirm('¿Seguro que deseas eliminar esta clase?')) {
            return;
        }

        this.showLoader();
        const result = await this.apiCall('eliminarClase', {
            documento: this.user.doc,
            token: this.user.token,
            idClase: idClase
        });

        if (result.success) {
            this.notify("Clase eliminada exitosamente", "check-circle");
            this.cargarClasesAdmin();
        } else {
            this.notify(result.error || "Error al eliminar clase", "x-circle");
        }
        this.hideLoader();
    },

    async cargarClasesAdmin() {
        if (!this.user || !this.user.esAdmin) return;

        const result = await this.apiCall('getHorarios', { 
            documento: this.user.doc,
            fecha: new Date().toISOString().split('T')[0]
        });

        if (result.success) {
            const container = document.getElementById('adminClasesList');
            if (result.horarios.length === 0) {
                container.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">No hay clases próximas</p>';
                return;
            }

            container.innerHTML = result.horarios.map(h => `
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div class="flex-grow">
                        <p class="text-sm font-bold text-navy-900">${h.tipo} - ${h.coach}</p>
                        <p class="text-xs text-gray-500">${h.fecha} a las ${h.hora}</p>
                        <p class="text-xs text-gray-400">Cupos: ${h.cuposLibres}/${h.cuposMax}</p>
                    </div>
                    <button onclick="app.eliminarClase('${h.id}')" class="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4 text-red-600"></i>
                    </button>
                </div>
            `).join('');
            lucide.createIcons();
        }
    },

    // ========== CALENDARIO SEMANAL DE ADMINISTRACIÓN ==========
    actualizarTamañoBloques() {
        const duracion = document.getElementById('adminDuracionDefault').value;
        
        // Regenerar el calendario con los horarios apropiados
        this.generarCalendarioSemanal(duracion);
        
        this.notify(`Bloques ajustados a ${duracion === '60' ? '1 hora' : '1.5 horas'}`, 'settings');
    },

    generarCalendarioSemanal(duracion = '90') {
        const container = document.getElementById('calendarBody');
        
        // Definir horarios según duración
        const horarios = duracion === '60' 
            ? ['05:30', '06:30', '07:30', '08:30', '09:30', '10:30', '11:30', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00']
            : ['05:30', '07:00', '08:30', '10:00', '11:30', '01:00', '02:30', '04:00', '05:30', '07:00'];
        
        const horariosCompletos = duracion === '60'
            ? ['05:30 AM', '06:30 AM', '07:30 AM', '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM']
            : ['05:30 AM', '07:00 AM', '08:30 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'];
        
        const alturaBloque = duracion === '60' ? 'h-8' : 'h-12';
        
        let html = '';
        let insertarAlmuerzo = false;
        
        horarios.forEach((hora, index) => {
            // Insertar fila de almuerzo antes de la 1:00 PM
            if (hora === '01:00' && !insertarAlmuerzo) {
                html += `
                    <tr class="border-b border-gray-300 bg-gray-200">
                        <td colspan="7" class="p-2 text-center text-[10px] font-bold text-gray-500 uppercase">⏸️ Almuerzo (12:00 - 1:00 PM)</td>
                    </tr>`;
                insertarAlmuerzo = true;
            }
            
            html += `
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="p-2 text-[10px] font-bold text-gray-700 border-r border-gray-200 sticky left-0 bg-white">${hora}</td>
                    <td class="p-1 border-r border-gray-100"><div onclick="app.toggleClaseTipo(this, 0, '${horariosCompletos[index]}')" class="${alturaBloque} rounded cursor-pointer border-2 border-gray-300 bg-gray-50 hover:border-purple-400 transition-all" data-tipo=""></div></td>
                    <td class="p-1 border-r border-gray-100"><div onclick="app.toggleClaseTipo(this, 1, '${horariosCompletos[index]}')" class="${alturaBloque} rounded cursor-pointer border-2 border-gray-300 bg-gray-50 hover:border-purple-400 transition-all" data-tipo=""></div></td>
                    <td class="p-1 border-r border-gray-100"><div onclick="app.toggleClaseTipo(this, 2, '${horariosCompletos[index]}')" class="${alturaBloque} rounded cursor-pointer border-2 border-gray-300 bg-gray-50 hover:border-purple-400 transition-all" data-tipo=""></div></td>
                    <td class="p-1 border-r border-gray-100"><div onclick="app.toggleClaseTipo(this, 3, '${horariosCompletos[index]}')" class="${alturaBloque} rounded cursor-pointer border-2 border-gray-300 bg-gray-50 hover:border-purple-400 transition-all" data-tipo=""></div></td>
                    <td class="p-1 border-r border-gray-100"><div onclick="app.toggleClaseTipo(this, 4, '${horariosCompletos[index]}')" class="${alturaBloque} rounded cursor-pointer border-2 border-gray-300 bg-gray-50 hover:border-purple-400 transition-all" data-tipo=""></div></td>
                    <td class="p-1"><div onclick="app.toggleClaseTipo(this, 5, '${horariosCompletos[index]}')" class="${alturaBloque} rounded cursor-pointer border-2 border-gray-300 bg-gray-50 hover:border-purple-400 transition-all" data-tipo=""></div></td>
                </tr>`;
        });
        
        container.innerHTML = html;
        this.actualizarContadorClases();
    },

    toggleClaseTipo(element, diaIndex, hora) {
        const tipos = ['', 'Boxeo', 'Funcional', 'Fisio'];
        const estilos = [
            { border: 'border-gray-300', bg: 'bg-gray-50' }, // Vacío
            { border: 'border-red-500', bg: 'bg-red-100' },  // Boxeo
            { border: 'border-blue-500', bg: 'bg-blue-100' }, // Funcional
            { border: 'border-green-500', bg: 'bg-green-100' } // Fisio
        ];

        // Obtener tipo actual
        const tipoActual = element.getAttribute('data-tipo');
        const indexActual = tipos.indexOf(tipoActual);
        
        // Ciclar al siguiente tipo
        const nuevoIndex = (indexActual + 1) % tipos.length;
        const nuevoTipo = tipos[nuevoIndex];
        
        // Actualizar atributo
        element.setAttribute('data-tipo', nuevoTipo);
        
        // Preservar altura actual (h-8 o h-12)
        const tieneH8 = element.classList.contains('h-8');
        const tieneH12 = element.classList.contains('h-12');
        
        // Limpiar estilos anteriores de border y background
        estilos.forEach(estilo => {
            element.classList.remove(estilo.border, estilo.bg);
        });
        
        // Aplicar nuevos estilos
        element.classList.add('border-2', estilos[nuevoIndex].border, estilos[nuevoIndex].bg);
        
        // Restaurar altura si fue removida
        if (tieneH8 && !element.classList.contains('h-8')) {
            element.classList.add('h-8');
        } else if (tieneH12 && !element.classList.contains('h-12')) {
            element.classList.add('h-12');
        }
        
        // Actualizar contador
        this.actualizarContadorClases();
    },

    actualizarContadorClases() {
        const celdas = document.querySelectorAll('#calendarBody div[data-tipo]');
        const total = Array.from(celdas).filter(c => c.getAttribute('data-tipo') !== '').length;
        document.getElementById('clasesCounter').textContent = total;
    },

    async guardarHorariosSemanal() {
        if (!this.user || !this.user.esAdmin) {
            return this.notify("No tienes permisos de administrador", "x-circle");
        }

        const fechaInicio = document.getElementById('adminSemanaInicio').value;
        const coach = document.getElementById('adminCoachDefault').value;
        const duracion = document.getElementById('adminDuracionDefault').value;
        const cuposMax = parseInt(document.getElementById('adminCuposDefault').value);

        if (!fechaInicio) {
            return this.notify("Selecciona la fecha de inicio (lunes)", "alert-circle");
        }

        // Validar que sea un lunes
        const fecha = new Date(fechaInicio + 'T00:00:00');
        if (fecha.getDay() !== 1) {
            return this.notify("La fecha debe ser un lunes", "alert-circle");
        }

        if (!coach) {
            return this.notify("Ingresa el nombre del coach", "alert-circle");
        }

        // Obtener horarios según duración seleccionada
        const horariosCompletos = duracion === '60'
            ? ['05:30 AM', '06:30 AM', '07:30 AM', '08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM']
            : ['05:30 AM', '07:00 AM', '08:30 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'];
        
        const clases = [];
        const rows = document.querySelectorAll('#calendarBody tr:not(.bg-gray-200)');
        
        rows.forEach((row, rowIndex) => {
            const celdas = row.querySelectorAll('td:not(.sticky)');
            celdas.forEach((celda, diaIndex) => {
                const bloque = celda.querySelector('div[data-tipo]');
                const tipo = bloque?.getAttribute('data-tipo');
                
                if (tipo && tipo !== '') {
                    // Calcular fecha exacta
                    const fechaClase = new Date(fecha);
                    fechaClase.setDate(fechaClase.getDate() + diaIndex);
                    const fechaStr = fechaClase.toISOString().split('T')[0];
                    
                    clases.push({
                        fecha: fechaStr,
                        hora: horariosCompletos[rowIndex],
                        tipo: tipo,
                        coach: coach,
                        duracion: duracion === '60' ? '60 min' : '90 min',
                        cuposMax: cuposMax
                    });
                }
            });
        });

        if (clases.length === 0) {
            return this.notify("Debes seleccionar al menos una clase", "alert-circle");
        }

        if (!confirm(`¿Crear ${clases.length} clases para la semana del ${fechaInicio}?`)) {
            return;
        }

        this.showLoader();
        const result = await this.apiCall('guardarHorariosMasivo', {
            documento: this.user.doc,
            token: this.user.token,
            clases: clases
        });

        if (result.success) {
            this.notify(`✅ ${result.clasesCreadas} clases creadas exitosamente`, "check-circle");
            this.limpiarCalendario();
        } else {
            this.notify(result.error || "Error al guardar horarios", "x-circle");
        }
        this.hideLoader();
    },

    limpiarCalendario() {
        const duracion = document.getElementById('adminDuracionDefault').value;
        this.generarCalendarioSemanal(duracion);
        this.notify("Calendario limpiado", "check-circle");
    },

    async loadHorarios() {
        if (this.sessions.length > 0) return; // Ya están cargados
        
        this.showLoader();
        const horariosResult = await this.apiCall('getHorarios', { documento: this.user.doc ,debug:true});
        if (horariosResult.success) {
            this.sessions = horariosResult.horarios.map(h => ({
                id: h.id,
                type: h.tipo,
                coach: h.coach,
                time: h.hora,
                date: h.fecha,
                dur: h.duracion,
                spots: h.cuposLibres
            }));
            this.renderBooking();
        }
        this.hideLoader();
    },

    async loadReservas() {
        this.showLoader();
        const reservasResult = await this.apiCall('getReservas', { documento: this.user.doc });
        if (reservasResult.success) {
            this.userReservations = reservasResult.reservas.map(r => ({
                id: r.idClase,
                idReserva: r.idReserva,
                type: r.claseInfo.tipo,
                coach: r.claseInfo.coach,
                time: r.claseInfo.hora,
                date: r.claseInfo.fecha,
                dur: r.claseInfo.duracion
            }));
            this.renderUserSessions();
        }
        this.hideLoader();
    },

    logout() {
        if (confirm('¿Seguro que deseas cerrar sesión?')) {
            this.user = null;
            this.sessions = [];
            this.userReservations = [];
            document.getElementById('docInput').value = '';
            
            // Limpiar tokens de admin
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminDoc');
            localStorage.removeItem('tokenExpira');
            
            // Ocultar botón de admin
            document.getElementById('adminPanelBtn').classList.add('hidden');
            
            this.changeView('login');
            this.notify('Sesión cerrada correctamente', 'log-out');
        }
    },

    goHome() {
        if (this.user) {
            this.changeView('main');
        }
    },

    syncUIBasic() {
        // Solo actualiza la UI básica sin cargar datos de la API
        if (this.user.esAdmin) {
            document.getElementById('creditsCount').innerHTML = '<span class="text-purple-600">∞</span>';
            document.getElementById('creditsLimit').innerHTML = '<span class="text-purple-400">∞</span>';
        } else {
            document.getElementById('creditsCount').innerText = this.user.creditsUsed;
            document.getElementById('creditsLimit').innerText = this.user.creditsWeekly;
        }
        
        // Badge de membresía + plan
        let badgeText = '';
        if (this.user.esAdmin) {
            badgeText = '👑 ADMINISTRADOR';
        } else if (this.user.tieneMembresia) {
            badgeText = `Membresía Activa | ${this.user.planActivo}`;
        } else {
            badgeText = 'Sin Membresía';
        }
        document.getElementById('badgeMembresia').innerText = badgeText;
        document.getElementById('userTag').innerText = "ID: " + this.user.doc;
        
        // Mostrar/ocultar botón de admin
        if (this.user.esAdmin) {
            document.getElementById('adminPanelBtn').classList.remove('hidden');
        } else {
            document.getElementById('adminPanelBtn').classList.add('hidden');
        }
    },

    syncUI() {
        // Actualiza UI completa con datos
        this.syncUIBasic();
        this.renderBooking();
        this.renderUserSessions();
    },

    changeView(viewId) {
        const target = document.getElementById('view-' + viewId);
        if (target) {
            // Ocultar todas las vistas
            document.querySelectorAll('.view').forEach(v => {
                v.classList.remove('active');
            });
            // Mostrar solo la vista activa
            target.classList.add('active');
            
            // Si es la vista de registro, mostrar modal obligatorio
            if (viewId === 'register') {
                setTimeout(() => this.showModal(), 300);
            }
            
            // Cargar datos solo cuando se necesitan
            if (viewId === 'booking') {
                // Siempre recargar para tener datos actualizados
                this.sessions = [];
                this.loadHorarios();
            } else if (viewId === 'sessions') {
                this.loadReservas();
            } else if (viewId === 'payments') {
                this.setupPaymentOptions();
            } else if (viewId === 'admin-panel') {
                // Inicializar fecha al próximo lunes
                const hoy = new Date();
                const diaSemana = hoy.getDay();
                const diasHastaLunes = diaSemana === 0 ? 1 : (diaSemana === 1 ? 0 : 8 - diaSemana);
                const proximoLunes = new Date(hoy);
                proximoLunes.setDate(hoy.getDate() + diasHastaLunes);
                
                const fechaStr = proximoLunes.toISOString().split('T')[0];
                document.getElementById('adminSemanaInicio').value = fechaStr;
                
                // Generar calendario con duración por defecto (90 min)
                setTimeout(() => {
                    const duracion = document.getElementById('adminDuracionDefault').value;
                    this.generarCalendarioSemanal(duracion);
                }, 100);
            }
            
            lucide.createIcons();
            window.scrollTo(0, 0);
        }
    },

    renderBooking() {
        const list = document.getElementById('bookingList');
        
        if (this.sessions.length === 0) {
            list.innerHTML = `<div class="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">Cargando horarios disponibles...</div>`;
            return;
        }
        
        // Agrupar sesiones por fecha
        const sessionsByDate = {};
        this.sessions.forEach(s => {
            if (!sessionsByDate[s.date]) {
                sessionsByDate[s.date] = [];
            }
            sessionsByDate[s.date].push(s);
        });
        
        // Renderizar por fecha
        let html = '';
        Object.keys(sessionsByDate).sort().forEach(date => {
            // Crear fecha sin conversión de timezone (usar componentes locales)
            const [year, month, day] = date.split('-');
            const dateObj = new Date(year, month - 1, day);
            const options = { weekday: 'long', day: 'numeric', month: 'long' };
            const formattedDate = dateObj.toLocaleDateString('es-ES', options);
            
            html += `
                <div class="col-span-full mb-4 mt-6 first:mt-0">
                    <div class="flex items-center gap-3">
                        <div class="h-[2px] flex-grow bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <h3 class="text-sm font-black text-navy-900 uppercase tracking-wider px-3">${formattedDate}</h3>
                        <div class="h-[2px] flex-grow bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    </div>
                </div>
            `;
            
            sessionsByDate[date].forEach(s => {
                html += `
                    <div class="bg-white p-5 rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm">
                        <div class="flex items-center gap-4">
                            <div class="text-center min-w-[60px] p-2 bg-gray-50 rounded-xl">
                                <span class="block text-xs font-black">${s.time}</span>
                                <span class="text-[8px] font-bold text-gray-400 uppercase">${s.dur}</span>
                            </div>
                            <div>
                                <p class="text-sm font-bold">${s.type} <span class="text-gray-400 font-normal">/ ${s.coach}</span></p>
                                <p class="text-[10px] font-bold ${s.spots > 0 ? 'text-green-600' : 'text-red-500'}">
                                    ${s.spots > 0 ? s.spots + ' Cupos Libres' : 'Clase Llena'}
                                </p>
                            </div>
                        </div>
                        <button onclick="app.book('${s.id}')" 
                            class="${s.spots > 0 ? 'bg-navy-900 shadow-navy-900/10' : 'bg-gray-200 cursor-not-allowed'} text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg"
                            ${s.spots === 0 ? 'disabled' : ''}>
                            RESERVAR
                        </button>
                    </div>
                `;
            });
        });
        
        list.innerHTML = html;
    },

    renderUserSessions() {
        const list = document.getElementById('userSessionsList');
        if (this.userReservations.length === 0) {
            list.innerHTML = `<div class="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">No tienes reservas activas</div>`;
            return;
        }

        // Agrupar reservas por fecha
        const reservationsByDate = {};
        this.userReservations.forEach(s => {
            if (!reservationsByDate[s.date]) {
                reservationsByDate[s.date] = [];
            }
            reservationsByDate[s.date].push(s);
        });
        
        // Renderizar por fecha
        let html = '';
        Object.keys(reservationsByDate).sort().forEach(date => {
            // Crear fecha sin conversión de timezone (usar componentes locales)
            const [year, month, day] = date.split('-');
            const dateObj = new Date(year, month - 1, day);
            const options = { weekday: 'long', day: 'numeric', month: 'long' };
            const formattedDate = dateObj.toLocaleDateString('es-ES', options);
            
            html += `
                <div class="col-span-full mb-4 mt-6 first:mt-0">
                    <div class="flex items-center gap-3">
                        <div class="h-[2px] flex-grow bg-gradient-to-r from-transparent via-navy-200 to-transparent"></div>
                        <h3 class="text-sm font-black text-navy-900 uppercase tracking-wider px-3">${formattedDate}</h3>
                        <div class="h-[2px] flex-grow bg-gradient-to-r from-transparent via-navy-200 to-transparent"></div>
                    </div>
                </div>
            `;
            
            reservationsByDate[date].forEach(s => {
                const canCancel = this.checkCancellable(s.date, s.time);
                html += `
                    <div class="bg-white p-5 rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm">
                        <div class="flex items-center gap-4">
                            <div class="text-center min-w-[60px] p-2 bg-navy-50 rounded-xl">
                                <span class="block text-xs font-black text-navy-900">${s.time}</span>
                                <span class="text-[8px] font-bold text-navy-400 uppercase">${s.dur}</span>
                            </div>
                            <div>
                                <p class="text-sm font-bold">${s.type} con ${s.coach}</p>
                                <p class="text-[10px] font-bold text-gray-400">${s.dur}</p>
                            </div>
                        </div>
                        ${canCancel ? 
                            `<button onclick="app.cancelReserva('${s.idReserva}')" class="text-red-600 border border-red-100 bg-red-50 text-[10px] font-black px-4 py-2 rounded-xl">CANCELAR</button>` : 
                            `<span class="text-[9px] font-bold text-gray-300 uppercase">Bloqueado</span>`
                        }
                    </div>
                `;
            });
        });
        
        list.innerHTML = html;
    },

    async book(idClase) {
        const session = this.sessions.find(s => s.id === idClase);
        if(!session) return this.notify("Clase no encontrada", "x-circle");
        if(session.spots === 0) return this.notify("Esta clase ya no tiene cupos", "x-circle");
        if(this.user.creditsAvailable <= 0) return this.notify("No tienes créditos disponibles", "lock");
        if(this.userReservations.find(r => r.id === idClase)) return this.notify("Ya estás inscrito en esta clase", "info");

        this.showLoader();
        
        const result = await this.apiCall('reservar', {
            documento: this.user.doc,
            idClase: idClase
        }, 'POST');
        
        if (result.success) {
            // Actualizar créditos localmente
            this.user.creditsUsed++;
            this.user.creditsAvailable--;
            this.syncUIBasic();
            
            // Recargar solo los horarios y reservas
            await this.loadHorarios();
            await this.loadReservas();
            this.notify("¡Reserva exitosa! Te esperamos.", "check");
            this.changeView('main');
        } else {
            this.notify(result.error || "Error al reservar", "x-circle");
        }
        this.hideLoader();
    },

    async cancelReserva(idReserva) {
        if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
        
        this.showLoader();
        
        const result = await this.apiCall('cancelarReserva', {
            documento: this.user.doc,
            idReserva: idReserva
        }, 'POST');
        
        if (result.success) {
            // Actualizar créditos localmente
            this.user.creditsUsed--;
            this.user.creditsAvailable++;
            this.syncUIBasic();
            
            // Recargar solo los horarios y reservas
            await this.loadHorarios();
            await this.loadReservas();
            this.notify("Reserva cancelada correctamente", "trash-2");
        } else {
            this.notify(result.error || "Error al cancelar", "x-circle");
        }
        this.hideLoader();
    },

    checkCancellable(dateStr, timeStr) {
        // Lógica de 3 horas de anticipación
        const classDate = new Date(`${dateStr} ${timeStr}`);
        const now = new Date();
        const diffMs = classDate - now;
        const diffHrs = diffMs / (1000 * 60 * 60);
        return diffHrs >= 3;
    },

    setupPaymentOptions() {
        const payTypeSelect = document.getElementById('payType');
        const options = payTypeSelect.querySelectorAll('option');
        const warningDiv = document.getElementById('paymentWarning');
        
        // Verificar si tiene membresía activa
        const tieneMembresia = this.user && this.user.tieneMembresia;
        
        options.forEach(option => {
            const value = option.value;
            // Deshabilitar planes mensuales si no tiene membresía
            if (value.startsWith('Plan_Mensual_')) {
                if (!tieneMembresia) {
                    option.disabled = true;
                    // Solo agregar texto si no está ya presente
                    if (!option.textContent.includes('(Requiere membresía activa)')) {
                        option.textContent = option.textContent.replace(' - $', ' (Requiere membresía activa) - $');
                    }
                } else {
                    option.disabled = false;
                    // Remover texto si está presente
                    if (option.textContent.includes('(Requiere membresía activa)')) {
                        option.textContent = option.textContent.replace(' (Requiere membresía activa)', '');
                    }
                }
            }
        });
        
        // Mostrar u ocultar mensaje de advertencia
        if (warningDiv) {
            if (!tieneMembresia) {
                warningDiv.classList.remove('hidden');
            } else {
                warningDiv.classList.add('hidden');
            }
        }
        
        lucide.createIcons();
    },

    updatePaymentAmount() {
        const tipoPago = document.getElementById('payType').value;
        const amountContainer = document.getElementById('payAmountContainer');
        const amountDisplay = document.getElementById('payAmountDisplay');
        
        const montos = {
            'Inscripcion_Membresia_Anual': 35000,
            'Plan_Mensual_1dia': 115000,
            'Plan_Mensual_2dias': 145000,
            'Plan_Mensual_3dias': 175000,
            'Plan_Mensual_4dias': 205000,
            'Plan_Mensual_5dias': 235000,
            'Clase_Individual': 45000
        };
        
        if (tipoPago && montos[tipoPago]) {
            amountContainer.classList.remove('hidden');
            amountDisplay.innerText = '$' + montos[tipoPago].toLocaleString('es-CO');
        } else {
            amountContainer.classList.add('hidden');
            amountDisplay.innerText = '$0';
        }
        
        lucide.createIcons();
    },

    async sendPayment() {
        const tipoPago = document.getElementById('payType').value;
        if(!tipoPago) return this.notify("Debes seleccionar el tipo de pago", "alert-circle");
        
        const file = document.getElementById('payFile').files[0];   
        if(!file) return this.notify("Debes adjuntar la imagen del pago", "camera");

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            return this.notify("Solo se permiten archivos de imagen", "alert-circle");
        }

        // Validar tamaño máximo (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return this.notify("La imagen no puede superar 5MB", "alert-circle");
        }
        
        // Obtener monto según tipo de pago
        const montos = {
            'Inscripcion_Membresia_Anual': 35000,
            'Plan_Mensual_1dia': 115000,
            'Plan_Mensual_2dias': 145000,
            'Plan_Mensual_3dias': 175000,
            'Plan_Mensual_4dias': 205000,
            'Plan_Mensual_5dias': 235000,
            'Clase_Individual': 45000
        };
        
        const monto = montos[tipoPago] || 0;

        const btn = document.getElementById('sendPayBtn');
        btn.innerText = "Subiendo imagen...";
        btn.disabled = true;
        this.showLoader();

        try {
            // Convertir imagen a base64
            const base64 = await this.fileToBase64(file);
            
            const result = await this.apiCall('registrarPago', {
                documento: this.user.doc,
                tipoPago: tipoPago,
                monto: monto,
                imagenBase64: base64,
                nombreArchivo: file.name,
                mimeType: file.type
            }, 'POST');
            
            if (result.success) {
                this.notify("Soporte enviado. El coach validará tu pago.", "check-circle");
                this.limpiarArchivo();
                this.changeView('main');
            } else {
                console.error('Error al enviar pago:', result.error);
                this.notify(result.error || "Error al enviar el pago", "x-circle");
            }
        } catch (error) {
            console.log(error);
            this.notify("Error al procesar la imagen: " + error.message, "x-circle");
        }
        
        this.hideLoader();
        btn.innerText = "Enviar Comprobante";
        btn.disabled = false;
    },

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Extraer solo la parte base64 (sin el prefijo data:image/...;base64,)
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },

    mostrarNombreArchivo(input) {
        const preview = document.getElementById('payFilePreview');
        const fileName = document.getElementById('payFileName');
        const fileSize = document.getElementById('payFileSize');
        
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const isValid = file.size <= 5 * 1024 * 1024;
            
            fileName.textContent = file.name;
            fileSize.textContent = `${sizeMB} MB ${isValid ? '' : '- Excede el límite de 5MB'}`;
            
            // Cambiar colores según validación
            if (isValid) {
                preview.querySelector('div').className = 'flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl';
                fileSize.className = 'text-blue-600 text-[10px]';
            } else {
                preview.querySelector('div').className = 'flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl';
                fileSize.className = 'text-red-600 text-[10px] font-bold';
            }
            
            preview.classList.remove('hidden');
            lucide.createIcons();
        } else {
            preview.classList.add('hidden');
        }
    },

    limpiarArchivo() {
        document.getElementById('payFile').value = '';
        document.getElementById('payFilePreview').classList.add('hidden');
        document.getElementById('payType').value = '';
        document.getElementById('payAmountContainer').classList.add('hidden');
        document.getElementById('payAmountDisplay').innerText = '$0';
        lucide.createIcons();
    },

    notify(msg, iconName) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMsg');
        const iconEl = document.getElementById('toastIcon');
        
        msgEl.innerText = msg;
        iconEl.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i>`;
        lucide.createIcons();
        
        toast.style.transform = "translate( -50%, -40px)";
        setTimeout(() => {
            toast.style.transform = "translate( -50%, 200px)";
        }, 3500);
    },

    // ========== MODAL DE CONDICIONES ==========
    showModal(readOnly = false) {
        const modal = document.getElementById('modalCondiciones');
        const modalContent = document.getElementById('modalContent');
        const scrollBar = document.getElementById('scrollBar');
        const scrollMessage = document.getElementById('scrollMessage');
        const btnCerrar = document.getElementById('btnCerrarModal');
        const lugarCodigo = document.getElementById('codigoOculto');
        
        // Modo de solo lectura: sin validación ni tracking
        if (readOnly) {
            lugarCodigo.innerHTML = '';
            scrollBar.style.width = '100%';
            scrollMessage.textContent = '';
            btnCerrar.disabled = false;
            this.modalLeido = false;
            this.codigoActual = null;
            modal.classList.remove('hidden');
            lucide.createIcons();
            return;
        }
        
        // Modo registro: con validación completa
        // Generar frase oculta aleatoria (estilo cláusula Van Halen)
        const frasesOcultas = [
            'GUANTES AZULES',
            'TOALLA ROJA',
            'CAMPEON 2026',
            'SALTO DE CUERDA',
            'AGUA FRIA',
            'VENDAS NEGRAS',
            'TIMBRE DORADO',
            'GOLPE PERFECTO',
            'FOCO MENTAL',
            'VICTORIA ASEGURADA',
            'FUERZA MAXIMA',
            'ROUND FINAL'
        ];
        
        const fraseAleatoria = frasesOcultas[Math.floor(Math.random() * frasesOcultas.length)];
        
        // Insertar la frase oculta en el texto de condiciones
        lugarCodigo.innerHTML = `<span class="inline-block bg-red-100 border-2 border-red-500 px-3 py-1 rounded-lg font-black text-red-600 animate-pulse">📌 FRASE DE VERIFICACIÓN: ${fraseAleatoria}</span>`;
        
        this.codigoActual = fraseAleatoria;
        this.modalLeido = false;
        
        modal.classList.remove('hidden');
        
        // Scroll tracking
        modalContent.addEventListener('scroll', () => {
            const scrollTop = modalContent.scrollTop;
            const scrollHeight = modalContent.scrollHeight - modalContent.clientHeight;
            const scrollPercentage = (scrollTop / scrollHeight) * 100;
            
            scrollBar.style.width = scrollPercentage + '%';
            
            // Si llegó al 95% del scroll
            if (scrollPercentage >= 95) {
                scrollMessage.textContent = '✅ Has leído todo el documento';
                scrollMessage.classList.remove('text-red-600');
                scrollMessage.classList.add('text-green-600');
                btnCerrar.disabled = false;
                this.modalLeido = true;
            }
        });
        
        lucide.createIcons();
    },

    closeModal() {
        const modal = document.getElementById('modalCondiciones');
        modal.classList.add('hidden');
        
        // Si ya leyó todo el modal, habilitar el input de verificación
        if (this.modalLeido) {
            const inputVerif = document.getElementById('inputVerificacion');
            const mensajeScroll = document.getElementById('mensajeScroll');
            
            inputVerif.disabled = false;
            mensajeScroll.textContent = '🔍 Busca la frase marcada en rojo y escríbela exactamente';
            mensajeScroll.classList.remove('text-red-600');
            mensajeScroll.classList.add('text-blue-600');
            
            // Validar frase en tiempo real (sin distinguir mayúsculas/minúsculas)
            inputVerif.addEventListener('input', () => {
                const valorIngresado = inputVerif.value.toUpperCase().trim();
                const codigoEsperado = this.codigoActual.toUpperCase().trim();
                
                if (valorIngresado === codigoEsperado) {
                    document.getElementById('regConsent').disabled = false;
                    mensajeScroll.textContent = '✅ ¡Frase correcta! Ya puedes marcar el checkbox';
                    mensajeScroll.classList.remove('text-blue-600');
                    mensajeScroll.classList.add('text-green-600');
                    inputVerif.classList.add('border-green-500', 'bg-green-50');
                } else {
                    document.getElementById('regConsent').disabled = true;
                    inputVerif.classList.remove('border-green-500', 'bg-green-50');
                }
            });
        }
    },

    // ========== REGISTRO DE NUEVO ATLETA ==========
    async submitRegistration() {
        // Validar campos requeridos
        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const fechaNac = document.getElementById('regFechaNac').value.trim();
        const contacto = document.getElementById('regContacto').value.trim();
        const cedula = document.getElementById('regCedula').value.trim();
        const eps = document.getElementById('regEPS').value.trim();
        const objetivos = document.getElementById('regObjetivos').value;
        const consent = document.getElementById('regConsent').checked;

        // Validaciones
        if (!nombre) return this.notify("El nombre completo es requerido", "alert-circle");
        if (!email) return this.notify("El correo electrónico es requerido", "alert-circle");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return this.notify("El correo no es válido", "alert-circle");
        if (!fechaNac) return this.notify("La fecha de nacimiento es requerida", "alert-circle");
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fechaNac)) return this.notify("Formato de fecha inválido (usa DD/MM/AAAA)", "alert-circle");
        if (!contacto) return this.notify("El contacto es requerido", "alert-circle");
        if (!cedula) return this.notify("La cédula es requerida", "alert-circle");
        if (!eps) return this.notify("La EPS es requerida", "alert-circle");
        if (!objetivos) return this.notify("Debes seleccionar un objetivo", "alert-circle");
        
        // Validar campo "Otro" si fue seleccionado
        const objetivoOtro = document.getElementById('regObjetivoOtro').value.trim();
        if (objetivos === 'Otro' && !objetivoOtro) {
            return this.notify("Debes especificar tu objetivo personalizado", "alert-circle");
        }
        
        if (!consent) return this.notify("Debes aceptar las condiciones", "alert-circle");

        // Campos opcionales
        const contactoEmergencia = document.getElementById('regContactoEmergencia').value.trim();
        const telEmergencia = document.getElementById('regTelEmergencia').value.trim();
        const antecedentes = document.getElementById('regAntecedentes').value.trim();

        const btn = document.getElementById('registerBtn');
        btn.innerText = "Enviando inscripción...";
        btn.disabled = true;
        this.showLoader();

        // Enviar datos al backend (la edad se calculará en Excel)
        const result = await this.apiCall('registrarInscripcion', {
            nombre: nombre,
            email: email,
            fechaNacimiento: fechaNac,
            contacto: contacto,
            cedula: cedula,
            eps: eps,
            contactoEmergencia: contactoEmergencia,
            telEmergencia: telEmergencia,
            antecedentes: antecedentes,
            objetivos: objetivos,
            objetivoOtro: objetivoOtro
        }, 'POST');

        this.hideLoader();
        btn.innerText = "✅ Enviar Inscripción";
        btn.disabled = false;

        if (result.success) {
            this.notify("¡Inscripción enviada con éxito! El equipo te contactará pronto.", "check-circle");
            // Limpiar formulario
            this.limpiarFormularioRegistro();
            // Volver a la vista de login
            setTimeout(() => {
                this.changeView('login');
            }, 2000);
        } else {
            this.notify(result.error || "Error al enviar la inscripción", "x-circle");
        }
    },

    calcularEdad(fechaNac) {
        const [dia, mes, anio] = fechaNac.split('/');
        if (!dia || !mes || !anio) return 0;
        
        const hoy = new Date();
        const nacimiento = new Date(anio, mes - 1, dia);
        
        if (isNaN(nacimiento.getTime())) return 0;
        
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const mesNac = nacimiento.getMonth();
        
        if (mesActual < mesNac || (mesActual === mesNac && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    },

    limpiarFormularioRegistro() {
        document.getElementById('regNombre').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regFechaNac').value = '';
        document.getElementById('regFechaNacHidden').value = '';
        document.getElementById('regContacto').value = '';
        document.getElementById('regCedula').value = '';
        document.getElementById('regEPS').value = '';
        document.getElementById('regContactoEmergencia').value = '';
        document.getElementById('regTelEmergencia').value = '';
        document.getElementById('regAntecedentes').value = '';
        document.getElementById('regObjetivos').value = '';
        document.getElementById('regObjetivoOtro').value = '';
        document.getElementById('divObjetivoOtro').classList.add('hidden');
        document.getElementById('regConsent').checked = false;
        document.getElementById('regConsent').disabled = true;
        document.getElementById('inputVerificacion').value = '';
        document.getElementById('inputVerificacion').disabled = true;
        document.getElementById('edadCalculada').innerText = '';
        
        // Resetear estado de verificación
        this.modalLeido = false;
        const mensajeScroll = document.getElementById('mensajeScroll');
        mensajeScroll.textContent = '⚠️ Primero debes leer todas las condiciones completamente';
        mensajeScroll.classList.remove('text-green-600');
        mensajeScroll.classList.add('text-red-600');
    },

    toggleObjetivoOtro() {
        const objetivos = document.getElementById('regObjetivos').value;
        const divOtro = document.getElementById('divObjetivoOtro');
        const inputOtro = document.getElementById('regObjetivoOtro');
        
        if (objetivos === 'Otro') {
            divOtro.classList.remove('hidden');
            inputOtro.focus();
        } else {
            divOtro.classList.add('hidden');
            inputOtro.value = '';
        }
    }
};

// Calcular edad al cambiar fecha de nacimiento (solo para mostrar al usuario)
window.onload = () => {
    lucide.createIcons();
    
    // Verificar si hay sesión de admin activa
    const adminSession = app.checkAdminSession();
    if (adminSession) {
        // Hay una sesión de admin guardada, intentar restaurarla automáticamente
        console.log('Sesión de admin detectada');
        // Nota: Aquí podrías auto-login, pero por seguridad es mejor pedir las credenciales de nuevo
    }
    
    // Event listener para el input de texto (formato dd/mm/yyyy)
    const fechaNacInput = document.getElementById('regFechaNac');
    const fechaNacHidden = document.getElementById('regFechaNacHidden');
    
    if (fechaNacInput && fechaNacHidden) {
        // Cuando se escribe en el campo de texto
        fechaNacInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) value = value.slice(0,2) + '/' + value.slice(2);
            if (value.length >= 5) value = value.slice(0,5) + '/' + value.slice(5,9);
            this.value = value;
            
            // Sincronizar con el date picker oculto
            if (value.length === 10) {
                const [dia, mes, anio] = value.split('/');
                if (dia && mes && anio) {
                    fechaNacHidden.value = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                }
                
                const edad = app.calcularEdad(value);
                if (edad > 0 && edad < 120) {
                    document.getElementById('edadCalculada').innerText = `Edad: ${edad} años`;
                } else {
                    document.getElementById('edadCalculada').innerText = 'Fecha inválida';
                }
            }
        });
        
        // Cuando se selecciona desde el date picker
        fechaNacHidden.addEventListener('change', function() {
            if (this.value) {
                const [anio, mes, dia] = this.value.split('-');
                const fechaFormateada = `${dia}/${mes}/${anio}`;
                fechaNacInput.value = fechaFormateada;
                
                const edad = app.calcularEdad(fechaFormateada);
                if (edad > 0 && edad < 120) {
                    document.getElementById('edadCalculada').innerText = `Edad: ${edad} años`;
                } else {
                    document.getElementById('edadCalculada').innerText = 'Fecha inválida';
                }
                
                lucide.createIcons();
            }
        });
    }
};
