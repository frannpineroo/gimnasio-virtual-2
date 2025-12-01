// entidades/static/entrenador/js/pages/rutinas.js
class RutinasPage {
    constructor() {
        this.initialized = false;
        this.routines = [];
        this.filteredRoutines = [];
        this.clients = [];
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('Inicializando página de rutinas');
        
        this.initEventListeners();
        this.loadClients();
        this.loadRoutines();
    }

    initEventListeners() {
        // Filtros
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterRoutines();
                }, 300);
            });
        }

        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Modal de eliminación
        const cancelDelete = document.getElementById('cancel-delete');
        const confirmDelete = document.getElementById('confirm-delete');
        
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.hideDeleteModal());
        }
        
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deleteRoutine());
        }

        // Modal de visualización
        const closeViewModal = document.getElementById('close-view-modal');
        if (closeViewModal) {
            closeViewModal.addEventListener('click', () => this.hideViewModal());
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

        this.initCustomSelects();
    }

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
                        window.rutinasPage.filterRoutines();
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
    }

    async loadClients() {
        try {
            // Cargar clientes desde la API
            const response = await fetch('/entrenador/api/clientes/');
            if (response.ok) {
                const data = await response.json();
                this.clients = data.results || data;
                this.populateClientSelect();
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
        }
    }

    populateClientSelect() {
        const clientSelect = document.getElementById('client-select');
        if (!clientSelect) return;

        const optionsContainer = clientSelect.querySelector('.select-options');
        // Limpiar opciones existentes (excepto la primera)
        const firstOption = optionsContainer.querySelector('.select-option:first-child');
        optionsContainer.innerHTML = '';
        optionsContainer.appendChild(firstOption);

        // Agregar opciones de clientes
        this.clients.forEach(client => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.setAttribute('data-value', client.id);
            option.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${client.name} ${client.last_name}</span>
            `;
            optionsContainer.appendChild(option);
        });

        // Re-inicializar eventos del select
        this.initCustomSelects();
    }

    async loadRoutines() {
        try {
            console.log('Cargando rutinas desde el backend...');
            
            // TODO: Conectar con API real
            // const response = await fetch('/entrenador/api/rutinas/');
            // this.routines = await response.json();
            
            // Datos de ejemplo temporalmente
            this.routines = [
                {
                    id: 1,
                    name: "Rutina fuerza inicial",
                    description: "Rutina para principiantes enfocada en fuerza general",
                    client: { id: 1, name: "Juan", last_name: "Pérez" },
                    duration: "8 ejercicios",
                    days: "3 días/semana",
                    creation_date: "15/05/2023",
                    teacher: "Profesor A"
                },
                {
                    id: 2,
                    name: "Rutina volumen",
                    description: "Rutina para ganancia muscular con enfoque en hipertrofia",
                    client: { id: 2, name: "María", last_name: "García" },
                    duration: "10 ejercicios",
                    days: "4 días/semana",
                    creation_date: "22/06/2023",
                    teacher: "Profesor B"
                }
            ];
            
            this.filteredRoutines = [...this.routines];
            this.renderTable();
            
        } catch (error) {
            console.error('Error cargando rutinas:', error);
            this.showError('Error al cargar las rutinas');
        }
    }

    renderTable() {
        const tbody = document.getElementById('routines-table-body');
        if (!tbody) return;

        if (this.filteredRoutines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        No se encontraron rutinas
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredRoutines.map(routine => `
            <tr>
                <td>${routine.name}</td>
                <td>${routine.description}</td>
                <td>${routine.client.name} ${routine.client.last_name}</td>
                <td>${routine.duration}</td>
                <td>${routine.days}</td>
                <td>${routine.creation_date}</td>
                <td>${routine.teacher}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn view-btn" onclick="rutinasPage.viewRoutine(${routine.id})" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="rutinasPage.editRoutine(${routine.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="rutinasPage.showDeleteModal(${routine.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterRoutines() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const clientSelect = document.querySelector('#client-select .selected-value span');
        const clientFilter = clientSelect?.textContent !== 'Todos los clientes' ? 
                             clientSelect?.getAttribute('data-value') : '';

        this.filteredRoutines = this.routines.filter(routine => {
            const matchesSearch = routine.name.toLowerCase().includes(searchTerm) || 
                                 routine.description.toLowerCase().includes(searchTerm);
            
            const matchesClient = clientFilter ? 
                routine.client.id == clientFilter : 
                true;
            
            return matchesSearch && matchesClient;
        });

        this.renderTable();
    }

    resetFilters() {
        const clientSelect = document.querySelector('#client-select .selected-value');
        if (clientSelect) {
            clientSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los clientes</span>';
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredRoutines = [...this.routines];
        this.renderTable();
    }

    viewRoutine(id) {
        const routine = this.routines.find(r => r.id === id);
        if (routine) {
            document.getElementById('view-modal-title').textContent = routine.name;
            document.getElementById('view-client-name').textContent = `${routine.client.name} ${routine.client.last_name}`;
            document.getElementById('view-description').textContent = routine.description;
            document.getElementById('view-creation-date').textContent = routine.creation_date;
            
            // TODO: Cargar ejercicios de la rutina desde la API
            this.showViewModal();
        }
    }

    showViewModal() {
        const modal = document.getElementById('view-routine-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideViewModal() {
        const modal = document.getElementById('view-routine-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    editRoutine(id) {
        // TODO: Redirigir a la página de edición o abrir modal de edición
        console.log('Editando rutina:', id);
    }

    showDeleteModal(id) {
        this.currentRoutineId = id;
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentRoutineId = null;
    }

    async deleteRoutine() {
        if (this.currentRoutineId) {
            // TODO: Implementar eliminación real
            console.log('Eliminando rutina:', this.currentRoutineId);
            this.hideDeleteModal();
            this.showSuccess('Rutina eliminada correctamente');
            await this.loadRoutines();
        }
    }

    showError(message) {
        console.error('Error:', message);
        alert('Error: ' + message);
    }

    showSuccess(message) {
        console.log('Éxito:', message);
        alert('Éxito: ' + message);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.rutinasPage = new RutinasPage();
    window.rutinasPage.initialize();
});