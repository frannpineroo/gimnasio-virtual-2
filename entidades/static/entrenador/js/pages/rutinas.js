// entidades/static/entrenador/js/pages/rutinas.js
class RutinasPage {
    constructor() {
        this.initialized = false;
        this.routines = [];
        this.filteredRoutines = [];
        this.clients = [];
        this.apiBaseUrl = '/entrenador/api/';
        this.currentRoutineId = null;
        this.searchTimeout = null;
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        
        this.initEventListeners();
        this.loadClients().then(() => {
            this.loadRoutines();
        });
    }

    initEventListeners() {
        // Botones de filtros
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
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                }
            });
        });

        // Inicializar selects personalizados
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
            const response = await fetch(`${this.apiBaseUrl}clientes/`);
            if (!response.ok) throw new Error('Error cargando clientes');
            this.clients = await response.json();
            this.populateClientSelect();
        } catch (error) {
            console.error('Error cargando clientes:', error);
            this.clients = [];
        }
    }

    populateClientSelect() {
        const clientSelect = document.querySelector('#client-select .select-options');
        if (!clientSelect) return;

        // Limpiar opciones excepto la primera
        const defaultOption = clientSelect.querySelector('.select-option[data-value=""]');
        clientSelect.innerHTML = '';
        if (defaultOption) {
            clientSelect.appendChild(defaultOption);
        }

        // Agregar clientes desde la base de datos
        this.clients.forEach(client => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.setAttribute('data-value', client.id);
            option.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${client.name} ${client.last_name}</span>
            `;
            
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = `${client.name} ${client.last_name}`;
                const selectedValue = document.querySelector('#client-select .selected-value');
                selectedValue.innerHTML = `<i class="fas fa-user"></i><span>${text}</span>`;
                selectedValue.setAttribute('data-value', client.id);
                
                document.querySelector('#client-select .select-trigger').classList.remove('active');
                clientSelect.classList.remove('active');
                
                setTimeout(() => {
                    this.filterRoutines();
                }, 100);
            });
            
            clientSelect.appendChild(option);
        });
    }

    async loadRoutines() {
        try {
            
            const response = await fetch(`${this.apiBaseUrl}rutinas/`);
            if (!response.ok) {
                throw new Error('Error al cargar las rutinas');
            }
            
            this.routines = await response.json();
            this.filteredRoutines = [...this.routines];
            this.renderTable();
            
        } catch (error) {
            console.error('Error cargando rutinas:', error);
            this.showError('Error al cargar las rutinas');
            this.renderTable();
        }
    }

    renderTable() {
        const tbody = document.getElementById('routines-table-body');
        if (!tbody) return;

        // Quitar la fila de carga
        const loadingRow = document.getElementById('loading-row');
        if (loadingRow) {
            loadingRow.remove();
        }

        if (this.filteredRoutines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 40px; color: #666;">
                        <i class="fas fa-clipboard-list" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                        <p style="margin: 0; font-size: 16px;">No se encontraron rutinas</p>
                        <a href="/entrenador/rutinas/nuevo/" style="color: #32CD32; text-decoration: none; margin-top: 10px; display: inline-block;">
                            <i class="fas fa-plus"></i> Crear primera rutina
                        </a>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredRoutines.map(routine => {
            const clientName = routine.client_name || 'Sin asignar';
            const coachName = routine.coach_name ? `Profesor ${routine.coach_name.charAt(0)}` : '-';
            const createdDate = routine.created_at ? new Date(routine.created_at).toLocaleDateString('es-AR') : '-';
            const description = routine.description ? 
                (routine.description.length > 50 ? routine.description.substring(0, 50) + '...' : routine.description) : 
                'Sin descripción';

            return `
                <tr data-routine-id="${routine.id}">
                    <td>${routine.name}</td>
                    <td>${description}</td>
                    <td>${clientName}</td>
                    <td>${routine.time_week || 0} min</td>
                    <td>${routine.days_per_week || 0} días/semana</td>
                    <td>${createdDate}</td>
                    <td>${coachName}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="action-btn view-btn" onclick="window.rutinasPage.viewRoutine(${routine.id})" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="window.rutinasPage.editRoutine(${routine.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="window.rutinasPage.showDeleteModal(${routine.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterRoutines() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const selectedValue = document.querySelector('#client-select .selected-value');
        const clientFilterId = selectedValue?.getAttribute('data-value') || '';

        this.filteredRoutines = this.routines.filter(routine => {
            const matchesSearch = routine.name.toLowerCase().includes(searchTerm) ||
                                 (routine.description && routine.description.toLowerCase().includes(searchTerm));
            
            const matchesClient = clientFilterId ?
                routine.client == clientFilterId :
                true;
            
            return matchesSearch && matchesClient;
        });

        this.renderTable();
    }

    resetFilters() {
        const clientSelect = document.querySelector('#client-select .selected-value');
        if (clientSelect) {
            clientSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los clientes</span>';
            clientSelect.removeAttribute('data-value');
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredRoutines = [...this.routines];
        this.renderTable();
    }

    async viewRoutine( id ) {
        try {
            const response = await fetch(`${this.apiBaseUrl}rutinas/${id}/`);
            if ( !response.ok ) throw new Error('Error cargando la rutina');
            const routine = await response.json();

            document.getElementById('view-modal-title').textContent = routine.name;   
            document.getElementById('view-client-name').textContent = routine.client_name || "Sin asignar";   
            document.getElementById('view-description').textContent = routine.description || "Sin descripcion";   
            document.getElementById('view-creation-date').textContent = routine.created_at ?
                new Date(routine.created_at).toLocaleDateString('es-AR') : '-';
                
            const exercisesList = document.getElementById('view-exercises-list');
            const todosEjercicios = routine.days_detail?.flatMap(dia => 
                dia.ejercicios.map(ej => ({ ...ej, dia: dia.name }))
            ) || [];

            exercisesList.innerHTML = todosEjercicios.length > 0
                ? todosEjercicios.map(ej => `
                    <div class="exercise-item">
                        <i class="fas fa-dumbbell"></i>
                        <span>
                            <strong>${ej.dia}</strong> — ${ej.exercise_name}
                            <small style="color:#888"> · ${ej.series} series · ${ej.repetitions} reps · ${ej.type_serie}</small>
                        </span>
                    </div>
                `).join('')
                : '<p style="color:#666">No hay ejercicios asignados</p>';

            this.showViewModal();
        } catch ( error ) {
            console.error('Error cargando rutina:', error)
            this.showError('Error al cargar la rutina')
        }
    }

    editRoutine(id) {
        window.location.href = `/entrenador/rutinas/editar/${id}/`;
    }

    showViewModal() {
        const modal = document.getElementById('view-routine-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    hideViewModal() {
        const modal = document.getElementById('view-routine-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    }

    showDeleteModal(id) {
        this.currentRoutineId = id;
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    hideDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
        this.currentRoutineId = null;
    }

    async deleteRoutine() {
        if (!this.currentRoutineId) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}rutinas/${this.currentRoutineId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la rutina');
            }

            this.hideDeleteModal();
            this.showNotification('Rutina eliminada correctamente', 'success');
            await this.loadRoutines();
            
        } catch (error) {
            console.error('Error al eliminar rutina:', error);
            this.showError('Error al eliminar la rutina');
        }
    }

    getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `notification notification-${type}`;
        toast.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.rutinasPage = new RutinasPage();
    window.rutinasPage.initialize();
});