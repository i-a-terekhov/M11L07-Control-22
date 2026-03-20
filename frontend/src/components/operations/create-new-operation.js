import {OperationsService} from "../../services/operations-service";
import {Modal} from 'bootstrap';
import {CategoriesService} from "../../services/categories-service";

export class CreateNewOperation {
    constructor(openNewRouteFunction) {
        this.openNewRoute = openNewRouteFunction;

        this.modalWithAnswer = document.getElementById('modal-answer');
        this.modal_one = new Modal(this.modalWithAnswer);
        this.modalWithConfirm = document.getElementById('modal-confirm');
        this.modal_two = new Modal(this.modalWithConfirm);

        this.typeOfOperation = null;
        if (window.location.search && window.location.search.split('=')[1]) {
            let typeOfOperation = decodeURIComponent(window.location.search.split('=')[1]);
            if (typeOfOperation) {
                this.typeOfOperation = typeOfOperation;
            }
            if (!this.typeOfOperation || !['incomes', 'expenses'].includes(this.typeOfOperation)) {
                console.warn('Тип операции не задан, переходим в начало');
                return this.openNewRoute('/');
            }
        }

        this.init().then();
    }

    async init() {
        this.setElements();
        this.setOperationType();
        await this.updateListOfCategoriesName();
        this.modalWithAnswerHandler();
        this.modalWithConfirmHandler();
    }

    setElements() {
        this.serverErrorText = document.getElementById("server-error");
        this.commonErrorText = document.getElementById("common-error");

        this.typeInput = document.getElementById("operation-type");
        this.typeInput.addEventListener('mousedown', e => e.preventDefault());

        this.categoryInput = document.getElementById("operation-name");
        this.amountInput = document.getElementById("operation-amount");
        this.dateInput = document.getElementById("operation-date");
        this.commentInput = document.getElementById("operation-comment");

        this.saveButton = document.getElementById("operation-save");
        this.cancelButton = document.getElementById("operation-cancel");
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
        const normalizeValue = (value) => {
            return value
                .replace(/\s*\$/g, "")
                .replace(/\s+/g, "")
                .replace(/,/g, "")
                .replace(/[^\d.]/g, "")
        };

        const formatValue = (value) => {
            if (!value) return "";

            const number = Number(value);
            if (isNaN(number)) return "";

            const formatted = formatter.format(number).replace(/,/, " ");

            return formatted + "$";
        };

        this.amountInput.addEventListener("focus", (e) => {
            e.target.value = normalizeValue(e.target.value);
        });

        this.amountInput.addEventListener("input", (e) => {
            e.target.value = normalizeValue(e.target.value);
        });

        this.amountInput.addEventListener("blur", (e) => {
            e.target.value = formatValue(normalizeValue(e.target.value));
        });
    }

    setOperationType() {
        let operationTypeList = ''
        if (this.typeOfOperation === "incomes") {
            operationTypeList = '<option value="income">Доход</option>'

        } else if (this.typeOfOperation === "expenses") {
            operationTypeList = '<option value="expense">Расход</option>'
        }
        this.typeInput.innerHTML = operationTypeList;
    }

    async updateListOfCategoriesName() {
        let operationNameList = '<option value=""></option>'
        if (this.typeInput.value === "expense") {
            let arrayOfCategories = await CategoriesService.getAllExpenseCategories();
            for (let category of arrayOfCategories) {
                operationNameList += '<option value="' + category.title + '">' + category.title + '</option>'
            }
        } else if (this.typeInput.value === "income") {
            let arrayOfCategories = await CategoriesService.getAllIncomeCategories();
            for (let category of arrayOfCategories) {
                operationNameList += '<option value="' + category.title + '">' + category.title + '</option>'
            }
        }
        this.categoryInput.innerHTML = operationNameList;
    }

    saveButtonHandler() {
        this.commonErrorText.style.display = 'block';
        if (this.checkValidation(this.validations)) {
            this.commonErrorText.style.display = 'none';
            this.modal_one.show();
        }
    }

    cancelButtonHandler() {
        this.openNewRoute('/operations-main-tables');
    }

    checkValidation(validations) {
        let isValid = true;
        for (let i = 0; i < validations.length; i++) {
            if (!this.validateField(validations[i].element, validations[i].options)) {
                isValid = false;
            }
        }
        return isValid;
    }

    validateField(element, options) {
        let condition = element.value;
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

    modalWithAnswerHandler() {
        document.getElementById('modal-answer-yes').addEventListener('click', async (event) => {
            let pushDataToServer = await this.pushDataToServer();
            if (pushDataToServer) {
                this.modal_two.show();
            } else {
                alert('Что-то пошло не так... Повторите попытку позже');
            }
        });
    }

    async pushDataToServer() {
        let allCategories = null;
        this.serverErrorText.style.display = 'block';

        if (this.typeInput.value === "expense") {
            allCategories = await CategoriesService.getAllExpenseCategories();
        } else if (this.typeInput.value === "income") {
            allCategories = await CategoriesService.getAllIncomeCategories();
        }

        if (allCategories) {

            let categoryObj = allCategories.find((category) => category.title === this.categoryInput.value);
            let body = {
                "type": this.typeInput.value,
                "amount": +this.amountInput.value.split('$')[0].replace(' ', ''),
                "date": this.dateInput.value,
                "comment": this.commentInput.value,
                "category_id": categoryObj.id
            }
            let response = await OperationsService.createNewOperation(body);
            return true

        } else {
            alert('Что-то пошло не так, попробуйте позже')
            this.serverErrorText.style.display = 'block';
            return false
        }
    }

    modalWithConfirmHandler() {
        document.getElementById('modal-confirm-return').addEventListener('click', async (event) => {
            this.openNewRoute('/operations-main-tables');
        });
    }

    destroy() {
    }
}