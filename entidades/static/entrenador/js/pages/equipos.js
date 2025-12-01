// entidades/static/entrenador/js/pages/equipos.js
class EquiposPage {
    constructor() {
        this.initialized = false;
        this.equipment = [];
        this.filteredEquipment = [];
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('Inicializando página de equipos');
        
        this.initEventListeners();
        this.loadEquipment();
    }

    initEventListeners() {
        // Filtros
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterEquipment();
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
            confirmDelete.addEventListener('click', () => this.deleteEquipment());
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
                        window.equiposPage.filterEquipment();
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

    async loadEquipment() {
        try {
            console.log('Cargando equipos desde el backend...');
            
            // TODO: Conectar con API real
            // const response = await fetch('/entrenador/api/equipos/');
            // this.equipment = await response.json();
            
            // Datos de ejemplo temporalmente
            this.equipment = [
                {
                    id: 1,
                    name: "Cinta de Correr Pro",
                    description: "Cinta de correr profesional con inclinación automática y programas predefinidos",
                    category: "cardio",
                    model: "TRX-5000",
                    status: "disponible",
                    condition: "excelente"
                },
                {
                    id: 2,
                    name: "Press de Banca",
                    description: "Banco de press plano con soporte para barra y pesas",
                    category: "peso_libre",
                    model: "PB-200",
                    status: "disponible",
                    condition: "bueno"
                },
                {
                    id: 3,
                    name: "Máquina de Poleas",
                    description: "Máquina multipoleas para entrenamiento de espalda y brazos",
                    category: "maquinas",
                    model: "MP-360",
                    status: "mantenimiento",
                    condition: "regular"
                },
                {
                    id: 4,
                    name: "Bicicleta Estática",
                    description: "Bicicleta estática con monitor de ritmo cardíaco y resistencia ajustable",
                    category: "cardio",
                    model: "BE-800",
                    status: "reparacion",
                    condition: "malo"
                },
                {
                    id: 5,
                    name: "Kit Mancuernas",
                    description: "Set de mancuernas ajustables de 5-25kg",
                    category: "accesorios",
                    model: "KM-25",
                    status: "disponible",
                    condition: "excelente"
                }
            ];
            
            this.filteredEquipment = [...this.equipment];
            this.renderTable();
            
        } catch (error) {
            console.error('Error cargando equipos:', error);
            this.showError('Error al cargar los equipos');
            
            const tbody = document.getElementById('equipment-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; padding: 30px; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Error al cargar equipos
                        </td>
                    </tr>
                `;
            }
        }
    }

    renderTable() {
        const tbody = document.getElementById('equipment-table-body');
        if (!tbody) return;

        if (this.filteredEquipment.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        No se encontraron equipos
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredEquipment.map(equipment => `
            <tr>
                <td>${equipment.name}</td>
                <td class="equipment-description">${equipment.description}</td>
                <td>
                    <span class="category-badge category-${equipment.category}">
                        ${this.formatCategory(equipment.category)}
                    </span>
                </td>
                <td>${equipment.model}</td>
                <td>
                    <span class="status-badge status-${equipment.status}">
                        ${this.formatStatus(equipment.status)}
                    </span>
                </td>
                <td>
                    <span class="condition-badge condition-${equipment.condition}">
                        ${this.formatCondition(equipment.condition)}
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" onclick="equiposPage.editEquipment(${equipment.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="equiposPage.showDeleteModal(${equipment.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatCategory(category) {
        const categories = {
            'cardio': 'Cardio',
            'fuerza': 'Fuerza',
            'peso_libre': 'Peso Libre',
            'maquinas': 'Máquinas',
            'accesorios': 'Accesorios'
        };
        return categories[category] || category;
    }

    formatStatus(status) {
        const statuses = {
            'disponible': 'Disponible',
            'mantenimiento': 'Mantenimiento',
            'reparacion': 'Reparación',
            'baja': 'De Baja'
        };
        return statuses[status] || status;
    }

    formatCondition(condition) {
        const conditions = {
            'excelente': 'Excelente',
            'bueno': 'Bueno',
            'regular': 'Regular',
            'malo': 'Malo'
        };
        return conditions[condition] || condition;
    }

    filterEquipment() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const categorySelect = document.querySelector('#category-select .selected-value span');
        const statusSelect = document.querySelector('#status-select .selected-value span');
        
        const categoryFilter = categorySelect?.textContent !== 'Todas las categorías' ? 
                              categorySelect?.getAttribute('data-value') : '';
        const statusFilter = statusSelect?.textContent !== 'Todos los estados' ? 
                            statusSelect?.getAttribute('data-value') : '';

        this.filteredEquipment = this.equipment.filter(equipment => {
            const matchesSearch = 
                equipment.name.toLowerCase().includes(searchTerm) || 
                equipment.description.toLowerCase().includes(searchTerm) ||
                equipment.model.toLowerCase().includes(searchTerm);
            
            const matchesCategory = categoryFilter ? 
                equipment.category === categoryFilter : true;
            
            const matchesStatus = statusFilter ? 
                equipment.status === statusFilter : true;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.renderTable();
    }

    resetFilters() {
        const categorySelect = document.querySelector('#category-select .selected-value');
        const statusSelect = document.querySelector('#status-select .selected-value');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<i class="fas fa-list"></i><span>Todas las categorías</span>';
        }
        
        if (statusSelect) {
            statusSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los estados</span>';
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredEquipment = [...this.equipment];
        this.renderTable();
    }

    editEquipment(id) {
        // TODO: Redirigir a la página de edición o abrir modal de edición
        console.log('Editando equipo:', id);
        // window.location.href = `/entrenador/equipos/editar/${id}/`;
    }

    showDeleteModal(id) {
        this.currentEquipmentId = id;
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
        this.currentEquipmentId = null;
    }

    async deleteEquipment() {
        if (this.currentEquipmentId) {
            const equipment = this.equipment.find(e => e.id === this.currentEquipmentId);
            if (!equipment) return;

            if (confirm(`¿Estás seguro de que deseas eliminar el equipo "${equipment.name}"? Esta acción no se puede deshacer.`)) {
                try {
                    // TODO: Implementar eliminación real
                    // await fetch(`/entrenador/api/equipos/${this.currentEquipmentId}/`, {
                    //     method: 'DELETE',
                    //     headers: {
                    //         'X-CSRFToken': this.getCSRFToken(),
                    //         'X-Requested-With': 'XMLHttpRequest'
                    //     }
                    // });
                    
                    console.log('Eliminando equipo:', this.currentEquipmentId);
                    this.hideDeleteModal();
                    this.showSuccess('Equipo eliminado correctamente');
                    await this.loadEquipment();
                    
                } catch (error) {
                    console.error('Error eliminando equipo:', error);
                    this.showError('Error al eliminar el equipo: ' + error.message);
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
    window.equiposPage = new EquiposPage();
    window.equiposPage.initialize();
});