// PÁGINA DE CLIENTES - CONECTADA AL BACKEND (URLS CORREGIDAS)
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
        this.initModals();
        this.initEventListeners();
        this.loadClients();
        console.log('Clientes page initialized');
    },

    async loadClients() {
        try {
            console.log('Cargando clientes desde el backend...');
            
            // Mostrar loading
            const tbody = document.getElementById('clients-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align:center; padding: 30px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #32CD32;"></i> Cargando clientes...
                        </td>
                    </tr>
                `;
            }

            // URL CORREGIDA - usando tu API de DRF
            const response = await fetch('/entrenador/api/clientes/');
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            // DRF devuelve los resultados en data.results si hay paginación
            this.clients = data.results || data;
            this.filteredClients = [...this.clients];
            
            // Actualizar tabla
            this.initTable();
            
        } catch (error) {
            console.error('Error cargando clientes:', error);
            this.showError('Error al cargar los clientes. Verifica la conexión con el servidor.');
            
            const tbody = document.getElementById('clients-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align:center; padding: 30px; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Error al cargar clientes
                        </td>
                    </tr>
                `;
            }
        }
    },

    initTable() {
        // Si TableManager no está disponible, crear una versión simple
        if (typeof TableManager === 'undefined') {
            console.log('TableManager no disponible, usando renderizado básico');
            this.renderBasicTable();
            return;
        }

        try {
            this.tableManager = new TableManager({
                tableId: 'clients-table',
                columns: [
                    { key: 'name', label: 'Nombre', type: 'text' },
                    { key: 'last_name', label: 'Apellido', type: 'text' },
                    { key: 'dni', label: 'DNI', type: 'text' },
                    { key: 'phone', label: 'Teléfono', type: 'text' },
                    { 
                        key: 'experience_level', 
                        label: 'Experiencia', 
                        type: 'text',
                        formatter: (value) => this.formatExperienceLevel(value)
                    },
                    { key: 'goal', label: 'Objetivo', type: 'text' },
                    { 
                        key: 'injuries', 
                        label: 'Lesiones', 
                        type: 'text',
                        formatter: (value) => value || 'Ninguna'
                    },
                    { 
                        key: 'status', 
                        label: 'Estado', 
                        type: 'status',
                        formatter: (value) => this.formatStatus(value)
                    }
                ],
                actions: {
                    edit: (id) => this.editClient(id),
                    delete: (id) => this.deleteClient(id),
                    assign: (id) => this.openRoutineModal(id)
                }
            });

            this.tableManager.render(this.filteredClients);
        } catch (error) {
            console.error('Error inicializando TableManager:', error);
            this.renderBasicTable();
        }
    },

    renderBasicTable() {
        const tbody = document.getElementById('clients-table-body');
        if (!tbody) return;

        if (this.filteredClients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        No se encontraron clientes
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredClients.map(client => `
            <tr>
                <td>${client.name || 'N/A'}</td>
                <td>${client.last_name || 'N/A'}</td>
                <td>${client.dni || 'N/A'}</td>
                <td>${client.phone || 'N/A'}</td>
                <td>${this.formatExperienceLevel(client.experience_level)}</td>
                <td>${client.goal || 'N/A'}</td>
                <td>${client.injuries || 'Ninguna'}</td>
                <td>
                    <span class="status-badge ${client.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${this.formatStatus(client.status)}
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" onclick="clientesPage.editClient(${client.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="clientesPage.deleteClient(${client.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn assign-btn" onclick="clientesPage.openRoutineModal(${client.id})" title="Asignar Rutina">
                            <i class="fas fa-dumbbell"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    formatExperienceLevel(level) {
        const levels = {
            'beginner': 'Principiante',
            'intermediate': 'Intermedio', 
            'advanced': 'Avanzado'
        };
        return levels[level] || level;
    },

    formatStatus(status) {
        return status === 'active' ? 'Activo' : 'Inactivo';
    },

    initModals() {
        console.log('Inicializando modales...');
        
        const clientModal = document.getElementById('client-modal');
        if (clientModal) {
            this.modalManager = {
                show: () => {
                    console.log('Mostrando modal de cliente');
                    clientModal.style.display = 'flex';
                },
                hide: () => {
                    console.log('Ocultando modal de cliente');
                    clientModal.style.display = 'none';
                },
                setTitle: (title) => {
                    const titleEl = document.getElementById('modal-title');
                    if (titleEl) titleEl.textContent = title;
                },
                clearForm: () => {
                    const form = document.getElementById('client-form');
                    if (form) form.reset();
                    document.getElementById('client-id').value = '';
                }
            };
        }

        const routineModal = document.getElementById('routine-modal');
        if (routineModal) {
            this.routineModalManager = {
                show: () => {
                    console.log('Mostrando modal de rutinas');
                    routineModal.style.display = 'flex';
                },
                hide: () => {
                    console.log('Ocultando modal de rutinas');
                    routineModal.style.display = 'none';
                }
            };
        }
    },

    initEventListeners() {
        console.log('Inicializando event listeners...');
        
        const addClientBtn = document.getElementById('add-client-btn');
        if (addClientBtn) {
            addClientBtn.addEventListener('click', () => {
                this.openClientModal();
            });
        }

        this.initFilters();
        this.initModalEvents();
    },

    initModalEvents() {
        console.log('Inicializando eventos de modales...');
        
        // Modal de cliente
        const closeModal = document.getElementById('close-modal');
        const cancelForm = document.getElementById('cancel-form');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeClientModal());
        }
        
        if (cancelForm) {
            cancelForm.addEventListener('click', () => this.closeClientModal());
        }

        // Modal de rutinas
        const closeRoutineModal = document.getElementById('close-routine-modal');
        const cancelRoutineAssign = document.getElementById('cancel-routine-assign');
        
        if (closeRoutineModal) {
            closeRoutineModal.addEventListener('click', () => this.closeRoutineModal());
        }
        
        if (cancelRoutineAssign) {
            cancelRoutineAssign.addEventListener('click', () => this.closeRoutineModal());
        }

        // Formulario de cliente
        const clientForm = document.getElementById('client-form');
        if (clientForm) {
            clientForm.addEventListener('submit', (e) => this.saveClient(e));
        }

        // Cerrar modales al hacer click fuera
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    },

    initFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterClients();
                }, 300);
            });
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
                    }
                });
                
                options.classList.toggle('active');
                trigger.classList.toggle('active');
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

    filterClients() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const statusSelect = document.querySelector('#status-select .selected-value span');
        const statusFilter = statusSelect?.textContent !== 'Todos los estados' ? 
                             statusSelect?.textContent.toLowerCase() : '';

        this.filteredClients = this.clients.filter(client => {
            const fullName = `${client.name || ''} ${client.last_name || ''}`.toLowerCase();
            const matchesSearch = 
                fullName.includes(searchTerm) || 
                (client.dni && client.dni.toLowerCase().includes(searchTerm)) ||
                (client.phone && client.phone.toLowerCase().includes(searchTerm));
            
            const matchesStatus = statusFilter ? 
                (statusFilter === 'activo' ? client.status === 'active' : client.status === 'inactive') : 
                true;
            
            return matchesSearch && matchesStatus;
        });

        if (this.tableManager) {
            this.tableManager.render(this.filteredClients);
        } else {
            this.renderBasicTable();
        }
    },

    resetFilters() {
        const statusSelect = document.querySelector('#status-select .selected-value');
        if (statusSelect) {
            statusSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los estados</span>';
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredClients = [...this.clients];
        
        if (this.tableManager) {
            this.tableManager.render(this.filteredClients);
        } else {
            this.renderBasicTable();
        }
    },

    openClientModal(clientId = null) {
        const isEdit = !!clientId;
        if (this.modalManager) {
            this.modalManager.setTitle(isEdit ? 'Editar Cliente' : 'Nuevo Cliente');
            
            const submitText = document.getElementById('submit-text');
            if (submitText) {
                submitText.textContent = isEdit ? 'Actualizar Cliente' : 'Guardar Cliente';
            }
            
            if (isEdit) {
                this.loadClientData(clientId);
            } else {
                this.modalManager.clearForm();
            }
            
            this.modalManager.show();
        }
    },

    loadClientData(id) {
        const client = this.clients.find(c => c.id == id);
        if (client) {
            document.getElementById('client-id').value = client.id;
            document.getElementById('client-name').value = client.name || '';
            document.getElementById('client-last-name').value = client.last_name || '';
            document.getElementById('client-dni').value = client.dni || '';
            document.getElementById('client-phone').value = client.phone || '';
            document.getElementById('client-email').value = client.email || '';
            document.getElementById('client-experience').value = client.experience_level || '';
            document.getElementById('client-goal').value = client.goal || '';
            document.getElementById('client-injuries').value = client.injuries || '';
            document.getElementById('client-status').value = client.status || 'active';
        }
    },

    async saveClient(e) {
        e.preventDefault();
        
        const id = document.getElementById('client-id').value;
        const clientData = {
            name: document.getElementById('client-name').value,
            last_name: document.getElementById('client-last-name').value,
            dni: document.getElementById('client-dni').value || null,
            email: document.getElementById('client-email').value || null,
            phone: document.getElementById('client-phone').value || null,
            experience_level: document.getElementById('client-experience').value,
            goal: document.getElementById('client-goal').value || null,
            injuries: document.getElementById('client-injuries').value || null,
            status: document.getElementById('client-status').value
        };
        
        if (!clientData.name || !clientData.last_name || !clientData.experience_level || !clientData.status) {
            this.showError('Por favor, completa todos los campos obligatorios.');
            return;
        }
        
        try {
            let response;
            const options = {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(clientData)
            };

            // URL CORREGIDA - usando tu API de DRF
            const url = id ? `/entrenador/api/clientes/${id}/` : '/entrenador/api/clientes/';
            response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || `Error ${response.status}`);
            }
            
            const savedClient = await response.json();
            
            this.showSuccess(id ? 'Cliente actualizado correctamente!' : 'Cliente creado correctamente!');
            
            this.closeClientModal();
            await this.loadClients();
            
        } catch (error) {
            console.error('Error guardando cliente:', error);
            this.showError('Error al guardar el cliente: ' + error.message);
        }
    },

    getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    },

    closeClientModal() {
        if (this.modalManager) {
            this.modalManager.hide();
        }
    },

    editClient(id) {
        this.openClientModal(id);
    },

    async deleteClient(id) {
        const client = this.clients.find(c => c.id == id);
        if (!client) return;

        if (confirm(`¿Estás seguro de que deseas eliminar al cliente ${client.name} ${client.last_name}? Esta acción no se puede deshacer.`)) {
            try {
                // URL CORREGIDA - usando tu API de DRF
                const response = await fetch(`/entrenador/api/clientes/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': this.getCSRFToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}`);
                }
                
                this.showSuccess('Cliente eliminado correctamente');
                await this.loadClients();
                
            } catch (error) {
                console.error('Error eliminando cliente:', error);
                this.showError('Error al eliminar el cliente: ' + error.message);
            }
        }
    },

    // FUNCIONES PARA MODAL DE RUTINAS
    openRoutineModal(clientId) {
        const client = this.clients.find(c => c.id == clientId);
        
        if (!client) {
            this.showError('Cliente no encontrado');
            return;
        }
        
        this.currentClient = client;
        
        const titulo = 'Asignar Rutina';
        document.getElementById('routine-modal-title').textContent = `${titulo} a ${client.name} ${client.last_name}`;
        
        this.loadRoutines();
        if (this.routineModalManager) {
            this.routineModalManager.show();
        }
    },

    async loadRoutines() {
        const routineList = document.getElementById('routine-list');
        if (!routineList) return;

        routineList.innerHTML = `
            <div class="loading-routines">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Cargando rutinas...</span>
            </div>
        `;

        // URL CORREGIDA - usando tu API de DRF para rutinas
        try {
            const response = await fetch('/entrenador/api/rutinas/');
            if (response.ok) {
                const data = await response.json();
                this.routines = data.results || data;
                
                if (this.routines.length === 0) {
                    routineList.innerHTML = `
                        <div class="no-routines">
                            <i class="fas fa-dumbbell"></i>
                            <h3>No hay rutinas disponibles</h3>
                            <p>Crea rutinas primero para poder asignarlas.</p>
                        </div>
                    `;
                } else {
                    // Renderizar rutinas aquí
                    routineList.innerHTML = this.routines.map(rutina => `
                        <div class="routine-card" onclick="clientesPage.selectRoutine(${rutina.id})">
                            <div class="routine-card-header">
                                <div class="routine-name">${rutina.name || rutina.nombre}</div>
                            </div>
                            <div class="routine-description">${rutina.description || rutina.descripcion || 'Sin descripción'}</div>
                        </div>
                    `).join('');
                }
            } else {
                throw new Error('Error cargando rutinas');
            }
        } catch (error) {
            console.error('Error cargando rutinas:', error);
            routineList.innerHTML = `
                <div class="no-routines">
                    <i class="fas fa-dumbbell"></i>
                    <h3>Funcionalidad en desarrollo</h3>
                    <p>La asignación de rutinas estará disponible pronto.</p>
                </div>
            `;
        }
    },

    selectRoutine(rutinaId) {
        this.selectedRoutine = rutinaId;
        // Aquí puedes agregar lógica para resaltar la rutina seleccionada
        console.log('Rutina seleccionada:', rutinaId);
    },

    closeRoutineModal() {
        if (this.routineModalManager) {
            this.routineModalManager.hide();
        }
        this.currentClient = null;
        this.selectedRoutine = null;
    },

    // Métodos de utilidad
    showError(message) {
        console.error('Error:', message);
        alert('Error: ' + message);
    },

    showSuccess(message) {
        console.log('Éxito:', message);
        alert('Éxito: ' + message);
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing clientes page');
    
    setTimeout(() => {
        try {
            if (window.clientesPage && typeof window.clientesPage.initialize === 'function') {
                window.clientesPage.initialize();
            } else {
                console.error('clientesPage no está disponible correctamente');
            }
        } catch (error) {
            console.error('Error inicializando clientes page:', error);
        }
    }, 100);
});

// Hacer disponible globalmente
window.clientesPage = window.clientesPage || clientesPage;