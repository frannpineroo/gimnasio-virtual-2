// entidades/static/entrenador/js/pages/entrenadores.js
class EntrenadoresPage {
    constructor() {
        this.initialized = false;
        this.coaches = [];
        this.filteredCoaches = [];
        this.currentCoachId = null;
        this.searchTimeout = null;
        this.baseApiUrl = '/entrenador/api/entrenadores/';
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        
        this.initModals();
        this.initEventListeners();
        this.loadCoaches();
    }

    async loadCoaches() {
        try {
            
            // Mostrar loading
            const tbody = document.getElementById('coaches-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align:center; padding: 30px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #32CD32;"></i> Cargando entrenadores...
                        </td>
                    </tr>
                `;
            }

            // Conectar con API real
            const response = await fetch(this.baseApiUrl);
            
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Manejar diferentes formatos de respuesta
            let coachesData = data;
            
            if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
                coachesData = data.results;
            } else if (Array.isArray(data)) {
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                coachesData = [data];
            } else {
                coachesData = [];
            }
            
            this.coaches = coachesData;
            this.filteredCoaches = [...this.coaches];
            
            this.renderTable();
            
        } catch (error) {
            this.showError('Error al cargar los entrenadores. Verifica la conexión con el servidor.');
            
            const tbody = document.getElementById('coaches-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align:center; padding: 30px; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Error al cargar entrenadores
                            <br><small>${error.message}</small>
                        </td>
                    </tr>
                `;
            }
        }
    }

