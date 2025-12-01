// GESTOR UNIFICADO DE TABLAS
class TableManager {
    constructor(config) {
        this.config = config;
        this.data = [];
        this.filteredData = [];
        this.tableId = config.tableId;
    }

    initialize() {
        this.render(this.data);
        this.attachEventListeners();
    }

    render(data) {
        this.data = data;
        this.filteredData = [...data];
        this.updateTable();
    }

    updateTable() {
        const tbody = document.querySelector(`#${this.tableId} tbody`);
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = this.getEmptyState();
            return;
        }

        tbody.innerHTML = this.filteredData.map(item => 
            this.generateRow(item)
        ).join('');

        this.attachRowEvents();
    }

    generateRow(item) {
        const columns = this.config.columns.map(col => {
            const value = this.formatCellValue(item[col.key], col.type);
            return `<td>${value}</td>`;
        }).join('');

        return `
            <tr>
                ${columns}
                <td class="actions-cell">
                    ${this.config.actions.edit ? `
                    <button class="action-btn edit-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    ` : ''}
                    ${this.config.actions.delete ? `
                    <button class="action-btn delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                    ${this.config.actions.assign ? `
                    <button class="action-btn assign-btn" data-id="${item.id}">
                        <i class="fas fa-dumbbell"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }

      formatCellValue(value, type) {
      if (value === null || value === undefined) return '-';
      
      switch (type) {
          case 'status':
              return `<span class="status-badge status-${value}">${this.capitalizeFirstLetter(value)}</span>`;
          case 'date':
              return new Date(value).toLocaleDateString();
          case 'boolean':
              return value ? 'Sí' : 'No';
          case 'level':
              return `<span class="level-badge level-${value}">${Helpers.formatLevel(value)}</span>`;
          case 'muscle':
              return `<span class="muscle-badge">${this.capitalizeFirstLetter(value)}</span>`;
          default:
              return value;
      }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getEmptyState() {
        return `
            <tr>
                <td colspan="${this.config.columns.length + 1}" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 48px; color: var(--primary-color); margin-bottom: 16px;"></i>
                    <h3>No hay datos disponibles</h3>
                    <p>No se encontraron registros que coincidan con los criterios.</p>
                </td>
            </tr>
        `;
    }

    attachRowEvents() {
        // Eventos para botones de acción
        document.querySelectorAll(`#${this.tableId} .edit-btn`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.config.actions.edit(id);
            });
        });

        document.querySelectorAll(`#${this.tableId} .delete-btn`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.config.actions.delete(id);
            });
        });

        if (this.config.actions.assign) {
            document.querySelectorAll(`#${this.tableId} .assign-btn`).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.config.actions.assign(id);
                });
            });
        }
    }

    attachEventListeners() {
        // Eventos generales de la tabla
    }

    filterData(filters) {
        this.filteredData = this.data.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                const value = item[key]?.toString().toLowerCase();
                return value && value.includes(filters[key].toLowerCase());
            });
        });
        this.updateTable();
    }

    sortData(column, direction = 'asc') {
        this.filteredData.sort((a, b) => {
            let aValue = a[column];
            let bValue = b[column];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        this.updateTable();
    }
}