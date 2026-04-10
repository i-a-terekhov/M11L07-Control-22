import {isNumber} from "chart.js/helpers";
import {OperationsService} from "../../services/operations-service";
import {Modal} from 'bootstrap';
import {CategoriesService} from "../../services/categories-service";
import {PageHandler} from "../page-handler";
import {
    ArrayOfValidationRules, BodyForOperationUpdate,
    ResponseOfAllCategoriesResult,
    ResponseOfCategoryResult,
    ResponseOfOperationResult
} from "../../types/response-of-http-request";

export class EditOperation extends PageHandler {
    openNewRoute: Function;
    modalWithAnswer: HTMLElement | null;
    modal_one: Modal;
    modalWithConfirm: HTMLElement | null;
    modal_two: Modal;
    operationID: string | null;

    serverErrorText!: HTMLElement;
    commonErrorText!: HTMLElement;
    typeInput!: HTMLSelectElement;
    categoryInput!: HTMLInputElement;
    amountInput!: HTMLInputElement;
    dateInput!: HTMLInputElement;
    commentInput!: HTMLInputElement;

    saveButton!: HTMLButtonElement;
    cancelButton!: HTMLButtonElement;

    validations!: ArrayOfValidationRules;

    constructor(openNewRouteFunction: Function) {
        super();
        this.openNewRoute = openNewRouteFunction;

        this.modalWithAnswer = document.getElementById('modal-answer');
        this.modal_one = new Modal(this.modalWithAnswer as HTMLElement);
        this.modalWithConfirm = document.getElementById('modal-confirm');
        this.modal_two = new Modal(this.modalWithConfirm as HTMLElement);

        this.operationID = null;
        if (window.location.search && window.location.search.split('=')[1]) {
            let operationID: string = decodeURIComponent((window.location.search.split('=')[1]) as string);
            if (isNumber(operationID)) {
                this.operationID = operationID;
            }
            if (!this.operationID) {
                console.warn('ID операции не задан, переходим в начало');
                return this.openNewRoute('/');
            }
        }

        this.init().then();
    }

    private async init(): Promise<void> {
        this.setElements();
        await this.getDataFromServer();
        this.modalWithAnswerHandler();
        this.modalWithConfirmHandler();
    }

    private getEl<T extends HTMLElement>(id: string): T {
        const fondedElement: HTMLElement | null = document.getElementById(id);
        if (!fondedElement) throw new Error(`Element #${id} not found`);
        return fondedElement as T;
    }

    private setElements(): void {
        this.serverErrorText = this.getEl<HTMLElement>("server-error");
        this.commonErrorText = this.getEl<HTMLElement>("common-error");

        this.typeInput = this.getEl<HTMLSelectElement>("operation-type");
        this.typeInput.addEventListener("change", (e: Event): void => {
            this.updateListOfCategoriesName().then();
        });

        this.categoryInput = this.getEl<HTMLInputElement>("operation-name");
        this.amountInput = this.getEl<HTMLInputElement>("operation-amount");
        this.dateInput = this.getEl<HTMLInputElement>("operation-date");
        this.commentInput = this.getEl<HTMLInputElement>("operation-comment");

        this.saveButton = this.getEl<HTMLButtonElement>("operation-save");
        this.cancelButton = this.getEl<HTMLButtonElement>("operation-cancel");

        this.saveButton.addEventListener('click', this.saveButtonHandler.bind(this));
        this.cancelButton.addEventListener('click', this.cancelButtonHandler.bind(this));

        this.validations = [
            {element: this.typeInput, options: {pattern: /^.+$/}},
            {element: this.categoryInput, options: {pattern: /^.{3,}$/}},
            {element: this.amountInput, options: {pattern: /^\d{1,3}( \d{3})*(\.\d+)?\$$/}},
            {element: this.dateInput, options: {pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/}},
            {element: this.commentInput, options: {pattern: /^.+$/}},
        ];

        const formatter = new Intl.NumberFormat("en-US");
        const normalizeValue: (value: string) => string = (value: string): string => {
            return value
                .replace(/\s*\$/g, "")
                .replace(/\s+/g, "")
                .replace(/,/g, "")
                .replace(/[^\d.]/g, "")
        };

        const formatValue: (value: string) => string = (value: string): string => {
            if (!value) return "";

            const number: number = Number(value);
            if (isNaN(number)) return "";

            const formatted: string = formatter.format(number).replace(/,/, " ");

            return formatted + "$";
        };

        this.amountInput.addEventListener("focus", (e: FocusEvent): void => {
            const target = e.target as HTMLInputElement;
            target.value = normalizeValue(target.value);
        });

        this.amountInput.addEventListener("input", (e: Event): void => {
            const target = e.target as HTMLInputElement;
            target.value = normalizeValue(target.value);
        });

        this.amountInput.addEventListener("blur", (e: FocusEvent): void => {
            const target = e.target as HTMLInputElement;
            target.value = formatValue(normalizeValue(target.value));
        });
    }