    renderTable() {
        const tbody = document.getElementById('coaches-table-body');
        if (!tbody) {
            return;
        }

        
        if (this.filteredCoaches.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        <i class="fas fa-info-circle"></i> No se encontraron entrenadores
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredCoaches.map(coach => {
            const name = coach.name || 'N/A';
            const lastName = coach.last_name || 'N/A';
            const dni = coach.dni || 'N/A';
            const email = coach.email || 'N/A';
            const phone = coach.phone || 'N/A';
            const specialty = coach.specialty || 'N/A';
            const status = coach.status || 'inactive';
            const id = coach.id || coach.pk || 0;
            
            return `
            <tr data-coach-id="${id}">
                <td>${this.escapeHtml(name)}</td>
                <td>${this.escapeHtml(lastName)}</td>
                <td>${this.escapeHtml(dni)}</td>
                <td>${this.escapeHtml(email)}</td>
                <td>${this.escapeHtml(phone)}</td>
                <td>${this.escapeHtml(specialty)}</td>
                <td>
                    <span class="status-badge ${status === 'active' || status === 'activo' ? 'status-active' : 'status-inactive'}">
                        ${this.formatStatus(status)}
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
                const coachId = button.getAttribute('data-id');
                console.log('Editando entrenador:', coachId);
                this.editCoach(coachId);
            });
        });
        
        // Botones de eliminar
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const coachId = button.getAttribute('data-id');
                console.log('Mostrando modal para eliminar:', coachId);
                this.showDeleteModal(coachId);
            });
        });
    }

    formatStatus(status) {
        const statusMap = {
            'active': 'Activo',
            'activo': 'Activo',
            'inactive': 'Inactivo',
            'inactivo': 'Inactivo'
        };
        return statusMap[status] || status;
    }

    initModals() {
        
        // Modal de entrenador
        const coachModal = document.getElementById('coach-modal');
        if (coachModal) {
            this.modalManager = {
                show: () => {
                    console.log('Mostrando modal de entrenador');
                    coachModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                },
                hide: () => {
                    console.log('Ocultando modal de entrenador');
                    coachModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                },
                setTitle: (title) => {
                    const titleEl = document.getElementById('modal-title');
                    if (titleEl) titleEl.textContent = title;
                },
                setSubmitText: (text) => {
                    const submitText = document.getElementById('submit-text');
                    if (submitText) submitText.textContent = text;
                },
                clearForm: () => {
                    const form = document.getElementById('coach-form');
                    if (form) form.reset();
                    document.getElementById('coach-id').value = '';
                    
                    // Limpiar errores de validación
                    const errorMessages = form.querySelectorAll('.error-message');
                    errorMessages.forEach(error => error.remove());
                    
                    const invalidFields = form.querySelectorAll('.is-invalid');
                    invalidFields.forEach(field => field.classList.remove('is-invalid'));
                }
            };
        }
    }

    initEventListeners() {
        
        // Modal de entrenador
        const closeModal = document.getElementById('close-modal');
        const cancelForm = document.getElementById('cancel-form');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeCoachModal());
        }
        
        if (cancelForm) {
            cancelForm.addEventListener('click', () => this.closeCoachModal());
        }

        // Formulario de entrenador
        const coachForm = document.getElementById('coach-form');
        if (coachForm) {
            coachForm.addEventListener('submit', (e) => this.saveCoach(e));
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
                    document.body.style.overflow = 'auto';
                }
            });
        });

        this.initFilters();
        this.initCustomSelects();
        
        // Modificar el botón "Agregar Entrenador" para abrir el modal
        const newCoachBtn = document.querySelector('a.btn.btn-primary[href*="nuevo_entrenador"]');
        if (newCoachBtn) {
            newCoachBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCoachModal();
            });
        }
    }

    initFilters() {
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
                        console.log('Filtrando por estado:', value);
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

    filterCoaches() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const statusSelect = document.querySelector('#status-select');
        const statusValue = statusSelect?.getAttribute('data-selected-value') || '';
        
        console.log('Filtrando con término:', searchTerm, 'y estado:', statusValue);
        
        this.filteredCoaches = this.coaches.filter(coach => {
            const fullName = `${coach.name || ''} ${coach.last_name || ''}`.toLowerCase();
            const dni = (coach.dni || '').toLowerCase();
            const email = (coach.email || '').toLowerCase();
            const phone = (coach.phone || '').toLowerCase();
            const specialty = (coach.specialty || '').toLowerCase();
            
            const matchesSearch = 
                fullName.includes(searchTerm) || 
                dni.includes(searchTerm) ||
                email.includes(searchTerm) ||
                phone.includes(searchTerm) ||
                specialty.includes(searchTerm);
            
            let matchesStatus = true;
            if (statusValue === 'activo') {
                matchesStatus = coach.status === 'active' || coach.status === 'activo';
            } else if (statusValue === 'inactivo') {
                matchesStatus = coach.status === 'inactive' || coach.status === 'inactivo';
            }
            
            return matchesSearch && matchesStatus;
        });

        console.log('Resultados filtrados:', this.filteredCoaches.length);
        this.renderTable();
    }

    resetFilters() {
        const statusSelect = document.querySelector('#status-select');
        const selectedValue = statusSelect?.querySelector('.selected-value');
        if (selectedValue) {
            selectedValue.innerHTML = '<i class="fas fa-list"></i><span>Todos los estados</span>';
            statusSelect.removeAttribute('data-selected-value');
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredCoaches = [...this.coaches];
        console.log('Filtros reseteados, mostrando:', this.filteredCoaches.length, 'entrenadores');
        this.renderTable();
    }

    openCoachModal(coachId = null) {
        console.log('Abriendo modal para entrenador ID:', coachId);
        const isEdit = !!coachId;
        
        if (this.modalManager) {
            this.modalManager.setTitle(isEdit ? 'Editar Entrenador' : 'Nuevo Entrenador');
            this.modalManager.setSubmitText(isEdit ? 'Actualizar Entrenador' : 'Guardar Entrenador');
            
            if (isEdit) {
                this.loadCoachData(coachId);
            } else {
                this.modalManager.clearForm();
            }
            
            this.modalManager.show();
        } else {
            console.error('modalManager no está disponible');
            // Fallback
            const modal = document.getElementById('coach-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                if (isEdit) {
                    document.getElementById('modal-title').textContent = 'Editar Entrenador';
                    document.getElementById('submit-text').textContent = 'Actualizar Entrenador';
                    this.loadCoachData(coachId);
                }
            }
        }
    }

    loadCoachData(id) {
        console.log('Cargando datos del entrenador ID:', id);
        const coach = this.coaches.find(c => c.id == id);
        if (coach) {
            console.log('Entrenador encontrado:', coach);
            document.getElementById('coach-id').value = coach.id;
            document.getElementById('coach-name').value = coach.name || '';
            document.getElementById('coach-lastname').value = coach.last_name || '';
            document.getElementById('coach-dni').value = coach.dni || '';
            document.getElementById('coach-phone').value = coach.phone || '';
            document.getElementById('coach-email').value = coach.email || '';
            document.getElementById('coach-specialty').value = coach.specialty || '';
            document.getElementById('coach-status').value = coach.status || 'active';
        } else {
            console.error('Entrenador no encontrado con ID:', id);
            this.showError('Entrenador no encontrado');
        }
    }

    async saveCoach(e) {
        e.preventDefault();
        console.log('Guardando entrenador...');
        
        // Validación básica
        const requiredFields = [
            'coach-name',
            'coach-lastname', 
            'coach-dni',
            'coach-email',
            'coach-status'
        ];
        
        let isValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                this.showFieldError(field, 'Este campo es obligatorio');
            }
        });
        
        // Validación de email
        const emailField = document.getElementById('coach-email');
        if (emailField && emailField.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value.trim())) {
                isValid = false;
                this.showFieldError(emailField, 'Por favor, ingresa un email válido');
            }
        }
        
        if (!isValid) {
            this.showError('Por favor, completa todos los campos obligatorios correctamente.');
            return;
        }
        
        const id = document.getElementById('coach-id').value;
        const coachData = {
            name: document.getElementById('coach-name').value,
            last_name: document.getElementById('coach-lastname').value,
            dni: document.getElementById('coach-dni').value || null,
            email: document.getElementById('coach-email').value || null,
            phone: document.getElementById('coach-phone').value || null,
            specialty: document.getElementById('coach-specialty').value || null,
            status: document.getElementById('coach-status').value
        };
        
        console.log('Datos a guardar:', coachData);
        console.log('ID del entrenador:', id);
        
        try {
            let response;
            const options = {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(coachData)
            };

            const url = id ? `${this.baseApiUrl}${id}/` : this.baseApiUrl;
            console.log('Enviando a:', url, 'con método:', options.method);
            
            response = await fetch(url, options);
            
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
            
            const savedCoach = await response.json();
            console.log('Entrenador guardado:', savedCoach);
            
            this.showSuccess(id ? 'Entrenador actualizado correctamente!' : 'Entrenador creado correctamente!');
            
            this.closeCoachModal();
            // Recargar la lista de entrenadores
            await this.loadCoaches();
            
        } catch (error) {
            console.error('Error guardando entrenador:', error);
            this.showError('Error al guardar el entrenador: ' + error.message);
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

    closeCoachModal() {
        if (this.modalManager) {
            this.modalManager.hide();
        } else {
            const modal = document.getElementById('coach-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    }

    editCoach(id) {
        console.log('Editando entrenador ID:', id);
        this.openCoachModal(id);
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
        if (!this.currentCoachId) {
            this.showError('No hay entrenador seleccionado para eliminar');
            return;
        }

        const coach = this.coaches.find(c => c.id == this.currentCoachId);
        if (!coach) {
            this.showError('Entrenador no encontrado');
            this.hideDeleteModal();
            return;
        }

        try {
            console.log('Eliminando entrenador ID:', this.currentCoachId);
            
            const response = await fetch(`${this.baseApiUrl}${this.currentCoachId}/`, {
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
            this.showSuccess('Entrenador eliminado correctamente');
            
            // Recargar la lista de entrenadores
            await this.loadCoaches();
            
        } catch (error) {
            console.error('Error eliminando entrenador:', error);
            this.showError('Error al eliminar el entrenador: ' + error.message);
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
    window.entrenadoresPage = new EntrenadoresPage();
    window.entrenadoresPage.initialize();
});