// entidades/static/entrenador/js/pages/entrenadores.js
class EntrenadoresPage {
    constructor() {
        this.initialized = false;
        this.coaches = [];
        this.filteredCoaches = [];
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('Inicializando página de entrenadores');
        
        this.initEventListeners();
        this.loadCoaches();
    }

    initEventListeners() {
        // Filtros
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterCoaches();
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
            confirmDelete.addEventListener('click', () => this.deleteCoach());
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
                        window.entrenadoresPage.filterCoaches();
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

    async loadCoaches() {
        try {
            console.log('Cargando entrenadores desde el backend...');
            
            // TODO: Conectar con API real
            // const response = await fetch('/entrenador/api/entrenadores/');
            // this.coaches = await response.json();
            
            // Datos de ejemplo temporalmente
            this.coaches = [
                {
                    id: 1,
                    name: "Carlos",
                    last_name: "Rodríguez",
                    dni: "12345678A",
                    email: "carlos@entrenador.com",
                    phone: "+34 600 111 222",
                    specialty: "Fuerza y acondicionamiento",
                    status: "activo"
                },
                {
                    id: 2,
                    name: "Ana",
                    last_name: "Martínez",
                    dni: "87654321B",
                    email: "ana@entrenador.com",
                    phone: "+34 600 333 444",
                    specialty: "Rehabilitación deportiva",
                    status: "activo"
                },
                {
                    id: 3,
                    name: "David",
                    last_name: "López",
                    dni: "56781234C",
                    email: "david@entrenador.com",
                    phone: "+34 600 555 666",
                    specialty: "Nutrición deportiva",
                    status: "inactivo"
                }
            ];
            
            this.filteredCoaches = [...this.coaches];
            this.renderTable();
            
        } catch (error) {
            console.error('Error cargando entrenadores:', error);
            this.showError('Error al cargar los entrenadores');
            
            const tbody = document.getElementById('coaches-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align:center; padding: 30px; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Error al cargar entrenadores
                        </td>
                    </tr>
                `;
            }
        }
    }

    renderTable() {
        const tbody = document.getElementById('coaches-table-body');
        if (!tbody) return;

        if (this.filteredCoaches.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        No se encontraron entrenadores
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredCoaches.map(coach => `
            <tr>
                <td>${coach.name}</td>
                <td>${coach.last_name}</td>
                <td>${coach.dni}</td>
                <td>${coach.email}</td>
                <td>${coach.phone}</td>
                <td>${coach.specialty}</td>
                <td>
                    <span class="status-badge ${coach.status === 'activo' ? 'status-active' : 'status-inactive'}">
                        ${coach.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" onclick="entrenadoresPage.editCoach(${coach.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="entrenadoresPage.showDeleteModal(${coach.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterCoaches() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const statusSelect = document.querySelector('#status-select .selected-value span');
        const statusFilter = statusSelect?.textContent !== 'Todos los estados' ? 
                             statusSelect?.textContent.toLowerCase() : '';

        this.filteredCoaches = this.coaches.filter(coach => {
            const fullName = `${coach.name || ''} ${coach.last_name || ''}`.toLowerCase();
            const matchesSearch = 
                fullName.includes(searchTerm) || 
                (coach.dni && coach.dni.toLowerCase().includes(searchTerm)) ||
                (coach.email && coach.email.toLowerCase().includes(searchTerm)) ||
                (coach.phone && coach.phone.toLowerCase().includes(searchTerm)) ||
                (coach.specialty && coach.specialty.toLowerCase().includes(searchTerm));
            
            const matchesStatus = statusFilter ? 
                (statusFilter === 'activo' ? coach.status === 'activo' : coach.status === 'inactivo') : 
                true;
            
            return matchesSearch && matchesStatus;
        });

        this.renderTable();
    }

    resetFilters() {
        const statusSelect = document.querySelector('#status-select .selected-value');
        if (statusSelect) {
            statusSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los estados</span>';
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredCoaches = [...this.coaches];
        this.renderTable();
    }

    editCoach(id) {
        // TODO: Redirigir a la página de edición o abrir modal de edición
        console.log('Editando entrenador:', id);
        // window.location.href = `/entrenador/entrenadores/editar/${id}/`;
    }

    showDeleteModal(id) {
        this.currentCoachId = id;
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
        this.currentCoachId = null;
    }

    async deleteCoach() {
        if (this.currentCoachId) {
            const coach = this.coaches.find(c => c.id === this.currentCoachId);
            if (!coach) return;

            if (confirm(`¿Estás seguro de que deseas eliminar al entrenador ${coach.name} ${coach.last_name}? Esta acción no se puede deshacer.`)) {
                try {
                    // TODO: Implementar eliminación real
                    // await fetch(`/entrenador/api/entrenadores/${this.currentCoachId}/`, {
                    //     method: 'DELETE',
                    //     headers: {
                    //         'X-CSRFToken': this.getCSRFToken(),
                    //         'X-Requested-With': 'XMLHttpRequest'
                    //     }
                    // });
                    
                    console.log('Eliminando entrenador:', this.currentCoachId);
                    this.hideDeleteModal();
                    this.showSuccess('Entrenador eliminado correctamente');
                    await this.loadCoaches();
                    
                } catch (error) {
                    console.error('Error eliminando entrenador:', error);
                    this.showError('Error al eliminar el entrenador: ' + error.message);
                }
            }
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
    window.entrenadoresPage = new EntrenadoresPage();
    window.entrenadoresPage.initialize();
});