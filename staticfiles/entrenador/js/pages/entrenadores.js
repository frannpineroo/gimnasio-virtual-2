// PÁGINA DE ENTRENADORES OPTIMIZADA
const entrenadoresPage = {
    tableManager: null,
    modalManager: null,
    coaches: [],
    filteredCoaches: [],
    initialized: false,

    initialize() {
        if (this.initialized) {
            console.log('Entrenadores page already initialized');
            return;
        }
        
        this.initialized = true;
        this.loadData();
        this.initTable();
        this.initModal();
        this.initEventListeners();
        console.log('Entrenadores page initialized');
    },

    loadData() {
        this.coaches = JSON.parse(localStorage.getItem('entrenadores')) || [
            {
                id: 1,
                name: 'Carlos',
                last_name: 'Gómez',
                dni: '12345678A',
                email: 'carlos.gomez@training.com',
                phone: '+34 612 345 678',
                specialty: 'Fuerza y acondicionamiento',
                certifications: 'Certificación NSCA, Certificación en Nutrición Deportiva',
                years_of_experience: 5,
                status: 'active',
                hiring_date: '2020-03-15'
            },
            {
                id: 2,
                name: 'Ana',
                last_name: 'Martínez',
                dni: '87654321B',
                email: 'ana.martinez@training.com',
                phone: '+34 698 765 432',
                specialty: 'Yoga y Pilates',
                certifications: 'Certificación en Yoga Avanzado, Instructora de Pilates',
                years_of_experience: 3,
                status: 'active',
                hiring_date: '2021-06-01'
            },
            {
                id: 3,
                name: 'Miguel',
                last_name: 'Rodríguez',
                dni: '11223344C',
                email: 'miguel.rodriguez@training.com',
                phone: '+34 611 222 333',
                specialty: 'Rehabilitación deportiva',
                certifications: 'Fisioterapeuta deportivo, Certificación en Recuperación Funcional',
                years_of_experience: 8,
                status: 'inactive',
                hiring_date: '2018-09-10'
            }
        ];

        this.filteredCoaches = [...this.coaches];
    },

    initTable() {
        if (typeof TableManager === 'undefined') {
            console.error('TableManager no está disponible');
            setTimeout(() => this.initTable(), 100);
            return;
        }

        this.tableManager = new TableManager({
            tableId: 'coaches-table',
            columns: [
                { key: 'name', label: 'Nombre', type: 'text' },
                { key: 'last_name', label: 'Apellido', type: 'text' },
                { key: 'dni', label: 'DNI', type: 'text' },
                { key: 'email', label: 'Email', type: 'text' },
                { key: 'specialty', label: 'Especialidad', type: 'text' },
                { key: 'status', label: 'Estado', type: 'status' }
            ],
            actions: {
                edit: (id) => this.editCoach(id),
                delete: (id) => this.deleteCoach(id)
            }
        });

        this.tableManager.render(this.filteredCoaches);
    },

    initModal() {
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager no está disponible');
            setTimeout(() => this.initModal(), 100);
            return;
        }

        this.modalManager = new ModalManager('coach-modal');
        
        const form = document.getElementById('coach-form');
        if (form) {
            form.addEventListener('submit', (e) => this.saveCoach(e));
        }
        
        const cancelForm = document.getElementById('cancel-form');
        if (cancelForm) {
            cancelForm.addEventListener('click', () => {
                this.modalManager.hide();
            });
        }
    },

    initEventListeners() {
        const addCoachBtn = document.getElementById('add-coach-btn');
        if (addCoachBtn) {
            addCoachBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        this.initFilters();
    },

    initFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(() => {
                this.filterCoaches();
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
                        entrenadoresPage.filterCoaches();
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

    filterCoaches() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const statusSelect = document.querySelector('#status-select .selected-value span');
        const statusFilter = statusSelect.textContent !== 'Todos los estados' ? 
                             statusSelect.textContent.toLowerCase() : '';

        this.filteredCoaches = this.coaches.filter(coach => {
            const matchesSearch = 
                coach.name.toLowerCase().includes(searchTerm) || 
                coach.last_name.toLowerCase().includes(searchTerm) ||
                coach.dni.toLowerCase().includes(searchTerm) ||
                coach.email.toLowerCase().includes(searchTerm) ||
                coach.specialty.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter ? coach.status === statusFilter : true;
            
            return matchesSearch && matchesStatus;
        });

        if (this.tableManager) {
            this.tableManager.render(this.filteredCoaches);
        }
    },

    resetFilters() {
        const statusSelect = document.querySelector('#status-select .selected-value');
        statusSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los estados</span>';
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredCoaches = [...this.coaches];
        if (this.tableManager) {
            this.tableManager.render(this.filteredCoaches);
        }
    },

    openModal(coachId = null) {
        const isEdit = !!coachId;
        this.modalManager.setTitle(isEdit ? 'Editar Entrenador' : 'Nuevo Entrenador');
        
        if (isEdit) {
            this.loadCoachData(coachId);
        } else {
            this.modalManager.clearForm();
            document.getElementById('coach-id').value = '';
        }
        
        this.modalManager.show();
    },

    loadCoachData(id) {
        const coach = this.coaches.find(c => c.id == id);
        if (coach) {
            document.getElementById('coach-id').value = coach.id;
            document.getElementById('coach-name').value = coach.name;
            document.getElementById('coach-last-name').value = coach.last_name;
            document.getElementById('coach-dni').value = coach.dni;
            document.getElementById('coach-email').value = coach.email;
            document.getElementById('coach-phone').value = coach.phone || '';
            document.getElementById('coach-specialty').value = coach.specialty || '';
            document.getElementById('coach-certifications').value = coach.certifications || '';
            document.getElementById('coach-experience').value = coach.years_of_experience;
            document.getElementById('coach-status').value = coach.status;
        }
    },

    saveCoach(e) {
        e.preventDefault();
        
        const coachData = {
            id: document.getElementById('coach-id').value || Helpers.generateId(),
            name: document.getElementById('coach-name').value,
            last_name: document.getElementById('coach-last-name').value,
            dni: document.getElementById('coach-dni').value,
            email: document.getElementById('coach-email').value,
            phone: document.getElementById('coach-phone').value,
            specialty: document.getElementById('coach-specialty').value,
            certifications: document.getElementById('coach-certifications').value,
            years_of_experience: parseInt(document.getElementById('coach-experience').value) || 0,
            status: document.getElementById('coach-status').value,
            hiring_date: new Date().toISOString().split('T')[0]
        };

        if (!coachData.name || !coachData.last_name || !coachData.dni || !coachData.email) {
            alert('Por favor, completa los campos obligatorios (Nombre, Apellido, DNI y Email).');
            return;
        }

        const isEdit = !!document.getElementById('coach-id').value;
        
        if (isEdit) {
            const index = this.coaches.findIndex(c => c.id == coachData.id);
            coachData.hiring_date = this.coaches[index].hiring_date;
            this.coaches[index] = coachData;
        } else {
            this.coaches.push(coachData);
        }

        localStorage.setItem('entrenadores', JSON.stringify(this.coaches));
        this.tableManager.render(this.coaches);
        this.modalManager.hide();
        
        alert(isEdit ? 'Entrenador actualizado!' : 'Entrenador creado!');
    },

    editCoach(id) {
        this.openModal(id);
    },

    deleteCoach(id) {
        if (confirm('¿Estás seguro de eliminar este entrenador?')) {
            this.coaches = this.coaches.filter(c => c.id != id);
            localStorage.setItem('entrenadores', JSON.stringify(this.coaches));
            this.tableManager.render(this.coaches);
        }
    }
};

// Inicialización automática cuando el script se carga
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeEntrenadoresPage();
        });
    } else {
        initializeEntrenadoresPage();
    }

    function initializeEntrenadoresPage() {
        if (window.entrenadoresPage && window.entrenadoresPage.initialized) return;
        
        setTimeout(() => {
            if (window.entrenadoresPage) {
                console.log('Auto-initializing entrenadores page');
                window.entrenadoresPage.initialize();
            }
        }, 200);
    }
})();

window.entrenadoresPage = entrenadoresPage;