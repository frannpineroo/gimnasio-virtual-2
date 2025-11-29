// PÁGINA DE NUEVA RUTINA
const nuevaRutinaPage = {
    // Estados
    currentRoutine: null,
    currentDay: 1,
    selectedExercises: [],
    currentExercise: null,
    editingExercise: null,
    exercises: [],
    modalManager: null,
    exercisesModalManager: null,
    configModalManager: null,
    initialized: false,

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.loadExercises();
        this.initModals();
        this.initEventListeners();
        this.checkEditMode();
        console.log('Nueva Rutina page initialized');
    },

    loadExercises() {
        // Cargar ejercicios desde localStorage
        this.exercises = Storage.get('ejercicios') || [
            {
                id: 1,
                nombre: "Press de Banca",
                descripcion: "Ejercicio para desarrollar el pecho",
                grupoMuscular: "pecho",
                tipo: "fuerza",
                equipamiento: "barra, banco",
                imagen: "https://via.placeholder.com/60",
                dificultad: "intermedia"
            },
            {
                id: 2,
                nombre: "Sentadillas",
                descripcion: "Ejercicio fundamental para piernas",
                grupoMuscular: "piernas",
                tipo: "fuerza",
                equipamiento: "barra, rack",
                imagen: "https://via.placeholder.com/60",
                dificultad: "intermedia"
            },
            {
                id: 3,
                nombre: "Dominadas",
                descripcion: "Ejercicio para espalda y brazos",
                grupoMuscular: "espalda",
                tipo: "fuerza",
                equipamiento: "barra de dominadas",
                imagen: "https://via.placeholder.com/60",
                dificultad: "avanzada"
            },
            {
                id: 4,
                nombre: "Press Militar",
                descripcion: "Ejercicio para hombros",
                grupoMuscular: "hombros",
                tipo: "fuerza",
                equipamiento: "barra, rack",
                imagen: "https://via.placeholder.com/60",
                dificultad: "intermedia"
            },
            {
                id: 5,
                nombre: "Peso Muerto",
                descripcion: "Ejercicio completo para espalda y piernas",
                grupoMuscular: "espalda",
                tipo: "fuerza",
                equipamiento: "barra, discos",
                imagen: "https://via.placeholder.com/60",
                dificultad: "avanzada"
            },
            {
                id: 6,
                nombre: "Curl de Bíceps",
                descripcion: "Ejercicio para bíceps",
                grupoMuscular: "brazos",
                tipo: "fuerza",
                equipamiento: "mancuernas",
                imagen: "https://via.placeholder.com/60",
                dificultad: "principiante"
            }
        ];

        // Guardar ejercicios si no existen
        if (!Storage.get('ejercicios')) {
            Storage.set('ejercicios', this.exercises);
        }
    },

    initModals() {
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager no está disponible');
            setTimeout(() => this.initModals(), 100);
            return;
        }

        this.exercisesModalManager = new ModalManager('exercises-modal');
        this.configModalManager = new ModalManager('exercise-config-modal');
        
        console.log('Modals initialized:', this.exercisesModalManager, this.configModalManager);
    },

    initEventListeners() {
        // Guardar rutina
        const saveBtn = document.getElementById('save-routine-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveRoutine());
        }

        // Cambio de días por semana - CORREGIDO
        const daysSelect = document.getElementById('routine-days');
        if (daysSelect) {
            daysSelect.addEventListener('change', (e) => {
                console.log('Days select changed to:', e.target.value);
                this.generateDays(parseInt(e.target.value));
            });
        }

        // Modal de ejercicios
        this.initExercisesModalEvents();
        
        // Modal de configuración
        this.initConfigModalEvents();

        // Filtros de ejercicios
        this.initExerciseFilters();
        
        console.log('Event listeners initialized');
    },

    initExercisesModalEvents() {
        const closeModal = document.getElementById('close-exercises-modal');
        const cancelSelect = document.getElementById('cancel-exercise-select');
        const confirmSelect = document.getElementById('confirm-exercise-select');

        if (closeModal) closeModal.addEventListener('click', () => this.closeExercisesModal());
        if (cancelSelect) cancelSelect.addEventListener('click', () => this.closeExercisesModal());
        if (confirmSelect) confirmSelect.addEventListener('click', () => this.addSelectedExercises());
    },

    initConfigModalEvents() {
        const closeModal = document.getElementById('close-exercise-config-modal');
        const cancelConfig = document.getElementById('cancel-exercise-config');
        const saveConfig = document.getElementById('save-exercise-config');

        if (closeModal) closeModal.addEventListener('click', () => this.closeConfigModal());
        if (cancelConfig) cancelConfig.addEventListener('click', () => this.closeConfigModal());
        if (saveConfig) saveConfig.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveExerciseConfig();
        });
    },

    initExerciseFilters() {
        const searchInput = document.getElementById('exercise-search');
        const muscleFilter = document.getElementById('muscle-group-filter');

        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(() => {
                this.loadExercisesModal();
            }, 300));
        }

        if (muscleFilter) {
            muscleFilter.addEventListener('change', () => {
                this.loadExercisesModal();
            });
        }
    },

    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const routineId = urlParams.get('id');

        if (routineId) {
            this.loadRoutineForEdit(routineId);
        } else {
            this.initializeNewRoutine();
        }
    },

    initializeNewRoutine() {
        this.currentRoutine = {
            id: Helpers.generateId(),
            nombre: '',
            descripcion: '',
            nivel: '',
            duracion: '45-60 min',
            diasSemana: 0,
            ejercicios: 0,
            duracionSemanas: 4,
            objetivo: [],
            tipo: 'template',
            dias: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        document.getElementById('page-title').textContent = 'Nueva Rutina';
    },

    loadRoutineForEdit(routineId) {
        const routines = Storage.get('rutinas') || [];
        const routine = routines.find(r => r.id == routineId);

        if (routine) {
            this.currentRoutine = { ...routine };
            this.populateForm();
            this.generateDays(routine.diasSemana);
            this.loadDaysData();
            document.getElementById('page-title').textContent = 'Editar Rutina';
        } else {
            alert('Rutina no encontrada');
            this.initializeNewRoutine();
        }
    },

    populateForm() {
        document.getElementById('routine-name').value = this.currentRoutine.nombre || '';
        document.getElementById('routine-description').value = this.currentRoutine.descripcion || '';
        document.getElementById('routine-level').value = this.currentRoutine.nivel || '';
        document.getElementById('routine-days').value = this.currentRoutine.diasSemana || '';
        document.getElementById('routine-weeks').value = this.currentRoutine.duracionSemanas || '';

        // Objetivos
        const objectives = document.querySelectorAll('input[name="objective"]');
        objectives.forEach(checkbox => {
            checkbox.checked = this.currentRoutine.objetivo.includes(checkbox.value);
        });
    },

    generateDays(daysCount) {
        console.log('Generating days:', daysCount);
        
        const daysSelector = document.getElementById('days-selector');
        const daysContainer = document.getElementById('days-container');
        const emptyState = document.getElementById('empty-days-state');

        if (!daysCount || daysCount == 0) {
            console.log('No days selected, showing empty state');
            daysSelector.innerHTML = '';
            daysContainer.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
                daysContainer.appendChild(emptyState);
            }
            return;
        }

        // Ocultar estado vacío
        if (emptyState) emptyState.style.display = 'none';

        // Generar pestañas de días
        let tabsHTML = '';
        let daysHTML = '';

        for (let i = 1; i <= daysCount; i++) {
            const isActive = i === 1;
            tabsHTML += `
                <button class="day-tab ${isActive ? 'active' : ''}" data-day="${i}">
                    Día ${i}
                </button>
            `;

            daysHTML += `
                <div class="day-content ${isActive ? 'active' : ''}" id="day-${i}">
                    <div class="day-header">
                        <h4 class="day-title">Día ${i} - Configuración de Ejercicios</h4>
                        <button type="button" class="btn btn-primary btn-sm" onclick="nuevaRutinaPage.openExercisesModal(${i})">
                            <i class="fas fa-plus"></i> Agregar Ejercicios
                        </button>
                    </div>
                    <div class="day-exercises">
                        <div class="added-exercises" id="exercises-day-${i}">
                            <div class="empty-day">
                                <i class="fas fa-dumbbell"></i>
                                <h3>No hay ejercicios agregados</h3>
                                <p>Haz clic en "Agregar Ejercicios" para comenzar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        daysSelector.innerHTML = tabsHTML;
        daysContainer.innerHTML = daysHTML;

        // Agregar event listeners a las pestañas
        document.querySelectorAll('.day-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const day = e.currentTarget.getAttribute('data-day');
                this.switchDay(day);
            });
        });

        // Actualizar días en la rutina actual
        this.currentRoutine.diasSemana = parseInt(daysCount);
        this.initializeDaysData();
        
        console.log('Days generated successfully');
    },

    initializeDaysData() {
        if (!this.currentRoutine.dias) {
            this.currentRoutine.dias = [];
        }

        // Inicializar días vacíos si no existen
        for (let i = 1; i <= this.currentRoutine.diasSemana; i++) {
            const existingDay = this.currentRoutine.dias.find(d => d.dia === i);
            if (!existingDay) {
                this.currentRoutine.dias.push({
                    dia: i,
                    nombre: `Día ${i}`,
                    ejercicios: []
                });
            }
        }

        // Remover días extras si se redujo la cantidad
        this.currentRoutine.dias = this.currentRoutine.dias.filter(d => d.dia <= this.currentRoutine.diasSemana);
        
        console.log('Days data initialized:', this.currentRoutine.dias);
    },

    loadDaysData() {
        if (!this.currentRoutine.dias) return;

        this.currentRoutine.dias.forEach(day => {
            this.renderDayExercises(day.dia, day.ejercicios);
        });
    },

    switchDay(dayNumber) {
        console.log('Switching to day:', dayNumber);
        
        // Remover clase active de todas las pestañas y contenidos
        document.querySelectorAll('.day-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.day-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activar pestaña y contenido seleccionado
        const selectedTab = document.querySelector(`.day-tab[data-day="${dayNumber}"]`);
        const selectedContent = document.getElementById(`day-${dayNumber}`);

        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
            this.currentDay = parseInt(dayNumber);
            console.log('Switched to day:', dayNumber);
        } else {
            console.error('Could not find day elements for day:', dayNumber);
        }
    },

    openExercisesModal(day) {
        this.currentDay = day;
        this.selectedExercises = [];
        document.getElementById('exercises-modal-title').textContent = `Seleccionar Ejercicios - Día ${day}`;
        this.loadExercisesModal();
        console.log('Showing exercises modal for day:', day);
        this.exercisesModalManager.show();
    },

    loadExercisesModal() {
        const searchTerm = document.getElementById('exercise-search')?.value.toLowerCase() || '';
        const muscleGroup = document.getElementById('muscle-group-filter')?.value || '';

        const filteredExercises = this.exercises.filter(exercise => {
            const matchesSearch = exercise.nombre.toLowerCase().includes(searchTerm) ||
                                exercise.descripcion.toLowerCase().includes(searchTerm);
            const matchesMuscle = muscleGroup ? exercise.grupoMuscular === muscleGroup : true;
            
            return matchesSearch && matchesMuscle;
        });

        this.renderExercisesGrid(filteredExercises);
    },

    renderExercisesGrid(exercises) {
        const grid = document.getElementById('exercises-grid');
        
        if (exercises.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <h3>No se encontraron ejercicios</h3>
                    <p>No hay ejercicios que coincidan con los filtros seleccionados.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = exercises.map(exercise => `
            <div class="exercise-card ${this.selectedExercises.includes(exercise.id) ? 'selected' : ''}" 
                 onclick="nuevaRutinaPage.toggleExerciseSelection(${exercise.id})">
                <div class="exercise-checkbox"></div>
                <img src="${exercise.imagen}" alt="${exercise.nombre}" class="exercise-image" onerror="this.src='https://via.placeholder.com/60?text=Ejercicio'">
                <div class="exercise-info">
                    <div class="exercise-name">${exercise.nombre}</div>
                    <div class="exercise-meta">
                        <span><i class="fas fa-dumbbell"></i> ${exercise.grupoMuscular}</span>
                    </div>
                </div>
            </div>
        `).join('');

        this.updateConfirmButton();
    },

    toggleExerciseSelection(exerciseId) {
        const index = this.selectedExercises.indexOf(exerciseId);
        
        if (index === -1) {
            this.selectedExercises.push(exerciseId);
        } else {
            this.selectedExercises.splice(index, 1);
        }

        this.renderExercisesGrid(this.exercises.filter(ex => 
            ex.nombre.toLowerCase().includes(document.getElementById('exercise-search')?.value.toLowerCase() || '')
        ));
    },

    updateConfirmButton() {
        const confirmBtn = document.getElementById('confirm-exercise-select');
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedExercises.length === 0;
        }
    },

    addSelectedExercises() {
        if (this.selectedExercises.length === 0) {
            alert('Selecciona al menos un ejercicio');
            return;
        }

        const selectedExercisesData = this.exercises.filter(ex => 
            this.selectedExercises.includes(ex.id)
        );

        // Agregar ejercicios al día actual
        const currentDayData = this.currentRoutine.dias.find(d => d.dia === this.currentDay);
        if (currentDayData) {
            selectedExercisesData.forEach(exercise => {
                // Verificar si el ejercicio ya existe en el día
                const existingExercise = currentDayData.ejercicios.find(e => e.ejercicioId === exercise.id);
                if (!existingExercise) {
                    currentDayData.ejercicios.push({
                        ejercicioId: exercise.id,
                        ejercicio: exercise,
                        series: 3,
                        repeticiones: '8-12',
                        descanso: '60s',
                        notas: ''
                    });
                }
            });

            this.renderDayExercises(this.currentDay, currentDayData.ejercicios);
            this.closeExercisesModal();
        }
    },

    renderDayExercises(day, exercises) {
        const container = document.getElementById(`exercises-day-${day}`);
        if (!container) return;

        if (exercises.length === 0) {
            container.innerHTML = `
                <div class="empty-day">
                    <i class="fas fa-dumbbell"></i>
                    <h3>No hay ejercicios agregados</h3>
                    <p>Haz clic en "Agregar Ejercicios" para comenzar.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = exercises.map((exercise, index) => `
            <div class="added-exercise" data-exercise-index="${index}">
                <img src="${exercise.ejercicio.imagen}" alt="${exercise.ejercicio.nombre}" class="exercise-image" onerror="this.src='https://via.placeholder.com/60?text=Ejercicio'">
                <div class="exercise-info">
                    <div class="exercise-name">${exercise.ejercicio.nombre}</div>
                    <div class="exercise-config-info">
                        <span><i class="fas fa-layer-group"></i> ${exercise.series} series</span>
                        <span><i class="fas fa-redo"></i> ${exercise.repeticiones} reps</span>
                        <span><i class="fas fa-clock"></i> ${exercise.descanso}</span>
                        ${exercise.notas ? `<span><i class="fas fa-sticky-note"></i> ${exercise.notas}</span>` : ''}
                    </div>
                </div>
                <div class="exercise-actions">
                    <button class="btn-configure" onclick="nuevaRutinaPage.configureExercise(${day}, ${index})">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn-remove" onclick="nuevaRutinaPage.removeExercise(${day}, ${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    configureExercise(day, exerciseIndex) {
        console.log('Configuring exercise - Day:', day, 'Index:', exerciseIndex);
        
        const dayData = this.currentRoutine.dias.find(d => d.dia === day);
        if (!dayData || !dayData.ejercicios[exerciseIndex]) {
            console.error('Exercise not found:', {day, exerciseIndex});
            return;
        }

        this.editingExercise = { day, exerciseIndex };
        this.currentExercise = dayData.ejercicios[exerciseIndex];
        
        console.log('Current exercise:', this.currentExercise);
        this.openConfigModal();
    },

    openConfigModal() {
        if (!this.currentExercise) {
            console.error('No current exercise to configure');
            return;
        }

        console.log('Opening config modal for:', this.currentExercise.ejercicio.nombre);
        
        // Llenar el modal con los datos actuales
        document.getElementById('exercise-config-title').textContent = `Configurar ${this.currentExercise.ejercicio.nombre}`;
        
        // Vista previa
        const preview = document.getElementById('exercise-preview');
        preview.innerHTML = `
            <img src="${this.currentExercise.ejercicio.imagen}" alt="${this.currentExercise.ejercicio.nombre}" class="exercise-image" onerror="this.src='https://via.placeholder.com/60?text=Ejercicio'">
            <div class="exercise-info">
                <div class="exercise-name">${this.currentExercise.ejercicio.nombre}</div>
                <div class="exercise-meta">
                    <span><i class="fas fa-dumbbell"></i> ${this.currentExercise.ejercicio.grupoMuscular}</span>
                </div>
            </div>
        `;

        // Llenar formulario
        document.getElementById('exercise-sets').value = this.currentExercise.series;
        document.getElementById('exercise-reps').value = this.currentExercise.repeticiones;
        document.getElementById('exercise-rest').value = this.currentExercise.descanso;
        document.getElementById('exercise-notes').value = this.currentExercise.notas || '';

        console.log('Showing config modal');
        this.configModalManager.show();
    },

    saveExerciseConfig() {
        if (!this.currentExercise || !this.editingExercise) return;

        const sets = document.getElementById('exercise-sets').value;
        const reps = document.getElementById('exercise-reps').value;
        const rest = document.getElementById('exercise-rest').value;
        const notes = document.getElementById('exercise-notes').value;

        if (!sets || !reps || !rest) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Actualizar el ejercicio
        const dayData = this.currentRoutine.dias.find(d => d.dia === this.editingExercise.day);
        if (dayData && dayData.ejercicios[this.editingExercise.exerciseIndex]) {
            dayData.ejercicios[this.editingExercise.exerciseIndex] = {
                ...dayData.ejercicios[this.editingExercise.exerciseIndex],
                series: parseInt(sets),
                repeticiones: reps,
                descanso: rest,
                notas: notes
            };
        }

        this.renderDayExercises(this.editingExercise.day, dayData.ejercicios);
        this.closeConfigModal();
    },

    removeExercise(day, exerciseIndex) {
        if (confirm('¿Estás seguro de que deseas eliminar este ejercicio de la rutina?')) {
            const dayData = this.currentRoutine.dias.find(d => d.dia === day);
            if (dayData) {
                dayData.ejercicios.splice(exerciseIndex, 1);
                this.renderDayExercises(day, dayData.ejercicios);
            }
        }
    },

    closeExercisesModal() {
        this.exercisesModalManager.hide();
        this.selectedExercises = [];
    },

    closeConfigModal() {
        this.configModalManager.hide();
        this.currentExercise = null;
        this.editingExercise = null;
    },

    saveRoutine() {
        // Validar formulario
        if (!this.validateForm()) return;

        // Recolectar datos del formulario
        this.collectFormData();

        // Calcular total de ejercicios
        this.calculateTotalExercises();

        // Guardar en localStorage
        this.saveToStorage();

        alert('Rutina guardada correctamente!');
        window.location.href = 'rutinas.html';
    },

    validateForm() {
        const name = document.getElementById('routine-name').value;
        const level = document.getElementById('routine-level').value;
        const days = document.getElementById('routine-days').value;
        const weeks = document.getElementById('routine-weeks').value;

        if (!name || !level || !days || !weeks) {
            alert('Por favor, completa todos los campos obligatorios.');
            return false;
        }

        // Verificar que todos los días tengan al menos un ejercicio
        for (let day of this.currentRoutine.dias) {
            if (day.ejercicios.length === 0) {
                alert(`El Día ${day.dia} no tiene ejercicios agregados.`);
                this.switchDay(day.dia);
                return false;
            }
        }

        return true;
    },

    collectFormData() {
        this.currentRoutine.nombre = document.getElementById('routine-name').value;
        this.currentRoutine.descripcion = document.getElementById('routine-description').value;
        this.currentRoutine.nivel = document.getElementById('routine-level').value;
        this.currentRoutine.duracionSemanas = parseInt(document.getElementById('routine-weeks').value);
        this.currentRoutine.updated_at = new Date().toISOString();

        // Objetivos
        const objectives = [];
        document.querySelectorAll('input[name="objective"]:checked').forEach(checkbox => {
            objectives.push(checkbox.value);
        });
        this.currentRoutine.objetivo = objectives;
    },

    calculateTotalExercises() {
        let total = 0;
        this.currentRoutine.dias.forEach(day => {
            total += day.ejercicios.length;
        });
        this.currentRoutine.ejercicios = total;
    },

    saveToStorage() {
        const routines = Storage.get('rutinas') || [];
        
        // Buscar si ya existe la rutina
        const existingIndex = routines.findIndex(r => r.id === this.currentRoutine.id);
        
        if (existingIndex !== -1) {
            // Actualizar rutina existente
            routines[existingIndex] = this.currentRoutine;
        } else {
            // Agregar nueva rutina
            routines.push(this.currentRoutine);
        }

        Storage.set('rutinas', routines);
    }
};

// Helper functions
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

        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
    };
    window.Helpers = Helpers;
}

// Inicialización automática
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeNuevaRutinaPage();
        });
    } else {
        initializeNuevaRutinaPage();
    }

    function initializeNuevaRutinaPage() {
        if (window.nuevaRutinaPage && window.nuevaRutinaPage.initialized) return;
        
        setTimeout(() => {
            if (window.nuevaRutinaPage) {
                console.log('Auto-initializing nueva rutina page');
                window.nuevaRutinaPage.initialize();
            }
        }, 200);
    }
})();

// Hacer disponible globalmente
window.nuevaRutinaPage = nuevaRutinaPage;