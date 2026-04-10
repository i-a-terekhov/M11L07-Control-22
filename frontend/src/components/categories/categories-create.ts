import {CategoriesService} from "../../services/categories-service";
import {PageHandler} from "../page-handler";
import {CategoryType, ResponseOfCategoryResult} from "../../types/response-of-http-request";

export class CategoryCreate extends PageHandler {
    typesOfCategories: { expense: { name: string, title: string }, income: { name: string, title: string } } = {
        'expense': {name: 'Расходы', title: 'Создание категории расхода | Lumincoin Finance'},
        'income': {name: 'Доходы', title: 'Создание категории дохода | Lumincoin Finance'}
    };

    readonly openNewRouteFunction: Function;
    private typeOfCategory: CategoryType | null;
    readonly titlePageElement: HTMLElement | null;
    readonly pageTitleElement: HTMLElement | null;
    readonly commonErrorText: HTMLElement | null;
    readonly nameOfCategoryElement: HTMLInputElement | null;
    readonly saveButton: HTMLElement | null;
    readonly cancelButton: HTMLElement | null;

    constructor(openNewRouteFunction: Function) {
        super();
        this.openNewRouteFunction = openNewRouteFunction
        this.typeOfCategory = null;

        this.titlePageElement = document.getElementById("title");
        this.pageTitleElement = document.getElementById("page-title");

        this.commonErrorText = document.getElementById("common-error");

        this.nameOfCategoryElement = document.getElementById("name-of-category") as HTMLInputElement;

        this.saveButton = document.getElementById("category-create");
        this.cancelButton = document.getElementById("category-cancel");
        this.saveButton!.addEventListener('click', this.saveButtonHandler.bind(this));
        this.cancelButton!.addEventListener('click', this.cancelButtonHandler.bind(this));

        this.init().then();
    }

    private async init(): Promise<void> {
        this.determineTypeAndIdOfCategory();
    }

    private determineTypeAndIdOfCategory(): void {
        const queryString: string = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const type: string | null = urlParams.get('type');

        if (type === 'expense' || type === 'income') {
            this.typeOfCategory = type;
        } else {
            this.typeOfCategory = null;
        }

        if (!this.typeOfCategory || !(this.typeOfCategory in this.typesOfCategories)) {
            console.warn('Тип операции или ID не задан, переходим в начало');
            return this.openNewRouteFunction('/');
        } else {
            const title: string = this.typesOfCategories[this.typeOfCategory].title;
            this.titlePageElement!.innerText = title;

            const mainTitle: string | undefined = title.split('|')[0];
            if (mainTitle) {
                this.pageTitleElement!.innerText = mainTitle;
            }
        }
    }

    private async saveButtonHandler(): Promise<boolean> {
        this.commonErrorText!.style.display = 'block';
        if (this.nameOfCategoryElement!.value === '') {
            return false;
        } else {
            this.commonErrorText!.style.display = 'none';
        }

        let body: { title: string } = {
            "title": this.nameOfCategoryElement!.value
        };
        let response: ResponseOfCategoryResult | false = await CategoriesService.createCategory(this.typeOfCategory!, body);
        if (response) {
            this.openNewRouteFunction(`/categories?=${this.typeOfCategory}`);
            return true
        } else {
            console.error('Что-то пошло не так, повторите попытку позже')
            return false
        }
    }

    private cancelButtonHandler(): void {
        this.openNewRouteFunction(`/categories?=${this.typeOfCategory}`);
    }
}