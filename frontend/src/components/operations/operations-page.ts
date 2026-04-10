import {CalendarsForInputs} from "../main/calendars-for-inputs";
import {MainPagesFilter} from "../main/main-pages-filter";
import {OperationsTable} from "./operations-table";

export class OperationsPage {
    flatpickr: CalendarsForInputs;
    table: OperationsTable;
    filter: MainPagesFilter;

    constructor(openNewRouteFunction: Function) {
        this.flatpickr = new CalendarsForInputs();
        this.table = new OperationsTable(openNewRouteFunction);
        this.filter = new MainPagesFilter();
    }

    public destroy(): void {
        this.flatpickr.destroyFlatpickr();
        this.table.destroyTable();
        this.filter.destroyFilter();
    }
}