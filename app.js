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

    // ========== UTILIDADES DE API (JSONP para evitar CORS) ==========
    async apiCall(action, params = {}, method = 'GET') {
        try {
            // Verificar si la API está configurada
            if (!CONFIG.API_URL || CONFIG.API_URL === 'TU_URL_DE_WEB_APP_AQUI') {
                console.error('❌ API URL no configurada');
                this.notify('API no configurada. Revisa config.js', 'alert-triangle');
                return { success: false, error: 'API no configurada' };
            }

            // Usar JSONP para evitar problemas de CORS con Google Apps Script
            return new Promise((resolve, reject) => {
                const callbackName = 'jsonpCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                // Crear función global de callback
                window[callbackName] = function(data) {
                    console.log('✅ Respuesta recibida:', data);
                    delete window[callbackName];
                    if (document.body.contains(script)) {
                        document.body.removeChild(script);
                    }
                    resolve(data);
                };
                
                // Construir URL con parámetros
                let url = `${CONFIG.API_URL}?action=${action}&callback=${callbackName}`;
                
                // Agregar parámetros adicionales
                Object.keys(params).forEach(key => {
                    url += `&${key}=${encodeURIComponent(params[key])}`;
                });
                
                console.log('🔄 Llamando a:', url);
                
                // Crear script tag para JSONP
                const script = document.createElement('script');
                script.src = url;
                script.onerror = function(error) {
                    console.error('❌ Error al cargar script:', error);
                    console.error('URL que falló:', url);
                    delete window[callbackName];
                    if (document.body.contains(script)) {
                        document.body.removeChild(script);
                    }
                    reject(new Error('Error de red. Verifica:\n1. Que el Apps Script esté desplegado\n2. Que la URL en config.js sea correcta\n3. Que el Apps Script tenga el código actualizado con soporte JSONP'));
                };
                
                document.body.appendChild(script);
                
                // Timeout de 30 segundos
                setTimeout(() => {
                    if (window[callbackName]) {
                        console.error('⏱️ Timeout: el servidor no respondió');
                        delete window[callbackName];
                        if (document.body.contains(script)) {
                            document.body.removeChild(script);
                        }
                        reject(new Error('Timeout: el servidor tardó demasiado en responder'));
                    }
                }, 30000);
            });
        } catch (error) {
            console.error('❌ Error en llamada API:', error);
            this.notify(error.message || CONFIG.MESSAGES.ERROR_CONEXION, 'wifi-off');
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
                credits: cliente.planSemanal,
                used: cliente.creditosUsados,
                membership: cliente.membresiaAnual === 'S' ? 'Membresía Activa' : 'Sin Membresía',
                estado: cliente.estado
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

    async loadHorarios() {
        if (this.sessions.length > 0) return; // Ya están cargados
        
        this.showLoader();
        const horariosResult = await this.apiCall('getHorarios', { documento: this.user.doc });
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
        document.getElementById('creditsCount').innerText = this.user.used;
        document.getElementById('creditsLimit').innerText = this.user.credits;
        document.getElementById('badgeMembresia').innerText = this.user.membership;
        document.getElementById('userTag').innerText = "ID: " + this.user.doc;
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
                v.style.display = 'none';
            });
            // Mostrar solo la vista activa
            target.classList.add('active');
            target.style.display = 'block';
            
            // Cargar datos solo cuando se necesitan
            if (viewId === 'booking') {
                // Siempre recargar para tener datos actualizados
                this.sessions = [];
                this.loadHorarios();
            } else if (viewId === 'sessions') {
                this.loadReservas();
            }
            
            lucide.createIcons();
            window.scrollTo(0, 0);
        } else {
            console.error("Vista no encontrada: " + viewId);
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
            const dateObj = new Date(date);
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
            const dateObj = new Date(date);
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
        if(this.user.used >= this.user.credits) return this.notify("Ya agotaste tus créditos semanales", "lock");
        if(this.userReservations.find(r => r.id === idClase)) return this.notify("Ya estás inscrito en esta clase", "info");

        this.showLoader();
        
        const result = await this.apiCall('reservar', {
            documento: this.user.doc,
            idClase: idClase
        }, 'POST');
        
        if (result.success) {
            // Recargar solo los horarios y reservas
            await this.loadHorarios();
            await this.loadReservas();
            this.user.used++;
            this.syncUIBasic();
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
            // Recargar solo los horarios y reservas
            await this.loadHorarios();
            await this.loadReservas();
            this.user.used--;
            this.syncUIBasic();
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

    async sendPayment() {
        const file = document.getElementById('payFile').files[0];   
        if(!file) return this.notify("Debes adjuntar la imagen del pago", "camera");

        const tipoPago = document.getElementById('payType').value;
        const btn = document.getElementById('sendPayBtn');
        btn.innerText = "Subiendo...";
        btn.disabled = true;
        this.showLoader();

        // TODO: Implementar subida de imagen a Google Drive
        // Por ahora, simularemos con un link de ejemplo
        const linkSoporte = `https://drive.google.com/ejemplo/${Date.now()}`;
        
        const result = await this.apiCall('registrarPago', {
            documento: this.user.doc,
            tipoPago: tipoPago === 'membresia' ? 'Inscripción Membresía' : 'Mensualidad',
            linkSoporte: linkSoporte
        }, 'POST');
        
        if (result.success) {
            this.notify("Soporte enviado. El coach validará tu pago.", "check-circle");
            document.getElementById('payFile').value = '';
            this.changeView('main');
        } else {
            this.notify(result.error || "Error al enviar el pago", "x-circle");
        }
        
        this.hideLoader();
        btn.innerText = "Enviar Comprobante";
        btn.disabled = false;
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
    }
};

window.onload = () => lucide.createIcons();
