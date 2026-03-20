import {CategoriesService} from "../../services/categories-service";

export class CategoriesPage {
    typesOfCategories = {'expense': 'Расходы', 'income': "Доходы"};

    constructor(openNewRouteFunction) {
        this.openNewRouteFunction = openNewRouteFunction
        this.typeOfCategory = null;
        this.titlePageElement = document.getElementById("title");
        this.pageTitleElement = document.getElementById("page-title");

        this.currentArrayOfCategories = null;
        this.cardsAreaElement = document.getElementById("cards-area");
        this.editCategoryButtons = null;
        this.createNewCategoryButton = null;

        this.modalWindow = document.getElementById('modal');
        this.modalButtonYes = document.getElementById('modal-answer-yes');

        this.init().then();
    }

    async init() {
        this.determineTypeOfCategories();
        await this.getCategoriesFromServer();
        this.renderCategories();
        await this.initModalWindow();
    }

    determineTypeOfCategories() {
        if (window.location.search && window.location.search.split('=')[1]) {
            let typeOfCategories = decodeURIComponent(window.location.search.split('=')[1]);
            if (typeOfCategories) {
                this.typeOfCategory = typeOfCategories;
            }
            if (!this.typeOfCategory || !this.typeOfCategory in this.typesOfCategories) {
                console.warn('Тип операции не задан, переходим в начало');
                return this.openNewRouteFunction('/');
            } else {
                this.titlePageElement.innerText = this.typesOfCategories[this.typeOfCategory] + ' | Lumincoin Finance';
                this.pageTitleElement.innerText = this.typesOfCategories[this.typeOfCategory]
            }
        }
    }

    async getCategoriesFromServer() {
        let allCategories = null;
        if (this.typeOfCategory === "expense") {
            allCategories = await CategoriesService.getAllExpenseCategories();
        } else if (this.typeOfCategory === "income") {
            allCategories = await CategoriesService.getAllIncomeCategories();
        }
        if (allCategories) {
            this.currentArrayOfCategories = allCategories;
        } else {
            this.currentArrayOfCategories = null;
        }
    }

    renderCategories() {
        let innerHtmlElement = ''
        if (this.currentArrayOfCategories) {
            for (let cat of this.currentArrayOfCategories) {
                innerHtmlElement += `
        <div class="name-elem-parent category-card card p-3 shadow-none">
            <div class="header ps-1">
                <h4 class="name-of-entity title mb-1">${cat.title}</h4>
            </div>
            <div class="footer mt-1">
                <button type="button" class="btn btn-primary action-edit">
                    Редактировать
                </button>
                <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modal">
                    Удалить
                </button>
            </div>
        </div>
                `
            }
            innerHtmlElement += `
        <div class="category-card blank-card card shadow-none">
            <button type="button" class="btn" id="create-entity-button">
                <svg fill="none" height="15" viewBox="0 0 14 15" width="14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.6445 5.57812V8.54492H0V5.57812H13.6445ZM8.42188 0V14.4922H5.23633V0H8.42188Z"
                          fill="#CED4DA"/>
                </svg>
            </button>
        </div>
            `;
            this.cardsAreaElement.innerHTML = innerHtmlElement;

            this.createNewCategoryButton = document.getElementById('create-entity-button');
            this.initNewCategoryButton();
            this.editCategoryButtons = document.querySelectorAll('.action-edit');
            this.initEditCategoryButtons();
        }
    }

    async initModalWindow() {
        this.modalWindow.addEventListener('show.bs.modal', (event) => {
            this.modalWindow.dataset.title = event.relatedTarget.closest('.name-elem-parent')
                .querySelector('.name-of-entity').textContent.trim();
        });

        this.modalButtonYes.addEventListener('click', async () => {
            let categoryObj = this.currentArrayOfCategories.find((category) => category.title === this.modalWindow.dataset.title);
            let response = await CategoriesService.deleteCategory(this.typeOfCategory, categoryObj.id);
            if (response) {
                await this.getCategoriesFromServer();
                this.renderCategories();
                return true
            } else {
                console.error('Что-то пошло не так, повторите попытку позже')
                return false;
            }
        });
    }

    initNewCategoryButton() {
        this.createNewCategoryButton.addEventListener('click', () => {
            this.openNewRouteFunction('/category-create?type=' + this.typeOfCategory);
        });
    }

    getCategoryId(nameOfCategory) {
        return this.currentArrayOfCategories.find((category) => category.title === nameOfCategory).id;
    }

    initEditCategoryButtons() {
        this.editCategoryButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const targetLinkName = event.target.closest('.name-elem-parent')
                    .querySelector('.name-of-entity').textContent.trim();
                let id = this.getCategoryId(targetLinkName);

                this.openNewRouteFunction('/category-edit?type=' + this.typeOfCategory + '&id=' + id);
            });
        });
    }
}