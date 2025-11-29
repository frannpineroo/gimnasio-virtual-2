// PÁGINA DE MÚSCULOS OPTIMIZADA
const musculosPage = {
    tableManager: null,
    groupModalManager: null,
    subgroupModalManager: null,
    muscleGroups: [],
    muscleSubgroups: [],
    exercises: [],
    filteredData: [],
    initialized: false,

    initialize() {
        if (this.initialized) {
            console.log('Músculos page already initialized');
            return;
        }
       
        this.initialized = true;
        this.loadData();
        this.initTable();
        this.initModals();
        this.initEventListeners();
        console.log('Músculos page initialized');
    },

    loadData() {
        // Cargar grupos musculares
        this.muscleGroups = Storage.get('muscle_groups') || [
            {
                id: 1,
                name: 'Pectorales',
                // SE ELIMINÓ DESCRIPTION
                type: 'group',
                exercise_count: 12,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Espalda',
                // SE ELIMINÓ DESCRIPTION
                type: 'group',
                exercise_count: 15,
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Piernas',
                // SE ELIMINÓ DESCRIPTION
                type: 'group',
                exercise_count: 20,
                created_at: new Date().toISOString()
            }
        ];

        // Cargar subgrupos musculares
        this.muscleSubgroups = Storage.get('muscle_subgroups') || [
            {
                id: 1,
                name: 'Pectoral Mayor',
                // SE ELIMINÓ DESCRIPTION
                parent_group_id: 1,
                parent_group_name: 'Pectorales',
                type: 'subgroup',
                exercise_count: 8,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Pectoral Menor',
                // SE ELIMINÓ DESCRIPTION
                parent_group_id: 1,
                parent_group_name: 'Pectorales',
                type: 'subgroup',
                exercise_count: 4,
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Dorsales',
                // SE ELIMINÓ DESCRIPTION
                parent_group_id: 2,
                parent_group_name: 'Espalda',
                type: 'subgroup',
                exercise_count: 10,
                created_at: new Date().toISOString()
            }
        ];

        // Combinar datos para la tabla
        this.combineData();
    },

    combineData() {
        this.filteredData = [
            ...this.muscleGroups.map(group => ({
                ...group,
                parent_group_name: '-',
                display_type: 'group'
            })),
            ...this.muscleSubgroups.map(subgroup => ({
                ...subgroup,
                display_type: 'subgroup'
            }))
        ].sort((a, b) => a.name.localeCompare(b.name));
    },

    initTable() {
        if (typeof TableManager === 'undefined') {
            console.error('TableManager no está disponible');
            setTimeout(() => this.initTable(), 100);
            return;
        }

        this.tableManager = new TableManager({
            tableId: 'muscles-table',
            columns: [
                { key: 'name', label: 'Nombre', type: 'text' },
                { key: 'display_type', label: 'Tipo', type: 'muscle_type' },
                { key: 'parent_group_name', label: 'Grupo Padre', type: 'text' },
                // SE ELIMINÓ LA COLUMNA DESCRIPTION
                { key: 'exercise_count', label: 'Ejercicios Asociados', type: 'exercise_count' }
            ],
            actions: {
                edit: (id) => this.editItem(id),
                delete: (id) => this.deleteItem(id)
            }
        });

        this.tableManager.render(this.filteredData);
    },

    initModals() {
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager no está disponible');
            setTimeout(() => this.initModals(), 100);
            return;
        }

        // Modal para grupos
        this.groupModalManager = new ModalManager('group-modal');
        const groupForm = document.getElementById('group-form');
        if (groupForm) {
            groupForm.addEventListener('submit', (e) => this.saveGroup(e));
        }

        const cancelGroupForm = document.getElementById('cancel-group-form');
        if (cancelGroupForm) {
            cancelGroupForm.addEventListener('click', () => {
                this.groupModalManager.hide();
            });
        }

        // Modal para subgrupos
        this.subgroupModalManager = new ModalManager('subgroup-modal');
        const subgroupForm = document.getElementById('subgroup-form');
        if (subgroupForm) {
            subgroupForm.addEventListener('submit', (e) => this.saveSubgroup(e));
        }

        const cancelSubgroupForm = document.getElementById('cancel-subgroup-form');
        if (cancelSubgroupForm) {
            cancelSubgroupForm.addEventListener('click', () => {
                this.subgroupModalManager.hide();
            });
        }
    },

    initEventListeners() {
        // Botones agregar
        const addGroupBtn = document.getElementById('add-group-btn');
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', () => {
                this.openGroupModal();
            });
        }

        const addSubgroupBtn = document.getElementById('add-subgroup-btn');
        if (addSubgroupBtn) {
            addSubgroupBtn.addEventListener('click', () => {
                this.openSubgroupModal();
            });
        }

        // Filtros
        this.initFilters();
        this.initCustomSelects();
    },

    initFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(() => {
                this.filterData();
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
        const customSelects = document.querySelectorAll('.custom-select');
       
        customSelects.forEach(select => {
            const trigger = select.querySelector('.select-trigger');
            const options = select.querySelector('.select-options');
            const selectedValue = select.querySelector('.selected-value');
            const optionsList = select.querySelectorAll('.select-option');
           
            if (!trigger || !options || !selectedValue) return;

            // Remover event listeners existentes
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
               
                // Cerrar otros selects
                document.querySelectorAll('.select-options.active').forEach(opt => {
                    if (opt !== currentOptions) opt.classList.remove('active');
                });
                document.querySelectorAll('.select-trigger.active').forEach(trig => {
                    if (trig !== currentTrigger) trig.classList.remove('active');
                });
               
                currentTrigger.classList.toggle('active');
                currentOptions.classList.toggle('active');
            });
           
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
                   
                    setTimeout(() => {
                        musculosPage.filterData();
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

    filterData() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const type = this.getSelectedType();

        this.filteredData = [
            ...this.muscleGroups.map(group => ({
                ...group,
                parent_group_name: '-',
                display_type: 'group'
            })),
            ...this.muscleSubgroups.map(subgroup => ({
                ...subgroup,
                display_type: 'subgroup'
            }))
        ].filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                                 // SE ELIMINÓ LA BÚSQUEDA EN DESCRIPTION
                                 item.parent_group_name.toLowerCase().includes(searchTerm);
            const matchesType = !type || item.display_type === type;
           
            return matchesSearch && matchesType;
        }).sort((a, b) => a.name.localeCompare(b.name));

        if (this.tableManager) {
            this.tableManager.render(this.filteredData);
        }
    },

    getSelectedType() {
        const selected = document.querySelector('#type-select .selected-value span');
        if (!selected) return '';
       
        const selectedText = selected.textContent;
        if (selectedText === 'Todos los tipos') return '';
        if (selectedText === 'Grupos Musculares') return 'group';
        if (selectedText === 'Subgrupos Musculares') return 'subgroup';
        return '';
    },

    resetFilters() {
        const typeSelect = document.querySelector('#type-select .selected-value');
        if (typeSelect) {
            typeSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los tipos</span>';
        }
       
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
       
        this.combineData();
        if (this.tableManager) {
            this.tableManager.render(this.filteredData);
        }
    },

    openGroupModal(groupId = null) {
        const isEdit = !!groupId;
        document.getElementById('group-modal-title').textContent = 
            isEdit ? 'Editar Grupo Muscular' : 'Nuevo Grupo Muscular';
       
        if (isEdit) {
            this.loadGroupData(groupId);
        } else {
            this.groupModalManager.clearForm();
            document.getElementById('group-id').value = '';
        }

        this.updateGroupSelect();
        this.groupModalManager.show();
    },

    openSubgroupModal(subgroupId = null) {
        const isEdit = !!subgroupId;
        document.getElementById('subgroup-modal-title').textContent = 
            isEdit ? 'Editar Subgrupo Muscular' : 'Nuevo Subgrupo Muscular';
       
        if (isEdit) {
            this.loadSubgroupData(subgroupId);
        } else {
            this.subgroupModalManager.clearForm();
            document.getElementById('subgroup-id').value = '';
        }

        this.updateGroupSelect();
        this.subgroupModalManager.show();
    },

    updateGroupSelect() {
        const groupSelect = document.getElementById('subgroup-parent');
        if (groupSelect) {
            groupSelect.innerHTML = '<option value="">Seleccionar grupo</option>' +
                this.muscleGroups.map(group => 
                    `<option value="${group.id}">${group.name}</option>`
                ).join('');
        }
    },

    loadGroupData(id) {
        const group = this.muscleGroups.find(g => g.id == id);
        if (group) {
            document.getElementById('group-id').value = group.id;
            document.getElementById('group-name').value = group.name;
            // SE ELIMINÓ LA CARGA DE DESCRIPTION
        }
    },

    loadSubgroupData(id) {
        const subgroup = this.muscleSubgroups.find(s => s.id == id);
        if (subgroup) {
            document.getElementById('subgroup-id').value = subgroup.id;
            document.getElementById('subgroup-name').value = subgroup.name;
            document.getElementById('subgroup-parent').value = subgroup.parent_group_id;
            // SE ELIMINÓ LA CARGA DE DESCRIPTION
        }
    },

    saveGroup(e) {
        e.preventDefault();
       
        const groupData = {
            id: document.getElementById('group-id').value || Helpers.generateId(),
            name: document.getElementById('group-name').value,
            // SE ELIMINÓ DESCRIPTION
            type: 'group',
            exercise_count: 0,
            created_at: new Date().toISOString()
        };

        if (!groupData.name) {
            alert('El nombre del grupo es obligatorio.');
            return;
        }

        const isEdit = !!document.getElementById('group-id').value;
       
        if (isEdit) {
            const index = this.muscleGroups.findIndex(g => g.id == groupData.id);
            this.muscleGroups[index] = groupData;
        } else {
            this.muscleGroups.push(groupData);
        }

        Storage.set('muscle_groups', this.muscleGroups);
        this.combineData();
        this.tableManager.render(this.filteredData);
        this.groupModalManager.hide();
       
        alert(isEdit ? 'Grupo muscular actualizado!' : 'Grupo muscular creado!');
    },

    saveSubgroup(e) {
        e.preventDefault();
       
        const subgroupData = {
            id: document.getElementById('subgroup-id').value || Helpers.generateId(),
            name: document.getElementById('subgroup-name').value,
            // SE ELIMINÓ DESCRIPTION
            parent_group_id: parseInt(document.getElementById('subgroup-parent').value),
            type: 'subgroup',
            exercise_count: 0,
            created_at: new Date().toISOString()
        };

        // Obtener nombre del grupo padre
        const parentGroup = this.muscleGroups.find(g => g.id == subgroupData.parent_group_id);
        subgroupData.parent_group_name = parentGroup ? parentGroup.name : '';

        if (!subgroupData.name || !subgroupData.parent_group_id) {
            alert('El nombre del subgrupo y el grupo padre son obligatorios.');
            return;
        }

        const isEdit = !!document.getElementById('subgroup-id').value;
       
        if (isEdit) {
            const index = this.muscleSubgroups.findIndex(s => s.id == subgroupData.id);
            this.muscleSubgroups[index] = subgroupData;
        } else {
            this.muscleSubgroups.push(subgroupData);
        }

        Storage.set('muscle_subgroups', this.muscleSubgroups);
        this.combineData();
        this.tableManager.render(this.filteredData);
        this.subgroupModalManager.hide();
       
        alert(isEdit ? 'Subgrupo muscular actualizado!' : 'Subgrupo muscular creado!');
    },

    editItem(id) {
        const item = this.filteredData.find(i => i.id == id);
        if (item) {
            if (item.type === 'group') {
                this.openGroupModal(id);
            } else {
                this.openSubgroupModal(id);
            }
        }
    },

    deleteItem(id) {
        const item = this.filteredData.find(i => i.id == id);
        if (!item) return;

        if (confirm(`¿Estás seguro de eliminar ${item.name}?`)) {
            if (item.type === 'group') {
                // Verificar si tiene subgrupos
                const hasSubgroups = this.muscleSubgroups.some(s => s.parent_group_id == id);
                if (hasSubgroups) {
                    alert('No se puede eliminar un grupo muscular que tiene subgrupos asociados.');
                    return;
                }
                this.muscleGroups = this.muscleGroups.filter(g => g.id != id);
                Storage.set('muscle_groups', this.muscleGroups);
            } else {
                this.muscleSubgroups = this.muscleSubgroups.filter(s => s.id != id);
                Storage.set('muscle_subgroups', this.muscleSubgroups);
            }

            this.combineData();
            this.tableManager.render(this.filteredData);
            alert('Elemento eliminado correctamente.');
        }
    }
};

// Extender TableManager para manejar tipos personalizados de músculos
if (typeof TableManager !== 'undefined') {
    const originalFormatCellValue = TableManager.prototype.formatCellValue;
    
    TableManager.prototype.formatCellValue = function(value, type) {
        if (type === 'muscle_type') {
            if (value === 'group') {
                return '<span class="type-badge type-group">Grupo</span>';
            } else if (value === 'subgroup') {
                return '<span class="type-badge type-subgroup">Subgrupo</span>';
            }
        }
        
        if (type === 'exercise_count') {
            return `<span class="exercise-count">${value} ejercicios</span>`;
        }
        
        return originalFormatCellValue.call(this, value, type);
    };
}

// Inicialización automática
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeMusculosPage();
        });
    } else {
        initializeMusculosPage();
    }

    function initializeMusculosPage() {
        if (window.musculosPage && window.musculosPage.initialized) return;
       
        setTimeout(() => {
            if (window.musculosPage) {
                console.log('Auto-initializing musculos page');
                window.musculosPage.initialize();
            }
        }, 500);
    }
})();

// Hacer disponible globalmente
window.musculosPage = musculosPage;