    private async getDataFromServer(): Promise<void> {
        let response: ResponseOfOperationResult | false = await OperationsService.getOneOperation(this.operationID!);
        if (response) {
            if (response.type === "expense") {
                this.typeInput.value = "expense";
            } else {
                this.typeInput.value = "income";
            }
            await this.updateListOfCategoriesName();
            this.categoryInput.value = response.category!;
            this.amountInput.value = new Intl.NumberFormat('en-US').format(response.amount).replace(',', ' ') + "$";
            this.dateInput.value = response.date;
            this.commentInput.value = response.comment!;

        } else {
            this.serverErrorText.style.display = 'block'
            this.saveButton.disabled = true
        }
    }

    private async updateListOfCategoriesName(): Promise<void> {
        let operationNameList: string = '<option value=""></option>'
        if (this.typeInput.value === "expense") {
            let arrayOfCategories: ResponseOfAllCategoriesResult | false = await CategoriesService.getAllExpenseCategories();
            if (arrayOfCategories) {
                for (let category of arrayOfCategories) {
                    operationNameList += '<option value="' + category.title + '">' + category.title + '</option>'
                }
            }
        } else if (this.typeInput.value === "income") {
            let arrayOfCategories: ResponseOfAllCategoriesResult | false = await CategoriesService.getAllIncomeCategories();
            if (arrayOfCategories) {
                for (let category of arrayOfCategories) {
                    operationNameList += '<option value="' + category.title + '">' + category.title + '</option>'
                }
            }
        }
        this.categoryInput.innerHTML = operationNameList;
    }

    private saveButtonHandler(): void {
        this.commonErrorText.style.display = 'block';
        if (this.checkValidation(this.validations)) {
            this.commonErrorText.style.display = 'none';
            this.modal_one.show();
        }
    }

    private cancelButtonHandler(): void {
        this.openNewRoute('/operations-main-tables');
    }

    private checkValidation(validations: ArrayOfValidationRules): boolean {
        let isValid: boolean = true;
        for (let i: number = 0; i < validations.length; i++) {
            if (!this.validateField(validations[i]!.element, validations[i]!.options)) {
                isValid = false;
            }
        }
        return isValid;
    }

    private validateField(element: HTMLInputElement | HTMLSelectElement, options: { pattern: RegExp }): boolean {
        let condition: RegExpMatchArray | string | boolean | null = element.value;
        if (options) {
            if (options.hasOwnProperty('pattern')) {
                condition = element.value && element.value.match(options.pattern);
            }
        }
        if (element.value === '0$') {
            condition = false;
        }
        if (condition) {
            element.classList.remove("is-invalid");
            return true;
        } else {
            element.classList.add("is-invalid");
            return false;
        }
    }

    private modalWithAnswerHandler(): void {
        document.getElementById('modal-answer-yes')!.addEventListener('click', async (event: PointerEvent): Promise<void> => {
            let pushDataToServer: boolean = await this.pushDataToServer();
            if (pushDataToServer) {
                this.modal_two.show();
            } else {
                alert('Что-то пошло не так... Повторите попытку позже');
            }
        });
    }

    private async pushDataToServer(): Promise<boolean> {
        let allCategories: ResponseOfAllCategoriesResult | false | null = null;
        // this.serverErrorText.style.display = 'block';

        if (this.typeInput.value === "expense") {
            allCategories = await CategoriesService.getAllExpenseCategories();
        } else if (this.typeInput.value === "income") {
            allCategories = await CategoriesService.getAllIncomeCategories();
        }

        if (allCategories) {
            let categoryObj: ResponseOfCategoryResult | undefined = allCategories.find((category: ResponseOfCategoryResult): boolean => category.title === this.categoryInput.value);
            let body: BodyForOperationUpdate = {
                "type": this.typeInput.value,
                "amount": +this.amountInput.value.split('$')[0]!.replace(' ', ''),
                "date": this.dateInput.value,
                "comment": this.commentInput.value,
                "category_id": categoryObj!.id
            }
            let response: ResponseOfOperationResult = await OperationsService.updateOperation(this.operationID!, body);
            return true

        } else {
            alert('Что-то пошло не так, попробуйте позже');
            // this.serverErrorText.style.display = 'block';
            return false
        }
    }

    private modalWithConfirmHandler(): void {
        document.getElementById('modal-confirm-return')!.addEventListener('click', async (event: PointerEvent): Promise<void> => {
            this.openNewRoute('/operations-main-tables');
        });
    }
}