// import Chart from "chart.js/auto"; // вместо всей библиотеки импортируем только необходимые модули:
import {ArcElement, Chart, ChartItem, Legend, PieController, Tooltip} from 'chart.js';
import {ServerDiagramData} from "./server-diagram-data";
import {ChartLabelsType, SummariseOperationsForDiagram} from "../../types/response-of-http-request";

Chart.register(PieController, ArcElement, Tooltip, Legend);

export class Charts {
    incomeChartElement: HTMLElement | null;
    expensesChartElement: HTMLElement | null;
    zeroData: ChartLabelsType;
    dataForIncomesChart: ChartLabelsType;
    dataForExpensesChart: ChartLabelsType;
    dataForIncomesFromServer: SummariseOperationsForDiagram | undefined;
    dataForExpensesFromServer: SummariseOperationsForDiagram | undefined;
    dateFrom: string | null;
    dateUntil: string | null;

    incomeChart!: Chart | null;
    expensesChart!: Chart | null;

    constructor() {
        this.incomeChartElement = document.getElementById('incomeChart');
        this.expensesChartElement = document.getElementById('expensesChart');

        // начальные (нулевые) данные для диаграмм:
        this.zeroData = {
            labels: ['нет данных'],
            data: [0],
        }
        this.dataForIncomesChart = this.zeroData;
        this.dataForExpensesChart = this.zeroData;

        this.dataForIncomesFromServer = null;
        this.dataForExpensesFromServer = null;

        this.dateFrom = null;
        this.dateUntil = null;

        document.addEventListener('filter-change', this.filterEventListener);

        this.initCharts();
    }

    initCharts(): void {
        this.buildCharts();
        this.updateDiagrams();
    }

    buildCharts(): void {
        this.incomeChart = new Chart(this.incomeChartElement as ChartItem, {
            type: 'pie',
            data: {
                labels: this.dataForIncomesChart.labels,
                datasets: [{
                    label: '$',
                    data: this.dataForIncomesChart.data,
                    backgroundColor: ['#ec0000', '#ff8000', '#fff100', '#12af12', '#0099ff', '#2749ff', '#7714d3'],
                    hoverOffset: 30,
                    borderWidth: 1
                }]
            },
            options: {
                rotation: 0,
                responsive: true,
                layout: {
                    padding: {top: 10, bottom: 30, left: 10, right: 10}
                },
            }
        });

        this.expensesChart = new Chart(this.expensesChartElement as ChartItem, {
            type: 'pie',
            data: {
                labels: this.dataForExpensesChart.labels,
                datasets: [{
                    label: '$',
                    data: this.dataForExpensesChart.data,
                    backgroundColor: ['#7714d3', '#2749ff', '#0099ff', '#12af12', '#fff100', '#ff8000', '#ec0000'],
                    hoverOffset: 30,
                    borderWidth: 1
                }]
            },
            options: {
                rotation: 0,
                responsive: true,
                layout: {
                    padding: {top: 10, bottom: 30, left: 10, right: 10}
                }
            },
        });
    }

    filterEventListener: (event: Event) => Promise<void> = async (event: Event): Promise<void> => {
        const e = event as CustomEvent<{ dateFrom: string; dateUntil: string}>;
        let periodObj: { dateFrom: string, dateUntil: string } = e.detail;
        this.dateFrom = periodObj.dateFrom;
        this.dateUntil = periodObj.dateUntil;

        await this.getDataFromServer(this.dateFrom, this.dateUntil);
        this.updateDiagrams();
    }

    async getDataFromServer(dateFrom: string, dateUntil: string): Promise<void> {
        [this.dataForIncomesFromServer, this.dataForExpensesFromServer] = await ServerDiagramData.getPreparedDataForCharts(dateFrom, dateUntil);
    }

    updateDiagrams(): void {
        if (this.dataForIncomesFromServer) {
            this.incomeChart!.data.labels = this.dataForIncomesFromServer.labels;
            this.incomeChart!.data.datasets[0]!.data = this.dataForIncomesFromServer.data;
        } else {
            this.incomeChart!.data.labels = this.zeroData.labels;
            this.incomeChart!.data.datasets[0]!.data = this.zeroData.data;
        }
        this.incomeChart!.update('show');

        if (this.dataForExpensesFromServer) {
            this.expensesChart!.data.labels = this.dataForExpensesFromServer.labels;
            this.expensesChart!.data.datasets[0]!.data = this.dataForExpensesFromServer.data;
        } else {
            this.expensesChart!.data.labels = this.zeroData.labels;
            this.expensesChart!.data.datasets[0]!.data = this.zeroData.data;
        }
        this.expensesChart!.update('show');
    }

    destroyCharts() {
        if (this.incomeChart) {
            this.incomeChart.destroy();
            this.incomeChart = null;
        }

        if (this.expensesChart) {
            this.expensesChart.destroy();
            this.expensesChart = null;
        }

        document.removeEventListener('filter-change', this.filterEventListener)
    }
}
