import {SignUp} from "./components/auth/signup";
import {Login} from "./components/auth/login";
import {FileUtils} from "./utils/file-utils";
import {LocalStorageUtils} from "./utils/local-storage-utils";
import {CategoriesPage} from "./components/categories/categories-page";
import {Logout} from "./components/auth/logout";
import {Sidebar} from "./components/sidebar";
import {AuthenticationService} from "./services/authorization-service";
import {DiagramPage} from "./components/main/diagrams-page";
import {OperationsPage} from "./components/operations/operations-page";
import {EditOperation} from "./components/operations/edit-operation";
import {CreateNewOperation} from "./components/operations/create-new-operation";
import {CategoryEdit} from "./components/categories/category-edit";
import {CategoryCreate} from "./components/categories/categories-create";
import {ArrayOfRoutsSettings, RouteSettings, SidebarMenuHrefs} from "./types/types-of-main";
import {PageHandler} from "./components/page-handler";

export class Router {
    readonly titlePageElement: HTMLElement | null;
    readonly contentPageElement: HTMLElement | null;
    readonly bootstrapStyleElement: HTMLElement | null;
    sidebarMenuHrefs: SidebarMenuHrefs;
    currentPageInstance: PageHandler | null;
    routes: ArrayOfRoutsSettings;

