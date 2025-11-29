// PÁGINA DE EJERCICIOS OPTIMIZADA
const ejerciciosPage = {
    tableManager: null,
    modalManager: null,
    exercises: [],
    filteredExercises: [],
    muscleGroups: [],
    equipment: [],
    initialized: false,

    initialize() {
        if (this.initialized) {
            console.log('Ejercicios page already initialized');
            return;
        }
        
        this.initialized = true;
        this.loadData();
        this.loadMuscleGroupsAndEquipment();
        this.initTable();
        this.initModal();
        this.initEventListeners();
        console.log('Ejercicios page initialized');
    },

    loadData() {
        this.exercises = Storage.get('ejercicios') || [
            {
                id: 1,
                nombre: 'Press de Banca',
                musculo: 'pecho',
                equipamiento: 'Barra Olímpica, Banco de Press',
                descripcion: 'Ejercicio compuesto para desarrollo del pectoral',
                imagen: 'https://via.placeholder.com/60'
            },
            {
                id: 2,
                nombre: 'Sentadillas',
                musculo: 'piernas',
                equipamiento: 'Barra Olímpica, Rack de Sentadillas',
                descripcion: 'Ejercicio fundamental para piernas y glúteos',
                imagen: 'https://via.placeholder.com/60'
            },
            {
                id: 3,
                nombre: 'Dominadas',
                musculo: 'espalda',
                equipamiento: 'Barra de Dominadas',
                descripcion: 'Ejercicio para espalda y brazos',
                imagen: 'https://via.placeholder.com/60'
            }
        ];

        this.filteredExercises = [...this.exercises];
    },

    loadMuscleGroupsAndEquipment() {
        // Cargar equipamiento para extraer grupos musculares
        this.equipment = Storage.get('equipamiento') || [
            {
                id: 1,
                nombre: "Barra Olímpica",
                tipo: "barra",
                grupoMuscular: "fullbody",
                estado: "disponible"
            },
            {
                id: 2,
                nombre: "Banco de Press",
                tipo: "banco",
                grupoMuscular: "pecho",
                estado: "disponible"
            },
            {
                id: 3,
                nombre: "Mancuernas",
                tipo: "mancuernas",
                grupoMuscular: "brazos",
                estado: "disponible"
            },
            {
                id: 4,
                nombre: "Rack de Sentadillas",
                tipo: "rack",
                grupoMuscular: "piernas",
                estado: "disponible"
            },
            {
                id: 5,
                nombre: "Barra de Dominadas",
                tipo: "barra",
                grupoMuscular: "espalda",
                estado: "disponible"
            }
        ];

        // Extraer grupos musculares únicos del equipamiento
        const groups = [...new Set(this.equipment.map(item => item.grupoMuscular))];
        
        // Agregar grupos comunes que puedan faltar
        const commonGroups = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'abdomen', 'gluteos', 'fullbody'];
        
        this.muscleGroups = [...new Set([...groups, ...commonGroups])].sort();
        
        console.log('Muscle groups loaded:', this.muscleGroups);
        console.log('Equipment loaded:', this.equipment);

        // Actualizar selects en la interfaz
        this.updateMuscleGroupSelects();
    },

    updateMuscleGroupSelects() {
        // Actualizar select del filtro
        const filterSelect = document.querySelector('#muscle-select .select-options');
        if (filterSelect) {
            filterSelect.innerHTML = `
                <div class="select-option" data-value="">
                    <i class="fas fa-list"></i>
                    <span>Todos los músculos</span>
                </div>
                ${this.muscleGroups.map(group => `
                    <div class="select-option" data-value="${group}">
                        <i class="fas fa-dumbbell"></i>
                        <span>${this.capitalizeFirstLetter(group)}</span>
                    </div>
                `).join('')}
            `;
        }

        // Actualizar select del modal
        const modalSelect = document.getElementById('exercise-muscle');
        if (modalSelect) {
            modalSelect.innerHTML = `
                <option value="">Seleccionar músculo</option>
                ${this.muscleGroups.map(group => `
                    <option value="${group}">${this.capitalizeFirstLetter(group)}</option>
                `).join('')}
            `;
        }

        // Actualizar select de equipamiento en el modal
        const equipmentSelect = document.getElementById('exercise-equipment');
        if (equipmentSelect) {
            equipmentSelect.innerHTML = `
                <option value="">Seleccionar equipamiento</option>
                ${this.equipment.map(item => `
                    <option value="${item.nombre}">${item.nombre}</option>
                `).join('')}
            `;
        }

        // Re-inicializar custom selects - ESTO ES CLAVE
        setTimeout(() => {
            this.initCustomSelects();
        }, 100);
    },

    capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    initTable() {
        // Verificar que TableManager esté disponible
        if (typeof TableManager === 'undefined') {
            console.error('TableManager no está disponible');
            setTimeout(() => this.initTable(), 100);
            return;
        }

        this.tableManager = new TableManager({
            tableId: 'exercises-table',
            columns: [
                { key: 'nombre', label: 'Nombre', type: 'text' },
                { key: 'musculo', label: 'Músculo', type: 'text' },
                { key: 'equipamiento', label: 'Equipamiento', type: 'text' },
                { key: 'descripcion', label: 'Descripción', type: 'text' }
            ],
            actions: {
                edit: (id) => this.editExercise(id),
                delete: (id) => this.deleteExercise(id)
            }
        });

        this.tableManager.render(this.filteredExercises);
    },

    initModal() {
        // Verificar que ModalManager esté disponible
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager no está disponible');
            setTimeout(() => this.initModal(), 100);
            return;
        }

        this.modalManager = new ModalManager('exercise-modal');
        
        // Configurar formulario
        const form = document.getElementById('exercise-form');
        if (form) {
            form.addEventListener('submit', (e) => this.saveExercise(e));
        }
        
        const cancelForm = document.getElementById('cancel-form');
        if (cancelForm) {
            cancelForm.addEventListener('click', () => {
                this.modalManager.hide();
            });
        }
    },

    initEventListeners() {
        // Botón agregar ejercicio
        const addExerciseBtn = document.getElementById('add-exercise-btn');
        if (addExerciseBtn) {
            addExerciseBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Filtros
        this.initFilters();
        
        // Inicializar custom selects - AGREGAR ESTA LÍNEA
        this.initCustomSelects();
    },

    initFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(() => {
                this.filterExercises();
            }, 300));
        }

        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    },

    initCustomSelects() {
        console.log('Initializing custom selects...');
        
        const customSelects = document.querySelectorAll('.custom-select');
        
        customSelects.forEach(select => {
            const trigger = select.querySelector('.select-trigger');
            const options = select.querySelector('.select-options');
            const selectedValue = select.querySelector('.selected-value');
            const optionsList = select.querySelectorAll('.select-option');
            
            if (!trigger || !options || !selectedValue) {
                console.warn('Missing elements in custom select:', select);
                return;
            }
            
            // Remover event listeners existentes para evitar duplicados
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);
            
            const newOptions = options.cloneNode(true);
            options.parentNode.replaceChild(newOptions, options);
            
            // Actualizar referencias
            const currentTrigger = select.querySelector('.select-trigger');
            const currentOptions = select.querySelector('.select-options');
            const currentSelectedValue = select.querySelector('.selected-value');
            const currentOptionsList = select.querySelectorAll('.select-option');
            
            currentTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                // Cerrar otros selects abiertos
                document.querySelectorAll('.select-options.active').forEach(opt => {
                    if (opt !== currentOptions) {
                        opt.classList.remove('active');
                    }
                });
                document.querySelectorAll('.select-trigger.active').forEach(trig => {
                    if (trig !== currentTrigger) {
                        trig.classList.remove('active');
                    }
                });
                
                // Toggle current select
                currentTrigger.classList.toggle('active');
                currentOptions.classList.toggle('active');
            });
            
            // Agregar event listeners a las opciones
            currentOptionsList.forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const value = this.getAttribute('data-value');
                    const text = this.querySelector('span').textContent;
                    const icon = this.querySelector('i').cloneNode(true);
                    
                    currentSelectedValue.innerHTML = '';
                    currentSelectedValue.appendChild(icon);
                    currentSelectedValue.innerHTML += `<span>${text}</span>`;
                    
                    currentTrigger.classList.remove('active');
                    currentOptions.classList.remove('active');
                    
                    // Aplicar filtro después de seleccionar
                    setTimeout(() => {
                        ejerciciosPage.filterExercises();
                    }, 100);
                });
            });
        });
        
        // Cerrar dropdowns al hacer click fuera
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

    filterExercises() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const muscle = this.getSelectedMuscle();

        console.log('Filtering with:', { searchTerm, muscle });

        this.filteredExercises = this.exercises.filter(exercise => {
            const matchesSearch = exercise.nombre.toLowerCase().includes(searchTerm) ||
                                 exercise.musculo.toLowerCase().includes(searchTerm) ||
                                 exercise.descripcion.toLowerCase().includes(searchTerm) ||
                                 exercise.equipamiento.toLowerCase().includes(searchTerm);
            const matchesMuscle = !muscle || exercise.musculo === muscle;
            
            return matchesSearch && matchesMuscle;
        });

        console.log('Filtered results:', this.filteredExercises.length);

        if (this.tableManager) {
            this.tableManager.render(this.filteredExercises);
        }
    },

    getSelectedMuscle() {
        const selected = document.querySelector('#muscle-select .selected-value span');
        if (!selected) return '';
        
        const selectedText = selected.textContent;
        if (selectedText === 'Todos los músculos') return '';
        
        // Convertir texto formateado a key (ej: "Pecho" -> "pecho")
        return selectedText.toLowerCase();
    },

    resetFilters() {
        // Resetear select de músculo
        const muscleSelect = document.querySelector('#muscle-select .selected-value');
        if (muscleSelect) {
            muscleSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los músculos</span>';
        }
        
        // Resetear búsqueda
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredExercises = [...this.exercises];
        if (this.tableManager) {
            this.tableManager.render(this.filteredExercises);
        }
    },

    openModal(exerciseId = null) {
        const isEdit = !!exerciseId;
        this.modalManager.setTitle(isEdit ? 'Editar Ejercicio' : 'Nuevo Ejercicio');
        
        if (isEdit) {
            this.loadExerciseData(exerciseId);
        } else {
            this.modalManager.clearForm();
            document.getElementById('exercise-id').value = '';
        }
        
        this.modalManager.show();
    },

    loadExerciseData(id) {
        const exercise = this.exercises.find(e => e.id == id);
        if (exercise) {
            document.getElementById('exercise-id').value = exercise.id;
            document.getElementById('exercise-name').value = exercise.nombre;
            document.getElementById('exercise-muscle').value = exercise.musculo;
            document.getElementById('exercise-equipment').value = exercise.equipamiento;
            document.getElementById('exercise-description').value = exercise.descripcion;
            document.getElementById('exercise-image').value = exercise.imagen || '';
        }
    },

    saveExercise(e) {
        e.preventDefault();
        
        const exerciseData = {
            id: document.getElementById('exercise-id').value || Helpers.generateId(),
            nombre: document.getElementById('exercise-name').value,
            musculo: document.getElementById('exercise-muscle').value,
            equipamiento: document.getElementById('exercise-equipment').value,
            descripcion: document.getElementById('exercise-description').value,
            imagen: document.getElementById('exercise-image').value || 'https://via.placeholder.com/60?text=Ejercicio'
        };

        // Validaciones básicas
        if (!exerciseData.nombre || !exerciseData.musculo || !exerciseData.equipamiento) {
            alert('Por favor, completa los campos obligatorios (Nombre, Músculo y Equipamiento).');
            return;
        }

        const isEdit = !!document.getElementById('exercise-id').value;
        
        if (isEdit) {
            const index = this.exercises.findIndex(e => e.id == exerciseData.id);
            this.exercises[index] = exerciseData;
        } else {
            this.exercises.push(exerciseData);
        }

        Storage.set('ejercicios', this.exercises);
        this.filteredExercises = [...this.exercises];
        this.tableManager.render(this.filteredExercises);
        this.modalManager.hide();
        
        alert(isEdit ? 'Ejercicio actualizado!' : 'Ejercicio creado!');
    },

    editExercise(id) {
        this.openModal(id);
    },

    deleteExercise(id) {
        if (confirm('¿Estás seguro de eliminar este ejercicio?')) {
            this.exercises = this.exercises.filter(e => e.id != id);
            Storage.set('ejercicios', this.exercises);
            this.filteredExercises = [...this.exercises];
            this.tableManager.render(this.filteredExercises);
        }
    }
};

// Inicialización automática cuando el script se carga
(function() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeEjerciciosPage();
        });
    } else {
        initializeEjerciciosPage();
    }

    function initializeEjerciciosPage() {
        // Si app.js ya inicializó la página, no hacer nada
        if (window.ejerciciosPage && window.ejerciciosPage.initialized) return;
        
        // Si no, inicializar después de un delay para que los componentes se carguen
        setTimeout(() => {
            if (window.ejerciciosPage) {
                console.log('Auto-initializing ejercicios page');
                window.ejerciciosPage.initialize();
            }
        }, 500);
    }
})();

// Hacer disponible globalmente
window.ejerciciosPage = ejerciciosPage;