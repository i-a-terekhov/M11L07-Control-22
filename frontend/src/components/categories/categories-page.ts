import {CategoriesService} from "../../services/categories-service";
import {PageHandler} from "../page-handler";
import {
    BootstrapModalEvent,
    ResponseOfAllCategoriesResult,
    ResponseOfCategoryResult,
} from "../../types/response-of-http-request";

export class CategoriesPage extends PageHandler {
    typesOfCategories: { expense: string, income: string } = {'expense': 'Расходы', 'income': "Доходы"};

    openNewRouteFunction: Function;
    typeOfCategory: 'expense' | 'income' | null;
    titlePageElement: HTMLElement | null;
    pageTitleElement: HTMLElement | null;
    currentObjOfCategories: ResponseOfAllCategoriesResult | null;
    cardsAreaElement: HTMLElement | null;
    editCategoryButtons: NodeListOf<Element> | null;
    createNewCategoryButton: HTMLElement | null;
    modalWindow: HTMLElement | null;
    modalButtonYes: HTMLElement | null;

    constructor(openNewRouteFunction: Function) {
        super();
        this.openNewRouteFunction = openNewRouteFunction
        this.typeOfCategory = null;
        this.titlePageElement = document.getElementById("title");
        this.pageTitleElement = document.getElementById("page-title");

        this.currentObjOfCategories = null;
        this.cardsAreaElement = document.getElementById("cards-area");
        this.editCategoryButtons = null;
        this.createNewCategoryButton = null;

        this.modalWindow = document.getElementById('modal');
        this.modalButtonYes = document.getElementById('modal-answer-yes');

        this.init().then();
    }

    private async init(): Promise<void> {
        this.determineTypeOfCategories();
        await this.getCategoriesFromServer();
        this.renderCategories();
        await this.initModalWindow();
    }

    private determineTypeOfCategories(): void {
        const queryString: string = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const category: string | null = urlParams.get('category');

        if (category === 'expense' || category === 'income') {
            this.typeOfCategory = category;
            const title: string = this.typesOfCategories[this.typeOfCategory];
            this.titlePageElement!.innerText = title + ' | Lumincoin Finance';
            this.pageTitleElement!.innerText = title;
        } else {
            this.typeOfCategory = null;
            console.warn('Тип операции не задан, переходим в начало');
            return this.openNewRouteFunction('/');
        }
    }

    async getCategoriesFromServer(): Promise<void> {
        let allCategories: ResponseOfAllCategoriesResult | false | null = null;
        if (this.typeOfCategory === "expense") {
            allCategories = await CategoriesService.getAllExpenseCategories();
        } else if (this.typeOfCategory === "income") {
            allCategories = await CategoriesService.getAllIncomeCategories();
        }
        if (allCategories) {
            this.currentObjOfCategories = allCategories;
        } else {
            this.currentObjOfCategories = null;
        }
    }

    renderCategories(): void {
        let innerHtmlElement: string = ''
        if (this.currentObjOfCategories) {
            for (let cat of this.currentObjOfCategories) {
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
            this.cardsAreaElement!.innerHTML = innerHtmlElement;

            this.createNewCategoryButton = document.getElementById('create-entity-button');
            this.initNewCategoryButton();
            this.editCategoryButtons = document.querySelectorAll('.action-edit');
            this.initEditCategoryButtons();
        }
    }

    async initModalWindow(): Promise<void> {
        this.modalWindow!.addEventListener('show.bs.modal', (event: Event): void => {
            const bootstrapEvent = event as BootstrapModalEvent;
            if (!bootstrapEvent.relatedTarget) return;

            this.modalWindow!.dataset.title = bootstrapEvent.relatedTarget.closest('.name-elem-parent')!
                .querySelector('.name-of-entity')!.textContent!.trim();
        });

        this.modalButtonYes!.addEventListener('click', async (): Promise<boolean> => {
            let categoryObj: ResponseOfCategoryResult | undefined = this.currentObjOfCategories!.find((category: ResponseOfCategoryResult): boolean => category.title === this.modalWindow!.dataset.title);
            if (categoryObj && this.typeOfCategory) {
                let response = await CategoriesService.deleteCategory(this.typeOfCategory, String(categoryObj.id));
                if (response) {
                    await this.getCategoriesFromServer();
                    this.renderCategories();
                    return true
                } else {
                    console.error('Что-то пошло не так, повторите попытку позже')
                    return false;
                }
            } else {
                console.error('Что-то пошло не так, повторите попытку позже')
                return false
            }
        });
    }

    initNewCategoryButton(): void {
        this.createNewCategoryButton!.addEventListener('click', () => {
            this.openNewRouteFunction('/category-create?type=' + this.typeOfCategory);
        });
    }

    getCategoryId(nameOfCategory: string): number {
        let categoryId: number | undefined = this.currentObjOfCategories!.find((category: ResponseOfCategoryResult): boolean => category.title === nameOfCategory)!.id;
        if (categoryId) {
            return Number(categoryId)
        } else {
            return 0;
        }
    }

    initEditCategoryButtons(): void {
        this.editCategoryButtons!.forEach((btn: Element): void => {
            btn.addEventListener('click', (event: Event): void => {
                if (event.target instanceof HTMLElement) {
                    const targetLinkName: string = event.target.closest('.name-elem-parent')!
                        .querySelector('.name-of-entity')!.textContent.trim();
                    let id: number = this.getCategoryId(targetLinkName);

                    this.openNewRouteFunction('/category-edit?type=' + this.typeOfCategory + '&id=' + String(id));
                }
            });
        });
    }
}