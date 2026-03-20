import {Charts} from "./charts";
import {CalendarsForInputs} from "./calendars-for-inputs";
import {MainPagesFilter} from "./main-pages-filter";

export class DiagramPage {
    constructor() {
        this.flatpickr = new CalendarsForInputs();
        this.charts = new Charts();
        this.filter = new MainPagesFilter();
    }

    destroy() {
        this.flatpickr.destroyFlatpickr();
        this.charts.destroyCharts();
        this.filter.destroyFilter();
    }
}