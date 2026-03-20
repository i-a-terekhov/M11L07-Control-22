import {CalendarsForInputs} from "../main/calendars-for-inputs";
import {MainPagesFilter} from "../main/main-pages-filter";
import {OperationsTable} from "./operations-table";

export class OperationsPage {
    constructor(openNewRouteFunction) {
        this.flatpickr = new CalendarsForInputs();
        this.table = new OperationsTable(openNewRouteFunction);
        this.filter = new MainPagesFilter();
    }

    destroy() {
        this.flatpickr.destroyFlatpickr();
        this.table.destroyTable();
        this.filter.destroyFilter();
    }
}