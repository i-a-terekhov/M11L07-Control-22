// import Chart from "chart.js/auto"; // вместо всей библиотеки импортируем только необходимые модули:
import {ArcElement, Chart, Legend, PieController, Tooltip} from 'chart.js';
import {ServerDiagramData} from "./server-diagram-data";

Chart.register(PieController, ArcElement, Tooltip, Legend);

export class Charts {
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

    initCharts() {
        this.buildCharts();
        this.updateDiagrams();
    }

    buildCharts() {
        this.incomeChart = new Chart(this.incomeChartElement, {
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

        this.expensesChart = new Chart(this.expensesChartElement, {
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

    filterEventListener = async (event) => {
        let periodObj = event.detail;
        this.dateFrom = periodObj.dateFrom;
        this.dateUntil = periodObj.dateUntil;

        await this.getDataFromServer(this.dateFrom, this.dateUntil);
        this.updateDiagrams();
    }

    async getDataFromServer(dateFrom, dateUntil) {
        [this.dataForIncomesFromServer, this.dataForExpensesFromServer] = await ServerDiagramData.getPreparedDataForCharts(dateFrom, dateUntil);
    }

    updateDiagrams() {
        if (this.dataForIncomesFromServer) {
            this.incomeChart.data.labels = this.dataForIncomesFromServer.labels;
            this.incomeChart.data.datasets[0].data = this.dataForIncomesFromServer.data;
        } else {
            this.incomeChart.data.labels = this.zeroData.labels;
            this.incomeChart.data.datasets[0].data = this.zeroData.data;
        }
        this.incomeChart.update('show');

        if (this.dataForExpensesFromServer) {
            this.expensesChart.data.labels = this.dataForExpensesFromServer.labels;
            this.expensesChart.data.datasets[0].data = this.dataForExpensesFromServer.data;
        } else {
            this.expensesChart.data.labels = this.zeroData.labels;
            this.expensesChart.data.datasets[0].data = this.zeroData.data;
        }
        this.expensesChart.update('show');
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