    constructor() {
        this.titlePageElement = document.getElementById("title");
        this.contentPageElement = document.getElementById("content");
        this.bootstrapStyleElement = document.getElementById("bootstrap_style");

        this.sidebarMenuHrefs = {
            main: '/',                                        // главная
            operations: '/operations-main-tables',            // доходы и расходы
            incomes: '/incomes-main',                         // treeview -> доходы
            expenses: '/expenses-main',                       // treeview -> расходы
        }
        this.currentPageInstance = null;

        this.initEvents();
        this.routes = [
            {
                route: '/signup',
                filePathTemplate: '/templates/pages/auth/signup.html',
                title: 'Регистрация | Lumincoin Finance',
                load: () => {
                    new SignUp(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/login',
                filePathTemplate: '/templates/pages/auth/login.html',
                title: 'Вход | Lumincoin Finance',
                load: () => {
                    Login.create(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/',
                filePathTemplate: '/templates/pages/app-main-diagrams.html',
                sidebarHTML: '/templates/sidebar.html',
                title: 'Главная | Lumincoin Finance',
                styles: [
                    'flatpickr.css'
                ],
                scripts: [
                    'flatpickr.js',
                    'chart.umd.js',
                ],
                load: (): void => {
                    this.currentPageInstance = new DiagramPage();
                },
                unload: (): void => {
                    this.currentPageInstance?.destroy();
                    this.currentPageInstance = null;
                },
                sidebarMenu: {
                    isTreeviewOpen: false,
                    highlightOption: this.sidebarMenuHrefs.main
                }
            },
            {
                route: '/404',
                filePathTemplate: '/templates/pages/404.html',
                title: 'Страница не найдена',
            },
            {
                route: '/category-create',
                filePathTemplate: '/templates/pages/categories/category-create.html',
                sidebarHTML: '/templates/sidebar.html',
                title: 'Создать категорию расхода | Lumincoin Finance',
                load: () => {
                    this.currentPageInstance = new CategoryCreate(this.openNewRoute.bind(this));
                },
                sidebarMenu: {
                    isTreeviewOpen: true,
                    highlightOption: this.sidebarMenuHrefs.expenses
                }
            },
            {
                route: '/category-edit',
                filePathTemplate: '/templates/pages/categories/category-edit.html',
                sidebarHTML: '/templates/sidebar.html',
                title: 'Редактировать категорию расхода | Lumincoin Finance',
                load: () => {
                    this.currentPageInstance = new CategoryEdit(this.openNewRoute.bind(this));
                },
                sidebarMenu: {
                    isTreeviewOpen: true,
                    highlightOption: this.sidebarMenuHrefs.expenses
                }
            },
            {
                route: '/categories',
                filePathTemplate: '/templates/pages/categories/categories-main.html',
                sidebarHTML: '/templates/sidebar.html',
                title: 'Расходы | Lumincoin Finance',
                load: () => {
                    this.currentPageInstance = new CategoriesPage(this.openNewRoute.bind(this));
                },
                sidebarMenu: {
                    isTreeviewOpen: true,
                    highlightOption: this.sidebarMenuHrefs.expenses
                }
            },
            {
                route: '/operations-create',
                filePathTemplate: '/templates/pages/operations/operations-create.html',
                sidebarHTML: '/templates/sidebar.html',
                title: 'Создать операцию | Lumincoin Finance',
                load: () => {
                    this.currentPageInstance = new CreateNewOperation(this.openNewRoute.bind(this));
                },
                sidebarMenu: {
                    isTreeviewOpen: false,
                    highlightOption: this.sidebarMenuHrefs.operations
                }
            },
            {
                route: '/operations-edit',
                filePathTemplate: '/templates/pages/operations/operations-edit.html',
                sidebarHTML: '/templates/sidebar.html',
                title: 'Редактировать операцию | Lumincoin Finance',
                load: () => {
                    this.currentPageInstance = new EditOperation(this.openNewRoute.bind(this));
                },
                unload: () => {
                    this.currentPageInstance = null;
                },
                sidebarMenu: {
                    isTreeviewOpen: false,
                    highlightOption: this.sidebarMenuHrefs.operations
                }
            },
            {
                route: '/operations-main-tables',
                filePathTemplate: '/templates/pages/operations/operations-main-tables.html',
                sidebarHTML: '/templates/sidebar.html',
                title: 'Все операции | Lumincoin Finance',
                styles: [
                    'flatpickr.css'
                ],
                scripts: [
                    'flatpickr.js',
                ],
                load: () => {
                    this.currentPageInstance = new OperationsPage(this.openNewRoute.bind(this));
                },
                unload: () => {
                    this.currentPageInstance?.destroy();
                    this.currentPageInstance = null;
                },
                sidebarMenu: {
                    isTreeviewOpen: false,
                    highlightOption: this.sidebarMenuHrefs.operations
                }
            },
        ]
    }

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    private async clickHandler(e: Event): Promise<void> {
        const target: EventTarget | null = e.target;
        if (!(target instanceof HTMLElement)) return;

        let linkElement: HTMLAnchorElement | null = null;

        if (target instanceof HTMLAnchorElement) {
            linkElement = target;
        } else if (target.parentElement instanceof HTMLAnchorElement) {
            linkElement = target.parentElement;
        }
        if (linkElement) {
            e.preventDefault();
            const currentRoute: string = window.location.pathname;
            const url: string = linkElement.href.replace(window.location.origin, '');
            if (!url || (currentRoute === url.replace('#', '')) || url.startsWith('javascript: void(0)')) {
                return;
            }
            return await this.openNewRoute(url);
        }
    }

    private async activateRoute(e: Event | undefined, oldRoute: string | null = null): Promise<void> {
        if (oldRoute) {
            this.deleteOldRouteFilesLinks(oldRoute)
        }

        const urlRoute: string = window.location.pathname;
        const newRoute: RouteSettings | undefined = this.routes.find((item: RouteSettings): boolean => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.filePathTemplate) {
                let contentBlock: HTMLElement | null = this.contentPageElement;
                if (newRoute.sidebarHTML) {
                    let sidebar: Sidebar = new Sidebar(contentBlock!, newRoute);
                    if (await AuthenticationService.checkAuthorization()) {

                        await LocalStorageUtils.updateBalance();

                        contentBlock = await sidebar.buildSidebarHTML();
                        await sidebar.getSidebarInitiated();
                    } else {
                        history.pushState({}, '', 'login');
                        return this.activateRoute(undefined, null);
                    }
                }
                if (contentBlock) {
                    contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then((response: Response) => response.text());
                }
            }

            if (newRoute.title && this.titlePageElement) {
                this.titlePageElement.innerText = newRoute.title;
            }

            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    FileUtils.loadPageStyle('/css/' + style, this.bootstrapStyleElement as HTMLStyleElement);
                });
            }

            if (newRoute.scripts && newRoute.scripts.length > 0) {
                for (const script of newRoute.scripts) {
                    await FileUtils.loadPageScript('/js/' + script);
                }
            }

            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }
        } else {
            history.pushState({}, '', '/404');
            await this.activateRoute(undefined, null);
        }
    }

    private deleteOldRouteFilesLinks(route: string): void {
        const oldRoute: RouteSettings | undefined = this.routes.find((item: RouteSettings): boolean => item.route === route);
        if (oldRoute && oldRoute.styles && oldRoute.styles.length > 0) {
            oldRoute.styles.forEach(style => {
                const link: Element | null = document.querySelector(`link[href='/css/${style}']`); // защита, от быстрого переключения роутов
                if (link) {
                    link.remove();
                }
            });
        }
        if (oldRoute && oldRoute.scripts && oldRoute.scripts.length > 0) {
            oldRoute.scripts.forEach((script: string) => {
                const link = document.querySelector(`script[src='/js/${script}']`);
                if (link) {
                    link.remove();
                }
            });
        }

        if (oldRoute && oldRoute.unload && typeof oldRoute.unload === 'function') {
            oldRoute.unload();
        }
    }

    private async openNewRoute(url: string): Promise<void> {
        const currentRoute: string = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(undefined, currentRoute);
    }
}