import {Charts} from "./charts";
import {CalendarsForInputs} from "./calendars-for-inputs";
import {MainPagesFilter} from "./main-pages-filter";
import {PageHandler} from "../page-handler";

export class DiagramPage extends PageHandler {
    flatpickr: CalendarsForInputs;
    charts: Charts;
    filter: MainPagesFilter;

    constructor() {
        super();
        this.flatpickr = new CalendarsForInputs();
        this.charts = new Charts();
        this.filter = new MainPagesFilter();
    }

    public destroy(): void {
        this.flatpickr.destroyFlatpickr();
        this.charts.destroyCharts();
        this.filter.destroyFilter();
    }
}