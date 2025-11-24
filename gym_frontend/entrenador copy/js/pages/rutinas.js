// PÁGINA DE RUTINAS
const rutinasPage = {
    tableManager: null,
    modalManager: null,
    routines: [],
    filteredRoutines: [],
    routineToDelete: null,
    initialized: false,

    initialize() {
        if (this.initialized) {
            console.log('Rutinas page already initialized');
            return;
        }
        
        this.initialized = true;
        this.loadData();
        this.initTable();
        this.initModals();
        this.initEventListeners();
        console.log('Rutinas page initialized');
    },

    loadData() {
        // Cargar rutinas usando el Storage unificado
        let storedRoutines = Storage.get('rutinas');
        
        if (!storedRoutines) {
            // Datos iniciales de ejemplo
            this.routines = [
                {
                    id: 1,
                    nombre: "Rutina Principiante Full Body",
                    descripcion: "Rutina completa para quienes comienzan en el gimnasio",
                    nivel: "beginner",
                    duracion: "45-60 min",
                    diasSemana: 3,
                    ejercicios: 8,
                    duracionSemanas: 4,
                    objetivo: ["perdida_grasa", "ganancia_muscular", "mantenimiento"],
                    tipo: "template",
                    dias: [
                        {
                            dia: 1,
                            nombre: "Día 1 - Full Body",
                            ejercicios: [
                                { ejercicioId: 1, series: 3, repeticiones: "10-12", descanso: "60s", notas: "Mantener forma correcta" }
                            ]
                        }
                    ]
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
                    objetivo: ["ganancia_muscular", "mejora_rendimiento"],
                    tipo: "template",
                    dias: [
                        {
                            dia: 1,
                            nombre: "Día 1 - Pecho y Espalda",
                            ejercicios: [
                                { ejercicioId: 2, series: 4, repeticiones: "6-8", descanso: "90s", notas: "Peso progresivo" }
                            ]
                        }
                    ]
                },
                {
                    id: 3,
                    nombre: "Rutina Pérdida de Grasa",
                    descripcion: "Enfocada en quema de grasa con circuitos",
                    nivel: "intermediate",
                    duracion: "50-65 min",
                    diasSemana: 5,
                    ejercicios: 15,
                    duracionSemanas: 8,
                    objetivo: ["perdida_grasa"],
                    tipo: "assigned",
                    clienteId: 1,
                    dias: []
                }
            ];
            // Guardar datos iniciales usando Storage
            Storage.set('rutinas', this.routines);
        } else {
            this.routines = storedRoutines;
        }

        this.filteredRoutines = [...this.routines];
        console.log('Routines loaded:', this.routines);
    },

    initTable() {
        if (typeof TableManager === 'undefined') {
            console.error('TableManager no está disponible');
            setTimeout(() => this.initTable(), 100);
            return;
        }

        this.tableManager = new TableManager({
            tableId: 'routines-table',
            columns: [
                { key: 'nombre', label: 'Nombre', type: 'text' },
                { key: 'descripcion', label: 'Descripción', type: 'text' },
                { key: 'diasSemana', label: 'Días/Semana', type: 'text' },
                { key: 'duracion', label: 'Duración', type: 'text' },
                { key: 'nivel', label: 'Nivel', type: 'text' },
                { key: 'ejercicios', label: 'Ejercicios', type: 'text' }
            ],
            actions: {
                edit: (id) => this.editRoutine(id),
                delete: (id) => this.confirmDeleteRoutine(id)
            }
        });

        this.tableManager.render(this.filteredRoutines);
    },

    initModals() {
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager no está disponible');
            setTimeout(() => this.initModals(), 100);
            return;
        }

        this.modalManager = new ModalManager('delete-modal');
    },

    initEventListeners() {
        // Filtros
        this.initFilters();

        // Eventos de modal de eliminación
        this.initModalEvents();
    },

    initFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(() => {
                this.filterRoutines();
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
                        rutinasPage.filterRoutines();
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
        const closeModal = document.getElementById('close-delete-modal');
        const cancelDelete = document.getElementById('cancel-delete');
        const confirmDelete = document.getElementById('confirm-delete');
        
        if (closeModal) closeModal.addEventListener('click', () => this.closeDeleteModal());
        if (cancelDelete) cancelDelete.addEventListener('click', () => this.closeDeleteModal());
        if (confirmDelete) confirmDelete.addEventListener('click', () => this.deleteRoutine());
    },

    filterRoutines() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const typeSelect = document.querySelector('#type-select .selected-value span');
        const levelSelect = document.querySelector('#level-select .selected-value span');
        
        const typeFilter = typeSelect.textContent !== 'Todos los tipos' ? 
                          typeSelect.textContent === 'Plantilla' ? 'template' : 'assigned' : '';
        const levelFilter = levelSelect.textContent !== 'Todos los niveles' ? 
                           this.getLevelKey(levelSelect.textContent) : '';

        this.filteredRoutines = this.routines.filter(routine => {
            const matchesSearch = routine.nombre.toLowerCase().includes(searchTerm) || 
                                 routine.descripcion.toLowerCase().includes(searchTerm);
            const matchesType = typeFilter ? routine.tipo === typeFilter : true;
            const matchesLevel = levelFilter ? routine.nivel === levelFilter : true;
            
            return matchesSearch && matchesType && matchesLevel;
        });

        if (this.tableManager) {
            this.tableManager.render(this.filteredRoutines);
        }
    },

    getLevelKey(levelText) {
        const levels = {
            'Principiante': 'beginner',
            'Intermedio': 'intermediate',
            'Avanzado': 'advanced'
        };
        return levels[levelText] || '';
    },

    resetFilters() {
        const typeSelect = document.querySelector('#type-select .selected-value');
        const levelSelect = document.querySelector('#level-select .selected-value');
        
        typeSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los tipos</span>';
        levelSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los niveles</span>';
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredRoutines = [...this.routines];
        if (this.tableManager) {
            this.tableManager.render(this.filteredRoutines);
        }
    },

    editRoutine(id) {
        // Redirigir a la página de edición de rutina
        window.location.href = `nueva-rutina.html?id=${id}`;
    },

    confirmDeleteRoutine(id) {
        const routine = this.routines.find(r => r.id == id);
        if (!routine) return;

        // Verificar si la rutina está asignada a algún cliente usando Storage
        const clients = Storage.get('clientes') || [];
        const isAssigned = clients.some(client => client.rutinaAsignada == id);

        if (isAssigned) {
            alert('No se puede eliminar esta rutina porque está asignada a uno o más clientes.');
            return;
        }

        this.routineToDelete = id;
        this.modalManager.show();
    },

    deleteRoutine() {
        if (!this.routineToDelete) return;

        this.routines = this.routines.filter(r => r.id != this.routineToDelete);
        Storage.set('rutinas', this.routines);
        
        this.closeDeleteModal();
        this.resetFilters();
        
        alert('Rutina eliminada correctamente!');
    },

    closeDeleteModal() {
        this.modalManager.hide();
        this.routineToDelete = null;
    }
};

// Helper functions extension
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeRutinasPage();
        });
    } else {
        initializeRutinasPage();
    }

    function initializeRutinasPage() {
        if (window.rutinasPage && window.rutinasPage.initialized) return;
        
        setTimeout(() => {
            if (window.rutinasPage) {
                console.log('Auto-initializing rutinas page');
                window.rutinasPage.initialize();
            }
        }, 200);
    }
})();

// Hacer disponible globalmente
window.rutinasPage = rutinasPage;