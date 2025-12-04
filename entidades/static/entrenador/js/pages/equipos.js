// entidades/static/entrenador/js/pages/equipos.js
class EquiposPage {
    constructor() {
        this.initialized = false;
        this.equipment = [];
        this.filteredEquipment = [];
        this.currentEquipmentId = null;
        this.searchTimeout = null;
        this.baseApiUrl = '/entrenador/api/equipos/';
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('Inicializando página de equipos');
        
        this.initModals();
        this.initEventListeners();
        this.loadEquipment();
    }

    async loadEquipment() {
        try {
            console.log('Cargando equipos desde:', this.baseApiUrl);
            
            // Mostrar loading
            const tbody = document.getElementById('equipment-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; padding: 30px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #32CD32;"></i> Cargando equipos...
                        </td>
                    </tr>
                `;
            }

            // Conectar con API real
            const response = await fetch(this.baseApiUrl);
            
            console.log('Respuesta HTTP:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos de API:', data);
            
            // Manejar diferentes formatos de respuesta
            let equipmentData = data;
            
            if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
                equipmentData = data.results;
                console.log('Usando datos paginados, total:', equipmentData.length);
            } else if (Array.isArray(data)) {
                console.log('Usando array directo, total:', equipmentData.length);
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                equipmentData = [data];
                console.log('Convertido objeto único a array');
            } else {
                console.warn('Formato de datos inesperado:', data);
                equipmentData = [];
            }
            
            this.equipment = equipmentData;
            this.filteredEquipment = [...this.equipment];
            console.log('Equipos cargados:', this.equipment.length);
            
            this.renderTable();
            
        } catch (error) {
            console.error('Error cargando equipos:', error);
            this.showError('Error al cargar los equipos. Verifica la conexión con el servidor.');
            
            const tbody = document.getElementById('equipment-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; padding: 30px; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Error al cargar equipos
                            <br><small>${error.message}</small>
                        </td>
                    </tr>
                `;
            }
        }
    }

