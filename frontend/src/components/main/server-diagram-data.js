import {HttpUtils} from "../../utils/http-utils";

export class ServerDiagramData {
    static incomesName = 'income';
    static expensesName = 'expense';

    static async getPreparedDataForCharts(dateFrom, dateUntil) {
        const serverData = await this.askServer(dateFrom, dateUntil);
        const sortedData = this.sortData(serverData);
        const dividedData = this.divideDataOnIncomesAndExpenses(sortedData);
        let dataForIncomesChart = this.divideCategoryOnLabelsAndTotal(dividedData.incomesMap)
        let dataForExpensesChart = this.divideCategoryOnLabelsAndTotal(dividedData.expensesMap)
        return [dataForIncomesChart, dataForExpensesChart]
    }

    static async getPreparedDataForTable(dateFrom, dateUntil) {
        const serverData = await this.askServer(dateFrom, dateUntil);
        return this.sortData(serverData, 'date');
    }

    static async askServer(dateFrom, dateUntil) {
        let url = '/operations';
        let getParameters = '?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateUntil;

        let result = await HttpUtils.request(url + getParameters, 'GET', true, null);
        if (result.error) {
            return null
        }
        if (result.response) {
            return result.response;
        }
    }

    static sortData(serverData, sortedField = 'amount') {
        if (!serverData) {
            return
        }
        return [...serverData].sort((a, b) => b.sortedField - a.sortedField);
    }

    static divideDataOnIncomesAndExpenses(serverData) {
        const sortedData = this.sortData(serverData);

        const incomesMap = new Map();
        const expensesMap = new Map();

        for (const transaction of sortedData) {
            const category = transaction.category;
            const amount = transaction.amount;

            if (transaction.type === this.incomesName) {
                incomesMap.set(category, (incomesMap.get(category) || 0) + amount);
            }

            if (transaction.type === this.expensesName) {
                expensesMap.set(category, (expensesMap.get(category) || 0) + amount);
            }
        }

        const incomesArr = [...incomesMap.entries()]
            .map(([category, amount]) => ({ category, amount }));

        const expensesArr = [...expensesMap.entries()]
            .map(([category, amount]) => ({ category, amount }));

        return {
            incomesMap: incomesArr.length ? incomesArr : null,
            expensesMap: expensesArr.length ? expensesArr : null
        };
    }

    static divideCategoryOnLabelsAndTotal(MapOrNull) {
        if (MapOrNull) {
            const labels = [];
            const data = [];
            for (const operation of MapOrNull) {
                labels.push(operation.category);
                data.push(operation.amount);
            }
            return {'labels': labels, 'data': data};
        } else {
            return null
        }


    }

    static async deleteOperation(id) {
        let url = '/operations/' + id;

        let result = await HttpUtils.request(url, 'DELETE', true, null);
        if (result.error) {
            return null
        }
        if (result.response) {
            return result.response;
        }
    }
}

