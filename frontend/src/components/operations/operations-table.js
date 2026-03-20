import {ServerDiagramData} from "../main/server-diagram-data";

export class OperationsTable {
    constructor(openNewRouteFunction) {
        this.openNewRoute = openNewRouteFunction;
        this.tableBodyElement = document.getElementById('table-body');
        this.modal = document.getElementById('modal');
        this.dataForTableFromServer = null;

        this.dateFrom = null;
        this.dateUntil = null;

        document.addEventListener('filter-change', this.filterEventListener);

        this.initTable();
    }

    initTable() {
        this.updateTable();
        this.listenEditButton();
        this.listenModal();
    }

    filterEventListener = async (event) => {
        let periodObj = event.detail;
        this.dateFrom = periodObj.dateFrom;
        this.dateUntil = periodObj.dateUntil;

        await this.getDataFromServer(this.dateFrom, this.dateUntil);
        this.updateTable();
    }

    async getDataFromServer(dateFrom, dateUntil) {
        this.dataForTableFromServer = await ServerDiagramData.getPreparedDataForTable(dateFrom, dateUntil);
    }

    updateTable() {
        this.tableBodyElement.innerHTML = '';
        if (this.dataForTableFromServer && this.dataForTableFromServer.length > 0) {
            for (let i = 0; i < this.dataForTableFromServer.length; i++) {

                const rowData = this.dataForTableFromServer[i];
                const trElement = document.createElement('tr');
                trElement.className = 'name-elem-parent';
                trElement.dataset.id = rowData.id;

                // Порядковый номер строки
                let cell = trElement.insertCell();
                cell.className = 'd-none d-lg-table-cell';
                cell.textContent = String(i + 1);

                // Тип операции
                cell = trElement.insertCell();
                cell.className = 'd-none d-sm-table-cell';
                if (rowData.type === 'income') {
                    cell.classList.add('text-success');
                    cell.textContent = 'доход';
                } else if (rowData.type === 'expense') {
                    cell.classList.add('text-danger');
                    cell.textContent = 'расход';
                }

                // Категория
                cell = trElement.insertCell();
                cell.className = 'name-of-entity';
                cell.textContent = rowData.category;

                // Сумма
                cell = trElement.insertCell();
                cell.textContent = Number(rowData.amount).toLocaleString('ru-RU') + '$';
                if (rowData.type === 'income') {
                    cell.classList.add('text-success')
                } else if (rowData.type === 'expense') {
                    cell.classList.add('text-danger')
                }

                // Дата операции
                cell = trElement.insertCell();
                cell.className = 'd-none d-sm-table-cell';
                cell.textContent = rowData.date;

                // Комментарий
                cell = trElement.insertCell();
                cell.className = 'd-none d-sm-table-cell';
                cell.textContent = rowData.comment || '';

                // Кнопки
                cell = trElement.insertCell();
                let dataId = 'data-id=' + rowData.id;
                cell.innerHTML = `
        <div class="line-actions d-flex flex-row justify-content-end">
            <button class="btn btn-sm action-delete" data-bs-toggle="modal" ${dataId} data-bs-target="#modal">
                <svg width="13" height="15">
                    <use href="icons/layout-icons.svg#trash"></use>
                </svg>
            </button>
            <button class="btn btn-sm action-edit">
                <svg height="16" width="16">
                    <use href="icons/layout-icons.svg#pencil"></use>
                </svg>
            </button>
        </div>
    `;

                this.tableBodyElement.appendChild(trElement);
            }
        }
    }

    listenEditButton() {
        this.tableBodyElement.addEventListener('click', (event) => {
            let actionEdit = event.target.closest('.action-edit');
            if (actionEdit) {
                let rowElement = event.target.closest('.name-elem-parent');
                if (rowElement) {
                    this.openNewRoute('/operations-edit?id=' + rowElement.dataset.id);
                }
            }
        });
    }

    listenModal() {
        this.modal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget; // кнопка, которая открыла модалку
            const rowId = button.dataset.id;
            const confirmButton = this.modal.querySelector('.btn-success');
            confirmButton.dataset.id = rowId;
        });

        this.modal.querySelector('.btn-success').addEventListener('click', async (event) => {
            const rowId = event.currentTarget.dataset.id;
            await ServerDiagramData.deleteOperation(rowId);
            this.sayBalanceAboutChange();
            await this.getDataFromServer(this.dateFrom, this.dateUntil);
            this.updateTable();
        });
    }

    sayBalanceAboutChange() {
        document.dispatchEvent(new CustomEvent('balance-change', {bubbles: true}));
    }

    destroyTable() {
        document.removeEventListener('filter-change', this.filterEventListener)
    }
}