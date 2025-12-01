// PÁGINA DE CLIENTES OPTIMIZADA
const clientesPage = {
    tableManager: null,
    modalManager: null,
    routineModalManager: null,
    clients: [],
    routines: [],
    filteredClients: [],
    currentClient: null,
    selectedRoutine: null,
    initialized: false,

    initialize() {
        if (this.initialized) {
            console.log('Clientes page already initialized');
            return;
        }
        
        this.initialized = true;
        this.loadData();
        this.initTable();
        this.initModals();
        this.initEventListeners();
        console.log('Clientes page initialized');
    },

    loadData() {
        // Cargar clientes
        this.clients = JSON.parse(localStorage.getItem('clientes')) || [
            {
                id: 1,
                nombre: "María López",
                dni: "12345678A",
                experiencia: "Principiante, 3 meses en gym",
                objetivo: "perdida_grasa",
                lesiones: "Ninguna",
                estado: "activo",
                fechaRegistro: "2023-05-15",
                rutinaAsignada: 1,
                fechaInicioRutina: "2024-01-15",
                fechaFinRutina: "2024-02-15"
            },
            {
                id: 2,
                nombre: "Carlos Rodríguez",
                dni: "87654321B",
                experiencia: "Intermedio, 2 años entrenando",
                objetivo: "ganancia_muscular",
                lesiones: "Lesión de hombro en 2020",
                estado: "activo",
                fechaRegistro: "2023-06-20",
                rutinaAsignada: 2,
                fechaInicioRutina: "2024-01-10",
                fechaFinRutina: "2024-02-10"
            },
            {
                id: 3,
                nombre: "Ana Martínez",
                dni: "56781234C",
                experiencia: "Avanzado, compite en fitness",
                objetivo: "mejora_rendimiento",
                lesiones: "Problemas de rodilla derecha",
                estado: "inactivo",
                fechaRegistro: "2023-04-10",
                rutinaAsignada: null,
                fechaInicioRutina: null,
                fechaFinRutina: null
            }
        ];

        // Cargar rutinas
        this.routines = JSON.parse(localStorage.getItem('rutinas')) || [
            {
                id: 1,
                nombre: "Rutina Principiante Full Body",
                descripcion: "Rutina completa para quienes comienzan en el gimnasio",
                nivel: "beginner",
                duracion: "45-60 min",
                diasSemana: 3,
                ejercicios: 8,
                duracionSemanas: 4,
                objetivo: ["perdida_grasa", "ganancia_muscular", "mantenimiento"]
            },
            {
                id: 2,
                nombre: "Rutina Fuerza Avanzada",
                descripcion: "Enfocada en ganancia de fuerza con ejercicios compuestos",
                nivel: "advanced",
                duracion: "75-90 min",
                diasSemana: 4,
                ejercicios: 12,
                duracionSemanas: 6,
                objetivo: ["ganancia_muscular", "mejora_rendimiento"]
            }
        ];

        this.filteredClients = [...this.clients];
    },

    initTable() {
        // Verificar que TableManager esté disponible
        if (typeof TableManager === 'undefined') {
            console.error('TableManager no está disponible');
            setTimeout(() => this.initTable(), 100);
            return;
        }

        this.tableManager = new TableManager({
            tableId: 'clients-table',
            columns: [
                { key: 'nombre', label: 'Nombre', type: 'text' },
                { key: 'dni', label: 'DNI', type: 'text' },
                { key: 'experiencia', label: 'Experiencia', type: 'text' },
                { key: 'objetivo', label: 'Objetivo', type: 'text' },
                { key: 'lesiones', label: 'Lesiones', type: 'text' },
                { key: 'estado', label: 'Estado', type: 'status' }
            ],
            actions: {
                edit: (id) => this.editClient(id),
                delete: (id) => this.deleteClient(id),
                assign: (id) => this.openRoutineModal(id)
            }
        });

        this.tableManager.render(this.filteredClients);
    },

    initModals() {
        // Verificar que ModalManager esté disponible
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager no está disponible');
            setTimeout(() => this.initModals(), 100);
            return;
        }

        // Modal principal de clientes
        this.modalManager = new ModalManager('client-modal');
        
        const clientForm = document.getElementById('client-form');
        if (clientForm) {
            clientForm.addEventListener('submit', (e) => this.saveClient(e));
        }

        // Modal de rutinas
        this.routineModalManager = new ModalManager('routine-modal');
    },

    initEventListeners() {
        // Botón agregar cliente
        const addClientBtn = document.getElementById('add-client-btn');
        if (addClientBtn) {
            addClientBtn.addEventListener('click', () => {
                this.openClientModal();
            });
        }

        // Filtros
        this.initFilters();

        // Eventos de modales
        this.initModalEvents();
    },

    initFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(() => {
                this.filterClients();
            }, 300));
        }

        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        this.initCustomSelects();
    },

    initCustomSelects() {
        const customSelects = document.querySelectorAll('.custom-select');
        
        customSelects.forEach(select => {
            const trigger = select.querySelector('.select-trigger');
            const options = select.querySelector('.select-options');
            const selectedValue = select.querySelector('.selected-value');
            const optionsList = select.querySelectorAll('.select-option');
            
            if (!trigger || !options || !selectedValue || optionsList.length === 0) return;
            
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                
                document.querySelectorAll('.select-options.active').forEach(opt => {
                    if (opt !== options) {
                        opt.classList.remove('active');
                        if (opt.previousElementSibling) {
                            opt.previousElementSibling.classList.remove('active');
                        }
                    }
                });
                
                trigger.classList.toggle('active');
                options.classList.toggle('active');
            });
            
            optionsList.forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const value = this.getAttribute('data-value');
                    const text = this.querySelector('span').textContent;
                    const icon = this.querySelector('i').cloneNode(true);
                    
                    selectedValue.innerHTML = '';
                    selectedValue.appendChild(icon);
                    selectedValue.innerHTML += `<span>${text}</span>`;
                    
                    trigger.classList.remove('active');
                    options.classList.remove('active');
                    
                    setTimeout(() => {
                        clientesPage.filterClients();
                    }, 100);
                });
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.custom-select')) {
                document.querySelectorAll('.select-options.active').forEach(options => {
                    options.classList.remove('active');
                });
                document.querySelectorAll('.select-trigger.active').forEach(trigger => {
                    trigger.classList.remove('active');
                });
            }
        });
    },

    initModalEvents() {
        // Modal de cliente
        const closeModal = document.getElementById('close-modal');
        const cancelForm = document.getElementById('cancel-form');
        
        if (closeModal) closeModal.addEventListener('click', () => this.closeClientModal());
        if (cancelForm) cancelForm.addEventListener('click', () => this.closeClientModal());

        // Modal de rutinas
        const closeRoutineModal = document.getElementById('close-routine-modal');
        const cancelRoutineAssign = document.getElementById('cancel-routine-assign');
        
        if (closeRoutineModal) closeRoutineModal.addEventListener('click', () => this.closeRoutineModal());
        if (cancelRoutineAssign) cancelRoutineAssign.addEventListener('click', () => this.closeRoutineModal());

        // Búsqueda en modal de rutinas
        const routineSearchInput = document.getElementById('routine-search-input');
        if (routineSearchInput) {
            routineSearchInput.addEventListener('input', Helpers.debounce(() => {
                this.loadRoutines();
            }, 300));
        }
    },

    filterClients() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const statusSelect = document.querySelector('#status-select .selected-value span');
        const statusFilter = statusSelect.textContent !== 'Todos los estados' ? 
                             statusSelect.textContent.toLowerCase() : '';

        this.filteredClients = this.clients.filter(client => {
            const matchesSearch = client.nombre.toLowerCase().includes(searchTerm) || 
                                 client.dni.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter ? client.estado === statusFilter : true;
            
            return matchesSearch && matchesStatus;
        });

        if (this.tableManager) {
            this.tableManager.render(this.filteredClients);
        }
    },

    resetFilters() {
        const statusSelect = document.querySelector('#status-select .selected-value');
        statusSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los estados</span>';
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredClients = [...this.clients];
        if (this.tableManager) {
            this.tableManager.render(this.filteredClients);
        }
    },

    openClientModal(clientId = null) {
        const isEdit = !!clientId;
        this.modalManager.setTitle(isEdit ? 'Editar Cliente' : 'Nuevo Cliente');
        
        if (isEdit) {
            this.loadClientData(clientId);
        } else {
            this.modalManager.clearForm();
            document.getElementById('client-id').value = '';
        }
        
        this.modalManager.show();
    },

    loadClientData(id) {
        const client = this.clients.find(c => c.id == id);
        if (client) {
            document.getElementById('client-id').value = client.id;
            document.getElementById('client-name').value = client.nombre;
            document.getElementById('client-dni').value = client.dni;
            document.getElementById('client-experience').value = client.experiencia || '';
            document.getElementById('client-goal').value = client.objetivo;
            document.getElementById('client-injuries').value = client.lesiones || '';
            document.getElementById('client-status').value = client.estado;
        }
    },

    saveClient(e) {
        e.preventDefault();
        
        const id = document.getElementById('client-id').value || Helpers.generateId();
        const nombre = document.getElementById('client-name').value;
        const dni = document.getElementById('client-dni').value;
        const experiencia = document.getElementById('client-experience').value;
        const objetivo = document.getElementById('client-goal').value;
        const lesiones = document.getElementById('client-injuries').value;
        const estado = document.getElementById('client-status').value;
        
        if (!nombre || !dni || !objetivo || !estado) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
        
        const clientData = {
            id: parseInt(id),
            nombre,
            dni,
            experiencia,
            objetivo,
            lesiones,
            estado,
            fechaRegistro: new Date().toISOString().split('T')[0],
            rutinaAsignada: null,
            fechaInicioRutina: null,
            fechaFinRutina: null
        };
        
        const existingIndex = this.clients.findIndex(c => c.id == id);
        
        if (existingIndex !== -1) {
            clientData.fechaRegistro = this.clients[existingIndex].fechaRegistro;
            clientData.rutinaAsignada = this.clients[existingIndex].rutinaAsignada;
            clientData.fechaInicioRutina = this.clients[existingIndex].fechaInicioRutina;
            clientData.fechaFinRutina = this.clients[existingIndex].fechaFinRutina;
            
            this.clients[existingIndex] = clientData;
        } else {
            this.clients.push(clientData);
        }
        
        localStorage.setItem('clientes', JSON.stringify(this.clients));
        
        alert(existingIndex !== -1 ? 'Cliente actualizado correctamente!' : 'Cliente creado correctamente!');
        
        this.closeClientModal();
        this.resetFilters();
    },

    closeClientModal() {
        this.modalManager.hide();
    },

    editClient(id) {
        this.openClientModal(id);
    },

    deleteClient(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
            this.clients = this.clients.filter(c => c.id != id);
            localStorage.setItem('clientes', JSON.stringify(this.clients));
            this.resetFilters();
        }
    },

    // FUNCIONES PARA MODAL DE RUTINAS
    openRoutineModal(clientId) {
        const client = this.clients.find(c => c.id == clientId);
        
        if (!client) {
            alert('Cliente no encontrado');
            return;
        }
        
        this.currentClient = client;
        this.selectedRoutine = client.rutinaAsignada;
        
        const titulo = client.rutinaAsignada ? 'Modificar Rutina' : 'Asignar Rutina';
        document.getElementById('routine-modal-title').textContent = `${titulo} a ${client.nombre}`;
        
        this.loadRoutines();
        this.routineModalManager.show();
    },

    loadRoutines() {
        const routineList = document.getElementById('routine-list');
        const searchTerm = document.getElementById('routine-search-input')?.value.toLowerCase() || '';
        
        if (!searchTerm) {
            routineList.innerHTML = `
                <div class="loading-routines">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Cargando rutinas...</span>
                </div>
            `;
        }
        
        setTimeout(() => {
            const rutinasFiltradas = this.routines.filter(rutina => {
                const matchesSearch = rutina.nombre.toLowerCase().includes(searchTerm) ||
                                    rutina.descripcion.toLowerCase().includes(searchTerm);
                
                const matchesGoal = this.currentClient && this.currentClient.objetivo ? 
                                  rutina.objetivo.includes(this.currentClient.objetivo) : true;
                
                return matchesSearch && matchesGoal;
            });
            
            if (rutinasFiltradas.length === 0) {
                routineList.innerHTML = `
                    <div class="no-routines">
                        <i class="fas fa-dumbbell"></i>
                        <h3>No se encontraron rutinas</h3>
                        <p>${searchTerm ? 'No hay rutinas que coincidan con tu búsqueda.' : 'No hay rutinas disponibles para este cliente.'}</p>
                    </div>
                `;
                return;
            }
            
            routineList.innerHTML = rutinasFiltradas.map(rutina => `
                <div class="routine-card ${this.selectedRoutine === rutina.id ? 'selected' : ''}" 
                     onclick="clientesPage.selectRoutine(${rutina.id})">
                    <div class="routine-card-header">
                        <div class="routine-name">${rutina.nombre}</div>
                        <div class="routine-level level-${rutina.nivel}">
                            ${Helpers.formatLevel(rutina.nivel)}
                        </div>
                    </div>
                    <div class="routine-description">${rutina.descripcion}</div>
                    <div class="routine-details">
                        <div class="routine-detail">
                            <i class="fas fa-clock"></i>
                            <span>${rutina.duracion}</span>
                        </div>
                        <div class="routine-detail">
                            <i class="fas fa-calendar-week"></i>
                            <span>${rutina.diasSemana} días/semana</span>
                        </div>
                        <div class="routine-detail">
                            <i class="fas fa-dumbbell"></i>
                            <span>${rutina.ejercicios} ejercicios</span>
                        </div>
                        <div class="routine-detail">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${rutina.duracionSemanas} semanas</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            this.addRoutineModalButtons();
        }, 500);
    },

    selectRoutine(rutinaId) {
        this.selectedRoutine = rutinaId;
        
        document.querySelectorAll('.routine-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`.routine-card[onclick="clientesPage.selectRoutine(${rutinaId})"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.addConfirmButton();
        }
    },

    addConfirmButton() {
        if (!document.getElementById('confirm-assign-btn')) {
            const formActions = document.querySelector('#routine-modal .form-actions');
            const confirmButton = document.createElement('button');
            confirmButton.id = 'confirm-assign-btn';
            confirmButton.className = 'btn btn-primary';
            confirmButton.innerHTML = '<i class="fas fa-check"></i> Confirmar Asignación';
            confirmButton.onclick = () => this.confirmAssignment();
            
            formActions.insertBefore(confirmButton, formActions.firstChild);
        }
    },

    addRoutineModalButtons() {
        const formActions = document.querySelector('#routine-modal .form-actions');
        
        // Botón quitar rutina si el cliente ya tiene una
        if (this.currentClient && this.currentClient.rutinaAsignada && !document.getElementById('remove-routine-btn')) {
            const removeButton = document.createElement('button');
            removeButton.id = 'remove-routine-btn';
            removeButton.className = 'btn btn-secondary';
            removeButton.innerHTML = '<i class="fas fa-times"></i> Quitar Rutina Actual';
            removeButton.onclick = () => this.removeRoutine(this.currentClient.id);
            removeButton.style.marginRight = 'auto';
            
            formActions.appendChild(removeButton);
        }
    },

    confirmAssignment() {
        if (!this.currentClient || !this.selectedRoutine) {
            alert('Por favor, selecciona una rutina para asignar.');
            return;
        }
        
        const rutina = this.routines.find(r => r.id == this.selectedRoutine);
        
        if (!rutina) {
            alert('Error: Rutina no encontrada');
            return;
        }
        
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaInicio.getDate() + (rutina.duracionSemanas * 7));
        
        const clienteIndex = this.clients.findIndex(c => c.id === this.currentClient.id);
        
        if (clienteIndex !== -1) {
            const yaTeníaRutina = !!this.clients[clienteIndex].rutinaAsignada;
            
            this.clients[clienteIndex].rutinaAsignada = rutina.id;
            this.clients[clienteIndex].fechaInicioRutina = fechaInicio.toISOString().split('T')[0];
            this.clients[clienteIndex].fechaFinRutina = fechaFin.toISOString().split('T')[0];
            
            if (this.clients[clienteIndex].estado === 'inactivo') {
                this.clients[clienteIndex].estado = 'activo';
            }
            
            localStorage.setItem('clientes', JSON.stringify(this.clients));
            
            if (yaTeníaRutina) {
                alert(`¡Rutina modificada exitosamente!\n\n${this.currentClient.nombre} ahora tiene la rutina: "${rutina.nombre}"\nDuración: ${rutina.duracionSemanas} semanas\nFecha fin: ${fechaFin.toLocaleDateString()}`);
            } else {
                alert(`¡Rutina asignada exitosamente!\n\n${this.currentClient.nombre} ahora tiene la rutina: "${rutina.nombre}"\nDuración: ${rutina.duracionSemanas} semanas\nFecha fin: ${fechaFin.toLocaleDateString()}`);
            }
            
            this.closeRoutineModal();
            this.resetFilters();
        }
    },

    removeRoutine(clienteId) {
        const cliente = this.clients.find(c => c.id == clienteId);
        if (!cliente) return;
        
        if (confirm(`¿Estás seguro de que deseas quitar la rutina asignada a ${cliente.nombre}?`)) {
            const clienteIndex = this.clients.findIndex(c => c.id === clienteId);
            
            if (clienteIndex !== -1) {
                this.clients[clienteIndex].rutinaAsignada = null;
                this.clients[clienteIndex].fechaInicioRutina = null;
                this.clients[clienteIndex].fechaFinRutina = null;
                
                localStorage.setItem('clientes', JSON.stringify(this.clients));
                
                alert(`Rutina quitada exitosamente de ${cliente.nombre}`);
                this.closeRoutineModal();
                this.resetFilters();
            }
        }
    },

    closeRoutineModal() {
        this.routineModalManager.hide();
        this.currentClient = null;
        this.selectedRoutine = null;
        
        const confirmBtn = document.getElementById('confirm-assign-btn');
        if (confirmBtn) confirmBtn.remove();
        
        const removeBtn = document.getElementById('remove-routine-btn');
        if (removeBtn) removeBtn.remove();
    }
};

// Helper functions
if (typeof Helpers === 'undefined') {
    const Helpers = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        formatLevel(level) {
            const levels = {
                'beginner': 'Principiante',
                'intermediate': 'Intermedio',
                'advanced': 'Avanzado'
            };
            return levels[level] || level;
        },

        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
    };
    window.Helpers = Helpers;
}

// Inicialización automática cuando el script se carga
(function() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeClientesPage();
        });
    } else {
        initializeClientesPage();
    }

    function initializeClientesPage() {
        // Si app.js ya inicializó la página, no hacer nada
        if (window.clientesPage && window.clientesPage.initialized) return;
        
        // Si no, inicializar después de un delay para que los componentes se carguen
        setTimeout(() => {
            if (window.clientesPage) {
                console.log('Auto-initializing clientes page');
                window.clientesPage.initialize();
            }
        }, 200);
    }
})();

// Hacer disponible globalmente
window.clientesPage = clientesPage;