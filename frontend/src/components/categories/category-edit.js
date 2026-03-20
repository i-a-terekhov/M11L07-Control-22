import {CategoriesService} from "../../services/categories-service";

export class CategoryEdit {
    typesOfCategories = {
        'expense': {name: 'Расходы', title: 'Редактирование категории расхода | Lumincoin Finance'},
        'income': {name: 'Доходы', title: 'Редактирование категории дохода | Lumincoin Finance'}
    };

    constructor(openNewRouteFunction) {
        this.openNewRouteFunction = openNewRouteFunction
        this.typeOfCategory = null;
        this.categoryId = null;
        this.titlePageElement = document.getElementById("title");
        this.pageTitleElement = document.getElementById("page-title");

        this.commonErrorText = document.getElementById("common-error");

        this.nameOfCategoryElement = document.getElementById("name-of-category");
        this.currentCategoryObj = null;

        this.saveButton = document.getElementById("category-save");
        this.cancelButton = document.getElementById("category-cancel");
        this.saveButton.addEventListener('click', this.saveButtonHandler.bind(this));
        this.cancelButton.addEventListener('click', this.cancelButtonHandler.bind(this));

        this.init().then();
    }

    async init() {
        this.determineTypeAndIdOfCategory();
        await this.getCategoryFromServer();
        this.renderCategory();
    }

    determineTypeAndIdOfCategory() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.typeOfCategory = urlParams.get('type');
        this.categoryId = urlParams.get('id');

        if (!this.typeOfCategory || !(this.typeOfCategory in this.typesOfCategories) || !Number(this.categoryId)) {
            console.warn('Тип операции или ID не задан, переходим в начало');
            return this.openNewRouteFunction('/');
        } else {
            this.titlePageElement.innerText = this.typesOfCategories[this.typeOfCategory].title;
            this.pageTitleElement.innerText = this.typesOfCategories[this.typeOfCategory].title.split('|')[0]
        }
    }

    async getCategoryFromServer() {
        let currentCategoryObj = await CategoriesService.getCategory(this.typeOfCategory, this.categoryId);
        if (currentCategoryObj) {
            this.currentCategoryObj = currentCategoryObj;
        } else {
            this.currentCategoryObj = null;
        }
    }

    renderCategory() {
        if (this.currentCategoryObj) {
            this.nameOfCategoryElement.value = this.currentCategoryObj.title;
        } else {
            console.error('Что-то пошло не так, повторите попытку позже')
        }
    }

    async saveButtonHandler() {
        this.commonErrorText.style.display = 'block';
        if (this.nameOfCategoryElement.value === '') {
            return;
        } else {
            this.commonErrorText.style.display = 'none';
        }

        let body = {
            "title": this.nameOfCategoryElement.value
        };
        let response = await CategoriesService.updateCategory(this.typeOfCategory, this.categoryId, body);
        if (response) {
            this.openNewRouteFunction(`/categories?=${this.typeOfCategory}`);
            return true
        } else {
            console.error('Что-то пошло не так, повторите попытку позже')
        }
    }

    cancelButtonHandler() {
        this.openNewRouteFunction(`/categories?=${this.typeOfCategory}`);
    }
}
