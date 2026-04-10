import {CategoriesService} from "../../services/categories-service";
import {PageHandler} from "../page-handler";
import {CategoryType, ResponseOfCategoryResult} from "../../types/response-of-http-request";

export class CategoryEdit extends PageHandler {
    typesOfCategories = {
        'expense': {name: 'Расходы', title: 'Редактирование категории расхода | Lumincoin Finance'},
        'income': {name: 'Доходы', title: 'Редактирование категории дохода | Lumincoin Finance'}
    };
    openNewRouteFunction: Function;
    typeOfCategory:  CategoryType | null;
    categoryId: string | null;
    titlePageElement: HTMLElement | null;
    pageTitleElement: HTMLElement | null;

    commonErrorText: HTMLElement | null;

    nameOfCategoryElement: HTMLInputElement | null;
    currentCategoryObj: ResponseOfCategoryResult | null;

    saveButton: HTMLElement | null;
    cancelButton: HTMLElement | null;

    constructor(openNewRouteFunction: Function) {
        super();
        this.openNewRouteFunction = openNewRouteFunction;
        this.typeOfCategory = null;
        this.categoryId = null;
        this.titlePageElement = document.getElementById("title");
        this.pageTitleElement = document.getElementById("page-title");

        this.commonErrorText = document.getElementById("common-error");

        this.nameOfCategoryElement = document.getElementById("name-of-category") as HTMLInputElement;
        this.currentCategoryObj = null;

        this.saveButton = document.getElementById("category-save");
        this.cancelButton = document.getElementById("category-cancel");
        this.saveButton!.addEventListener('click', this.saveButtonHandler.bind(this));
        this.cancelButton!.addEventListener('click', this.cancelButtonHandler.bind(this));

        this.init().then();
    }

    async init() {
        this.determineTypeAndIdOfCategory();
        await this.getCategoryFromServer();
        this.renderCategory();
    }

    determineTypeAndIdOfCategory() {
        const queryString: string = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let type: string | null = urlParams.get('type');
        if (type === 'expense' || type === 'income') {
            this.typeOfCategory = type;
        }
        this.categoryId = urlParams.get('id');

        if (!this.typeOfCategory || !(this.typeOfCategory in this.typesOfCategories) || !Number(this.categoryId)) {
            console.warn('Тип операции или ID не задан, переходим в начало');
            return this.openNewRouteFunction('/');
        } else {
            this.titlePageElement!.innerText = this.typesOfCategories[this.typeOfCategory].title;
            this.pageTitleElement!.innerText = this.typesOfCategories[this.typeOfCategory]!.title.split('|')[0]!
        }
    }

    async getCategoryFromServer(): Promise<void> {
        let currentCategoryObj: ResponseOfCategoryResult | false = await CategoriesService.getCategory(this.typeOfCategory!, this.categoryId!);
        if (currentCategoryObj) {
            this.currentCategoryObj = currentCategoryObj;
        } else {
            this.currentCategoryObj = null;
        }
    }

    renderCategory(): void {
        if (this.currentCategoryObj && this.nameOfCategoryElement) {
            this.nameOfCategoryElement.value = this.currentCategoryObj.title;
        } else {
            console.error('Что-то пошло не так, повторите попытку позже')
        }
    }

    async saveButtonHandler(): Promise<boolean> {
        this.commonErrorText!.style.display = 'block';
        if (this.nameOfCategoryElement!.value === '') {
            return false;
        } else {
            this.commonErrorText!.style.display = 'none';
        }

        let body = {
            "title": this.nameOfCategoryElement!.value
        };
        let response = await CategoriesService.updateCategory(this.typeOfCategory!, this.categoryId!, body);
        if (response) {
            this.openNewRouteFunction(`/categories?=${this.typeOfCategory}`);
            return true;
        } else {
            console.error('Что-то пошло не так, повторите попытку позже')
            return false;
        }
    }

    cancelButtonHandler() {
        this.openNewRouteFunction(`/categories?=${this.typeOfCategory}`);
    }
}
