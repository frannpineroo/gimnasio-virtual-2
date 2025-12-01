// PÁGINA DE EQUIPAMIENTO OPTIMIZADA
const equipamientoPage = {
    tableManager: null,
    modalManager: null,
    equipment: [],
    filteredEquipment: [],
    initialized: false,

    initialize() {
        if (this.initialized) {
            console.log('Equipamiento page already initialized');
            return;
        }
        
        this.initialized = true;
        this.loadData();
        this.initTable();
        this.initModal();
        this.initEventListeners();
        console.log('Equipamiento page initialized');
    },

    loadData() {
        this.equipment = JSON.parse(localStorage.getItem('equipamiento')) || [
            {
                id: 1,
                name: 'Mancuernas ajustables',
                description: 'Set de mancuernas de 5 a 25 kg',
                category: 'fuerza',
                model: 'ProFit Adjustable',
                status: 'available',
                purchase_date: '2023-01-10',
                condition: 'good'
            },
            {
                id: 2,
                name: 'Cinta de correr',
                description: 'Cinta de correr motorizada con inclinación',
                category: 'cardio',
                model: 'RunMaster 5000',
                status: 'in_maintenance',
                purchase_date: '2022-05-15',
                condition: 'fair'
            },
            {
                id: 3,
                name: 'Banco de press',
                description: 'Banco ajustable para ejercicios de pecho',
                category: 'fuerza',
                model: 'PowerBench Pro',
                status: 'available',
                purchase_date: '2023-03-20',
                condition: 'new'
            }
        ];

        this.filteredEquipment = [...this.equipment];
    },

    initTable() {
        if (typeof TableManager === 'undefined') {
            console.error('TableManager no está disponible');
            setTimeout(() => this.initTable(), 100);
            return;
        }

        this.tableManager = new TableManager({
            tableId: 'equipment-table',
            columns: [
                { key: 'name', label: 'Nombre', type: 'text' },
                { key: 'category', label: 'Categoría', type: 'text' },
                { key: 'model', label: 'Modelo', type: 'text' },
                { key: 'status', label: 'Estado', type: 'status' },
                { key: 'condition', label: 'Condición', type: 'text' }
            ],
            actions: {
                edit: (id) => this.editEquipment(id),
                delete: (id) => this.deleteEquipment(id)
            }
        });

        this.tableManager.render(this.filteredEquipment);
    },

    initModal() {
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager no está disponible');
            setTimeout(() => this.initModal(), 100);
            return;
        }

        this.modalManager = new ModalManager('equipment-modal');
        
        const form = document.getElementById('equipment-form');
        if (form) {
            form.addEventListener('submit', (e) => this.saveEquipment(e));
        }
        
        const cancelForm = document.getElementById('cancel-form');
        if (cancelForm) {
            cancelForm.addEventListener('click', () => {
                this.modalManager.hide();
            });
        }
    },

    initEventListeners() {
        const addEquipmentBtn = document.getElementById('add-equipment-btn');
        if (addEquipmentBtn) {
            addEquipmentBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        this.initFilters();
    },

    initFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(() => {
                this.filterEquipment();
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
                        equipamientoPage.filterEquipment();
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

    filterEquipment() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const category = this.getSelectedCategory();

        this.filteredEquipment = this.equipment.filter(item => {
            const matchesSearch = 
                item.name.toLowerCase().includes(searchTerm) || 
                item.model.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || item.category === category;
            
            return matchesSearch && matchesCategory;
        });

        if (this.tableManager) {
            this.tableManager.render(this.filteredEquipment);
        }
    },

    getSelectedCategory() {
        const selected = document.querySelector('#category-select .selected-value span');
        return selected.textContent !== 'Todas las categorías' ? 
               selected.textContent.toLowerCase() : '';
    },

    resetFilters() {
        const categorySelect = document.querySelector('#category-select .selected-value');
        categorySelect.innerHTML = '<i class="fas fa-list"></i><span>Todas las categorías</span>';
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredEquipment = [...this.equipment];
        if (this.tableManager) {
            this.tableManager.render(this.filteredEquipment);
        }
    },

    openModal(equipmentId = null) {
        const isEdit = !!equipmentId;
        this.modalManager.setTitle(isEdit ? 'Editar Equipo' : 'Nuevo Equipo');
        
        if (isEdit) {
            this.loadEquipmentData(equipmentId);
        } else {
            this.modalManager.clearForm();
            document.getElementById('equipment-id').value = '';
        }
        
        this.modalManager.show();
    },

    loadEquipmentData(id) {
        const item = this.equipment.find(e => e.id == id);
        if (item) {
            document.getElementById('equipment-id').value = item.id;
            document.getElementById('equipment-name').value = item.name;
            document.getElementById('equipment-description').value = item.description || '';
            document.getElementById('equipment-category').value = item.category;
            document.getElementById('equipment-model').value = item.model || '';
            document.getElementById('equipment-status').value = item.status;
            document.getElementById('equipment-purchase-date').value = item.purchase_date || '';
            document.getElementById('equipment-condition').value = item.condition;
        }
    },

    saveEquipment(e) {
        e.preventDefault();
        
        const equipmentData = {
            id: document.getElementById('equipment-id').value || Helpers.generateId(),
            name: document.getElementById('equipment-name').value,
            description: document.getElementById('equipment-description').value,
            category: document.getElementById('equipment-category').value,
            model: document.getElementById('equipment-model').value,
            status: document.getElementById('equipment-status').value,
            purchase_date: document.getElementById('equipment-purchase-date').value,
            condition: document.getElementById('equipment-condition').value
        };

        if (!equipmentData.name || !equipmentData.category || !equipmentData.status) {
            alert('Por favor, completa los campos obligatorios (Nombre, Categoría y Estado).');
            return;
        }

        const isEdit = !!document.getElementById('equipment-id').value;
        
        if (isEdit) {
            const index = this.equipment.findIndex(e => e.id == equipmentData.id);
            this.equipment[index] = equipmentData;
        } else {
            this.equipment.push(equipmentData);
        }

        localStorage.setItem('equipamiento', JSON.stringify(this.equipment));
        this.tableManager.render(this.equipment);
        this.modalManager.hide();
        
        alert(isEdit ? 'Equipo actualizado!' : 'Equipo creado!');
    },

    editEquipment(id) {
        this.openModal(id);
    },

    deleteEquipment(id) {
        if (confirm('¿Estás seguro de eliminar este equipo?')) {
            this.equipment = this.equipment.filter(e => e.id != id);
            localStorage.setItem('equipamiento', JSON.stringify(this.equipment));
            this.tableManager.render(this.equipment);
        }
    }
};

// Inicialización automática cuando el script se carga
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeEquipamientoPage();
        });
    } else {
        initializeEquipamientoPage();
    }

    function initializeEquipamientoPage() {
        if (window.equipamientoPage && window.equipamientoPage.initialized) return;
        
        setTimeout(() => {
            if (window.equipamientoPage) {
                console.log('Auto-initializing equipamiento page');
                window.equipamientoPage.initialize();
            }
        }, 200);
    }
})();

window.equipamientoPage = equipamientoPage;