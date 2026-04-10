import {HttpUtils} from "../../utils/http-utils";
import {
    DividedDataOfAllOperationsResult,
    FieldNameForSorting,
    OneTypeDataOfAllOperationsResult,
    ResponseOfAllOperationsResult,
    ResponseOfOperationResult,
    ResultOfHttpRequest,
    SummariseOperationsForDiagram
} from "../../types/response-of-http-request";

export class ServerDiagramData {
    static incomesName = 'income';
    static expensesName = 'expense';

    static async getPreparedDataForCharts(dateFrom: string, dateUntil: string): Promise<SummariseOperationsForDiagram[]> {
        const serverData: ResponseOfAllOperationsResult | null = await this.askServer(dateFrom, dateUntil);
        const sortedData: ResponseOfAllOperationsResult | null = this.sortData(serverData as ResponseOfAllOperationsResult);
        const dividedData: DividedDataOfAllOperationsResult | null = this.divideDataOnIncomesAndExpenses(sortedData as ResponseOfAllOperationsResult);
        let dataForIncomesChart: SummariseOperationsForDiagram = this.divideCategoryOnLabelsAndTotal(dividedData!.incomesMap)
        let dataForExpensesChart: SummariseOperationsForDiagram = this.divideCategoryOnLabelsAndTotal(dividedData!.expensesMap)
        return [dataForIncomesChart, dataForExpensesChart]
    }

    public static async getPreparedDataForTable(dateFrom: string, dateUntil: string): Promise<ResponseOfAllOperationsResult | null> {
        const serverData: ResponseOfAllOperationsResult | null = await this.askServer(dateFrom, dateUntil);
        if (serverData) {
            return this.sortData(serverData, 'date');
        } else return null;
    }

    private static async askServer(dateFrom: string, dateUntil: string): Promise<ResponseOfAllOperationsResult | null> {
        let url: string = '/operations';
        let getParameters: string = '?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateUntil;

        let result: ResultOfHttpRequest = await HttpUtils.request(url + getParameters, 'GET', true, null);
        if (result.error) {
            return null
        } else {
            return result.response as ResponseOfAllOperationsResult;
        }
    }

    private static sortData(serverData: ResponseOfAllOperationsResult, sortedField: FieldNameForSorting = 'amount'): ResponseOfAllOperationsResult | null {
        if (!serverData) {
            return null;
        }
        return [...serverData].sort((a: ResponseOfOperationResult, b: ResponseOfOperationResult) => {
            const valA: string | number = a[sortedField];
            const valB: string | number = b[sortedField];

            if (typeof valA === 'number' && typeof valB === 'number') {
                return valB - valA;
            }
            if (typeof valA === 'string' && typeof valB === 'string') {
                return valB.localeCompare(valA);
            }
            return 0;
        });
    }

    private static divideDataOnIncomesAndExpenses(serverData: ResponseOfAllOperationsResult): DividedDataOfAllOperationsResult | null {
        const sortedData: ResponseOfAllOperationsResult | null = this.sortData(serverData);

        const incomesMap = new Map();
        const expensesMap = new Map();

        if (!sortedData) {
            return null
        }

        for (const transaction of sortedData) {
            const category: string | undefined = transaction.category;
            const amount: number = transaction.amount;

            if (transaction.type === this.incomesName) {
                incomesMap.set(category, (incomesMap.get(category) || 0) + amount);
            }

            if (transaction.type === this.expensesName) {
                expensesMap.set(category, (expensesMap.get(category) || 0) + amount);
            }
        }

        const incomesArr: { category: any, amount: any }[] = [...incomesMap.entries()]
            .map(([category, amount]: [any, any]): { category: any, amount: any } => ({category, amount}));

        const expensesArr: { category: any, amount: any }[] = [...expensesMap.entries()]
            .map(([category, amount]: [any, any]): { category: any, amount: any } => ({category, amount}));

        return {
            incomesMap: incomesArr.length ? (incomesArr as OneTypeDataOfAllOperationsResult) : null,
            expensesMap: expensesArr.length ? (expensesArr as OneTypeDataOfAllOperationsResult) : null
        };
    }

    private static divideCategoryOnLabelsAndTotal(MapOrNull: OneTypeDataOfAllOperationsResult | null): SummariseOperationsForDiagram {
        if (MapOrNull) {
            const labels: Array<string> = [];
            const data: Array<number> = [];
            for (const operation of MapOrNull) {
                labels.push(operation.category);
                data.push(operation.amount);
            }
            return {'labels': labels, 'data': data};
        } else {
            return null
        }
    }

    public static async deleteOperation(id: string): Promise<string | null> {
        let url: string = '/operations/' + id;

        let result: ResultOfHttpRequest = await HttpUtils.request(url, 'DELETE', true, null);
        if (result.error) {
            return null
        } else {
            return result.message!;
        }
    }
}

