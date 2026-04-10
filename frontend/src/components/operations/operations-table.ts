import {ServerDiagramData} from "../main/server-diagram-data";
import {
    FilterChangeDetail,
    ResponseOfAllOperationsResult,
    ResponseOfOperationResult
} from "../../types/response-of-http-request";

export class OperationsTable {
    openNewRoute: Function;
    tableBodyElement: HTMLElement | null;
    modal: HTMLElement | null;
    dataForTableFromServer: ResponseOfAllOperationsResult | null;

    dateFrom: string | null;
    dateUntil: string | null;


    constructor(openNewRouteFunction: Function) {
        this.openNewRoute = openNewRouteFunction;
        this.tableBodyElement = document.getElementById('table-body');
        this.modal = document.getElementById('modal');
        this.dataForTableFromServer = null;

        this.dateFrom = null;
        this.dateUntil = null;

        document.addEventListener('filter-change', this.filterEventListener);

        this.initTable();
    }

    private initTable(): void {
        this.updateTable();
        this.listenEditButton();
        this.listenModal();
    }

    private filterEventListener: (event: Event) => Promise<void> = async (event: Event): Promise<void> => {
        const e = event as CustomEvent<FilterChangeDetail>;
        const periodObj: FilterChangeDetail = e.detail;

        this.dateFrom = periodObj.dateFrom;
        this.dateUntil = periodObj.dateUntil;

        await this.getDataFromServer(this.dateFrom!, this.dateUntil!);
        this.updateTable();
    }

    private async getDataFromServer(dateFrom: string, dateUntil: string): Promise<void> {
        this.dataForTableFromServer = await ServerDiagramData.getPreparedDataForTable(dateFrom, dateUntil);
    }

    private updateTable(): void {
        this.tableBodyElement!.innerHTML = '';
        if (this.dataForTableFromServer && this.dataForTableFromServer.length > 0) {
            for (let i: number = 0; i < this.dataForTableFromServer.length; i++) {

                const rowData: ResponseOfOperationResult = this.dataForTableFromServer[i]!;
                const trElement: HTMLTableRowElement = document.createElement('tr');
                trElement.className = 'name-elem-parent';
                trElement.dataset.id = rowData.id;

                // Порядковый номер строки
                let cell: HTMLTableCellElement = trElement.insertCell();
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
                cell.textContent = rowData.category!;

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

                this.tableBodyElement!.appendChild(trElement);
            }
        }
    }

    private listenEditButton(): void {
        this.tableBodyElement!.addEventListener('click', (event: Event): void => {
            if (!(event.target instanceof Element)) return;
            let actionEdit: HTMLElement = event.target.closest('.action-edit') as HTMLElement;
            if (actionEdit) {
                let rowElement: HTMLElement = event.target.closest('.name-elem-parent') as HTMLElement;
                if (rowElement) {
                    this.openNewRoute('/operations-edit?id=' + rowElement.dataset.id);
                }
            }
        });
    }

    listenModal(): void {
        this.modal!.addEventListener('show.bs.modal', (event: Event): void => {
            const e = event as Event & { relatedTarget: HTMLElement };
            const button: HTMLElement = e.relatedTarget; // кнопка, которая открыла модалку
            const rowId: string = button.dataset.id!;
            const confirmButton: HTMLElement = this.modal!.querySelector('.btn-success')!;
            if (confirmButton instanceof HTMLElement) {
                confirmButton.dataset.id = rowId;
            }
        });

        this.modal!.querySelector('.btn-success')!.addEventListener('click', async (event: Event): Promise<void> => {
            if (!(event.currentTarget instanceof HTMLElement)) return;
            const rowId: string = event.currentTarget!.dataset.id!;
            await ServerDiagramData.deleteOperation(rowId);
            this.sayBalanceAboutChange();
            await this.getDataFromServer(this.dateFrom!, this.dateUntil!);
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