    renderTable() {
        const tbody = document.getElementById('equipment-table-body');
        if (!tbody) {
            console.error('No se encontró el tbody con id equipment-table-body');
            return;
        }

        console.log('Renderizando tabla con', this.filteredEquipment.length, 'equipos');
        
        if (this.filteredEquipment.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        <i class="fas fa-info-circle"></i> No se encontraron equipos
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredEquipment.map(equip => {
            const name = equip.name || 'N/A';
            const description = equip.description || 'N/A';
            const category = equip.category || 'N/A';
            const model = equip.model || 'N/A';
            const status = equip.status || 'out_of_order';
            const condition = equip.condition || 'poor';
            const id = equip.id || equip.pk || 0;
            
            return `
            <tr data-equipment-id="${id}">
                <td>${this.escapeHtml(name)}</td>
                <td class="equipment-description">${this.escapeHtml(description)}</td>
                <td>${this.escapeHtml(category)}</td>
                <td>${this.escapeHtml(model)}</td>
                <td>
                    <span class="status-badge status-${this.formatStatusClass(status)}">
                        ${this.formatStatus(status)}
                    </span>
                </td>
                <td>
                    <span class="condition-badge condition-${condition}">
                        ${this.formatCondition(condition)}
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" data-id="${id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
        
        this.initTableButtons();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    initTableButtons() {
        // Botones de editar
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const equipmentId = button.getAttribute('data-id');
                console.log('Editando equipo:', equipmentId);
                this.editEquipment(equipmentId);
            });
        });
        
        // Botones de eliminar
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const equipmentId = button.getAttribute('data-id');
                console.log('Mostrando modal para eliminar:', equipmentId);
                this.showDeleteModal(equipmentId);
            });
        });
    }

    formatStatus(status) {
        const statusMap = {
            'available': 'Disponible',
            'in_maintenance': 'En Mantenimiento',
            'out_of_order': 'Fuera de Servicio'
        };
        return statusMap[status] || status;
    }

    formatStatusClass(status) {
        const classMap = {
            'available': 'available',
            'in_maintenance': 'maintenance',
            'out_of_order': 'out-of-order'
        };
        return classMap[status] || 'out-of-order';
    }

    formatCondition(condition) {
        const conditionMap = {
            'new': 'Nuevo',
            'good': 'Bueno',
            'fair': 'Regular',
            'poor': 'Malo'
        };
        return conditionMap[condition] || condition;
    }

    initModals() {
        console.log('Inicializando modales...');
        
        // Modal de equipo (solo para editar)
        const equipmentModal = document.getElementById('equipment-modal');
        if (equipmentModal) {
            this.modalManager = {
                show: () => {
                    console.log('Mostrando modal de edición de equipo');
                    equipmentModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                },
                hide: () => {
                    console.log('Ocultando modal de edición de equipo');
                    equipmentModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                },
                clearForm: () => {
                    const form = document.getElementById('equipment-form');
                    if (form) form.reset();
                    document.getElementById('equipment-id').value = '';
                    
                    // Limpiar errores de validación
                    const errorMessages = form.querySelectorAll('.error-message');
                    errorMessages.forEach(error => error.remove());
                    
                    const invalidFields = form.querySelectorAll('.is-invalid');
                    invalidFields.forEach(field => field.classList.remove('is-invalid'));
                    
                    // Establecer fecha actual como máximo para la fecha de compra
                    const purchaseDateInput = document.getElementById('equipment-purchase-date');
                    if (purchaseDateInput) {
                        const today = new Date().toISOString().split('T')[0];
                        purchaseDateInput.max = today;
                    }
                }
            };
        }
    }

    initEventListeners() {
        console.log('Inicializando event listeners...');
        
        // ⛔⛔⛔ NO HAY CÓDIGO PARA EL BOTÓN "Agregar Equipo" ⛔⛔⛔
        // El botón ahora es un enlace (<a>) que redirige automáticamente
        
        // Modal de equipo (editar)
        const closeModal = document.getElementById('close-modal');
        const cancelForm = document.getElementById('cancel-form');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeEquipmentModal());
        }
        
        if (cancelForm) {
            cancelForm.addEventListener('click', () => this.closeEquipmentModal());
        }

        // Formulario de equipo (editar)
        const equipmentForm = document.getElementById('equipment-form');
        if (equipmentForm) {
            equipmentForm.addEventListener('submit', (e) => this.saveEquipment(e));
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
                    document.body.style.overflow = 'auto';
                }
            });
        });

        this.initFilters();
        this.initCustomSelects();
    }

    initFilters() {
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
                    
                    select.setAttribute('data-selected-value', value);
                    
                    trigger.classList.remove('active');
                    options.classList.remove('active');
                    
                    setTimeout(() => {
                        console.log('Filtrando por:', value);
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

    filterEquipment() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const statusSelect = document.querySelector('#status-select');
        const conditionSelect = document.querySelector('#condition-select');
        
        const statusValue = statusSelect?.getAttribute('data-selected-value') || '';
        const conditionValue = conditionSelect?.getAttribute('data-selected-value') || '';
        
        console.log('Filtrando con término:', searchTerm, 'estado:', statusValue, 'condición:', conditionValue);
        
        this.filteredEquipment = this.equipment.filter(equipment => {
            const name = (equipment.name || '').toLowerCase();
            const description = (equipment.description || '').toLowerCase();
            const category = (equipment.category || '').toLowerCase();
            const model = (equipment.model || '').toLowerCase();
            
            const matchesSearch = 
                name.includes(searchTerm) || 
                description.includes(searchTerm) ||
                category.includes(searchTerm) ||
                model.includes(searchTerm);
            
            const matchesStatus = statusValue ? equipment.status === statusValue : true;
            const matchesCondition = conditionValue ? equipment.condition === conditionValue : true;
            
            return matchesSearch && matchesStatus && matchesCondition;
        });

        console.log('Resultados filtrados:', this.filteredEquipment.length);
        this.renderTable();
    }

    resetFilters() {
        const statusSelect = document.querySelector('#status-select');
        const conditionSelect = document.querySelector('#condition-select');
        
        const statusSelectedValue = statusSelect?.querySelector('.selected-value');
        const conditionSelectedValue = conditionSelect?.querySelector('.selected-value');
        
        if (statusSelectedValue) {
            statusSelectedValue.innerHTML = '<i class="fas fa-list"></i><span>Todos los estados</span>';
            statusSelect.removeAttribute('data-selected-value');
        }
        
        if (conditionSelectedValue) {
            conditionSelectedValue.innerHTML = '<i class="fas fa-list"></i><span>Todas las condiciones</span>';
            conditionSelect.removeAttribute('data-selected-value');
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredEquipment = [...this.equipment];
        console.log('Filtros reseteados, mostrando:', this.filteredEquipment.length, 'equipos');
        this.renderTable();
    }

    openEquipmentModal(equipmentId) {
        console.log('Abriendo modal para editar equipo ID:', equipmentId);
        
        // Solo abrir si hay un ID (para edición)
        if (!equipmentId) {
            console.error('Se intentó abrir el modal de edición sin un ID de equipo');
            return;
        }
        
        if (this.modalManager) {
            this.loadEquipmentData(equipmentId);
            this.modalManager.show();
        } else {
            console.error('modalManager no está disponible');
            // Fallback
            const modal = document.getElementById('equipment-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                this.loadEquipmentData(equipmentId);
            }
        }
    }

    loadEquipmentData(id) {
        console.log('Cargando datos del equipo ID:', id);
        const equipment = this.equipment.find(e => e.id == id);
        if (equipment) {
            console.log('Equipo encontrado:', equipment);
            document.getElementById('equipment-id').value = equipment.id;
            document.getElementById('equipment-name').value = equipment.name || '';
            document.getElementById('equipment-category').value = equipment.category || '';
            document.getElementById('equipment-model').value = equipment.model || '';
            document.getElementById('equipment-description').value = equipment.description || '';
            
            // Formatear fecha para el input date
            if (equipment.purchase_date) {
                const purchaseDate = new Date(equipment.purchase_date);
                const formattedDate = purchaseDate.toISOString().split('T')[0];
                document.getElementById('equipment-purchase-date').value = formattedDate;
            } else {
                document.getElementById('equipment-purchase-date').value = '';
            }
            
            document.getElementById('equipment-status').value = equipment.status || 'available';
            document.getElementById('equipment-condition').value = equipment.condition || 'good';
        } else {
            console.error('Equipo no encontrado con ID:', id);
            this.showError('Equipo no encontrado');
        }
    }

    async saveEquipment(e) {
        e.preventDefault();
        console.log('Actualizando equipo...');
        
        // Validación básica
        const requiredFields = [
            'equipment-name',
            'equipment-category',
            'equipment-status',
            'equipment-condition'
        ];
        
        let isValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                this.showFieldError(field, 'Este campo es obligatorio');
            }
        });
        
        // Validación de fecha (no puede ser futura)
        const purchaseDateField = document.getElementById('equipment-purchase-date');
        if (purchaseDateField && purchaseDateField.value.trim()) {
            const today = new Date().toISOString().split('T')[0];
            if (purchaseDateField.value > today) {
                isValid = false;
                this.showFieldError(purchaseDateField, 'La fecha no puede ser futura');
            }
        }
        
        if (!isValid) {
            this.showError('Por favor, completa todos los campos obligatorios correctamente.');
            return;
        }
        
        const id = document.getElementById('equipment-id').value;
        if (!id) {
            this.showError('ID de equipo no válido');
            return;
        }
        
        const equipmentData = {
            name: document.getElementById('equipment-name').value,
            category: document.getElementById('equipment-category').value,
            model: document.getElementById('equipment-model').value || null,
            description: document.getElementById('equipment-description').value || null,
            purchase_date: document.getElementById('equipment-purchase-date').value || null,
            status: document.getElementById('equipment-status').value,
            condition: document.getElementById('equipment-condition').value
        };
        
        console.log('Datos a actualizar:', equipmentData);
        console.log('ID del equipo:', id);
        
        try {
            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(equipmentData)
            };

            const url = `${this.baseApiUrl}${id}/`;
            console.log('Enviando a:', url, 'con método:', options.method);
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                
                // Mostrar errores de validación del servidor
                if (errorData) {
                    let errorMessages = [];
                    for (const [field, errors] of Object.entries(errorData)) {
                        if (Array.isArray(errors)) {
                            errorMessages.push(`${field}: ${errors.join(', ')}`);
                        } else {
                            errorMessages.push(`${field}: ${errors}`);
                        }
                    }
                    throw new Error(errorMessages.join('; '));
                }
                
                throw new Error(errorData.detail || errorData.message || `Error ${response.status}`);
            }
            
            const savedEquipment = await response.json();
            console.log('Equipo actualizado:', savedEquipment);
            
            this.showSuccess('Equipo actualizado correctamente!');
            
            this.closeEquipmentModal();
            // Recargar la lista de equipos
            await this.loadEquipment();
            
        } catch (error) {
            console.error('Error actualizando equipo:', error);
            this.showError('Error al actualizar el equipo: ' + error.message);
        }
    }

    showFieldError(field, message) {
        field.classList.add('is-invalid');
        
        // Remover mensaje de error anterior
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Añadir nuevo mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        
        field.parentNode.appendChild(errorDiv);
    }

    getCSRFToken() {
        // Primero buscar en un input hidden (en el modal)
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            return csrfToken.value;
        }
        
        // Fallback: buscar en cookies
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }

    closeEquipmentModal() {
        if (this.modalManager) {
            this.modalManager.hide();
        } else {
            const modal = document.getElementById('equipment-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    }

    editEquipment(id) {
        console.log('Editando equipo ID:', id);
        this.openEquipmentModal(id);
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
        if (!this.currentEquipmentId) {
            this.showError('No hay equipo seleccionado para eliminar');
            return;
        }

        const equipment = this.equipment.find(e => e.id == this.currentEquipmentId);
        if (!equipment) {
            this.showError('Equipo no encontrado');
            this.hideDeleteModal();
            return;
        }

        try {
            console.log('Eliminando equipo ID:', this.currentEquipmentId);
            
            const response = await fetch(`${this.baseApiUrl}${this.currentEquipmentId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Respuesta DELETE:', response.status);
            
            if (!response.ok) {
                let errorMessage = `Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (e) {
                    // No se pudo parsear JSON
                }
                throw new Error(errorMessage);
            }
            
            this.hideDeleteModal();
            this.showSuccess('Equipo eliminado correctamente');
            
            // Recargar la lista de equipos
            await this.loadEquipment();
            
        } catch (error) {
            console.error('Error eliminando equipo:', error);
            this.showError('Error al eliminar el equipo: ' + error.message);
            this.hideDeleteModal();
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
    window.equiposPage = new EquiposPage();
    window.equiposPage.initialize();
});