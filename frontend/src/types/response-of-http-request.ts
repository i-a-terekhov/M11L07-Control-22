export type ResultOfHttpRequest = {
    error: boolean,
    response:
        ResponseOfAuthResult | ResponseOfBalanceResult |
        ResponseOfAllCategoriesResult | ResponseOfCategoryResult |
        ResponseOfAllOperationsResult | ResponseOfOperationResult |
        null,
    message?: string,
}

export type ResponseOfAuthResult = {
    tokens: { accessToken: string, refreshToken: string },
    user: { id: number, name: string, lastName: string, email?: string },
};

export type ResponseOfBalanceResult = {
    user_id: number,
    balance: number
};

export type ResponseOfAllCategoriesResult = Array<ResponseOfCategoryResult>;

export type ResponseOfCategoryResult = {
    id: number,
    title: string
};

export type ResponseOfAllOperationsResult = Array<ResponseOfOperationResult>;

export type ResponseOfOperationResult = {
    id: string,
    type: 'expense' | 'income',
    amount: number,
    date: string,
    comment?: string,
    category?: string
};

export type BodyForOperationUpdate = {
    type: string,
    amount: number,
    date: string,
    comment: string,
    category_id: number,
};


export type infoFromLocalStorage = string | null | { [key: string]: string | null };


export type DividedDataOfAllOperationsResult = {
    incomesMap: OneTypeDataOfAllOperationsResult | null,
    expensesMap: OneTypeDataOfAllOperationsResult | null,
};

export type OneTypeDataOfAllOperationsResult = [{ category: string, amount: number }];

export type SummariseOperationsForDiagram = { labels: string[], data: number[] } | null;


export type ChartLabelsType = {labels: string[], data: number[]};


export type FieldNameForSorting = 'amount' | 'date';

export type FetchMethod = "GET" | "POST" | "PUT" | "DELETE";

export type BootstrapModalEvent = Event & {
    relatedTarget: HTMLElement | null;
};

export type CategoryType = 'expense' | 'income';

export type FilterChangeDetail = {
    dateFrom: string | null;
    dateUntil: string | null;
};

export type ArrayOfValidationRules = {
    element: HTMLInputElement | HTMLSelectElement;
    options: { pattern: RegExp };
}[]

