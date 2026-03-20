import {SignUp} from "./components/auth/signup";
import {Login} from "./components/auth/login";
import {FileUtils} from "./utils/file-utils";
import {LocalStorageUtils} from "./utils/local-storage-utils";
import {CategoriesPage} from "./components/categories/categories-page";
import {Logout} from "./components/auth/logout";
import {Sidebar} from "./components/sideBar";
import {AuthenticationService} from "./services/authorization-service";
import {DiagramPage} from "./components/main/diagrams-page";
import {OperationsPage} from "./components/operations/operations-page";
import {EditOperation} from "./components/operations/edit-operation";
import {CreateNewOperation} from "./components/operations/create-new-operation";
import {CategoryEdit} from "./components/categories/category-edit";
import {CategoryCreate} from "./components/categories/categories-create";

export class Router {
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
                    new Login(this.openNewRoute.bind(this));
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
                load: () => {
                    this.currentPageInstance = new DiagramPage();
                },
                unload: () => {
                    this.currentPageInstance.destroy();
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
                    this.currentPageInstance.destroy();
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
                    this.currentPageInstance.destroy();
                    this.currentPageInstance = null;
                },
                sidebarMenu: {
                    isTreeviewOpen: false,
                    highlightOption: this.sidebarMenuHrefs.operations
                }
            },
        ]
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    async clickHandler(e) {
        let linkElement = null;
        if (e.target.nodeName === 'A') {
            linkElement = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            linkElement = e.target.parentNode;
        }
        if (linkElement) {
            e.preventDefault();
            const currentRoute = window.location.pathname;
            const url = linkElement.href.replace(window.location.origin, '');
            if (!url || (currentRoute === url.replace('#', '')) || url.startsWith('javascript: void(0)')) {
                return;
            }
            return await this.openNewRoute(url);
        }
    }

    async activateRoute(e, oldRoute = null) {
        if (oldRoute) {
            this.deleteOldRouteFilesLinks(oldRoute)
        }

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.filePathTemplate) {
                let contentBlock = this.contentPageElement;
                if (newRoute.sidebarHTML) {
                    let sidebar = new Sidebar(contentBlock, newRoute);
                    if (await AuthenticationService.checkAuthorization()) {

                        await LocalStorageUtils.updateBalance();

                        contentBlock = await sidebar.buildSidebarHTML();
                        await sidebar.getSidebarInitiated();
                    } else {
                        history.pushState({}, '', 'login');
                        return this.activateRoute(null);
                    }
                }
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }

            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title;
            }

            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    FileUtils.loadPageStyle('/css/' + style, this.bootstrapStyleElement);
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
            await this.activateRoute(null);
        }
    }

    deleteOldRouteFilesLinks(route) {
        const oldRoute = this.routes.find(item => item.route === route);
        if (oldRoute.styles && oldRoute.styles.length > 0) {
            oldRoute.styles.forEach(style => {
                const link = document.querySelector(`link[href='/css/${style}']`); // защита, от быстрого переключения роутов
                if (link) {
                    link.remove();
                }
            });
        }
        if (oldRoute.scripts && oldRoute.scripts.length > 0) {
            oldRoute.scripts.forEach(script => {
                const link = document.querySelector(`script[src='/js/${script}']`);
                if (link) {
                    link.remove();
                }
            });
        }

        if (oldRoute.unload && typeof oldRoute.unload === 'function') {
            oldRoute.unload();
        }
    }

    async openNewRoute(url) {
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(null, currentRoute);
    }
}