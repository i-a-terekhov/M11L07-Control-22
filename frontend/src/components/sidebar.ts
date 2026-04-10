import {LocalStorageUtils} from "../utils/local-storage-utils";
import {infoFromLocalStorage} from "../types/response-of-http-request";
import {RouteSettings} from "../types/types-of-main";

export class Sidebar {
    sidebarHTML: string;
    contentBlock: HTMLElement;
    route: RouteSettings;
    highlightOption: string | null;
    balance: string;
    userName: string;

    constructor(contentBlock: HTMLElement, route: RouteSettings) {
        this.sidebarHTML = '/templates/sidebar.html';
        this.contentBlock = contentBlock;
        this.route = route;
        this.highlightOption = null;
        this.balance = ''
        this.userName = 'Пользователь';

        document.addEventListener('balance-change', this.balanceEventListener);
    }

    public async getSidebarInitiated(): Promise<void> {
        this.getBalanceFromLS();    // метод получения баланса отделен от получения имени, т.к. будет использоваться отдельно
        this.insertBalanceInHTML();
        this.getUsernameFromLS();
        this.insertUserNameInHTML();
        this.addOverlay();         // добавляем оверлей и кнопку вызова сайдбара (при малой ширине экрана)
        this.activateMenuItem();   // раскрашиваем кнопки меню
    }

    public async buildSidebarHTML(): Promise<HTMLElement> {
        this.contentBlock.innerHTML = await fetch(this.sidebarHTML).then(response => response.text());
        this.contentBlock = document.getElementById('content-layout')!;
        return this.contentBlock;
    }

    private getBalanceFromLS(): void {
        let userInfoFromLS: infoFromLocalStorage = LocalStorageUtils.getAuthInfo(LocalStorageUtils.userInfoKey);
        if (userInfoFromLS) {
            let userInfoObj: Object = JSON.parse(userInfoFromLS as string);
            if ('balance' in userInfoObj) {
                this.balance = userInfoObj.balance + '$';
            }
        }
    }

    private insertBalanceInHTML(): void {
        let balanceElement: HTMLElement | null = document.getElementById('user-balance');
        balanceElement!.innerText = this.balance;
    }

    private getUsernameFromLS(): void {
        let userInfoFromLS: infoFromLocalStorage = LocalStorageUtils.getAuthInfo(LocalStorageUtils.userInfoKey);
        if (userInfoFromLS) {
            let userNameObj: Object = JSON.parse(userInfoFromLS as string);
            if ('name' in userNameObj && 'lastName' in userNameObj) {
                this.userName = userNameObj.name + ' ' + userNameObj.lastName;
            }
        }
    }

    private insertUserNameInHTML(): void {
        let profileNameElement: HTMLElement | null = document.getElementById('profile-name');
        profileNameElement!.innerText = this.userName;
    }

    private addOverlay(): void {
        const sidebarElement: HTMLElement | null = document.getElementById('sidebar');
        if (!sidebarElement) return;

        const overlay: HTMLElement | null = document.getElementById('overlay');
        const toggle: HTMLElement | null = document.getElementById('sidebar-toggle');

        toggle!.addEventListener('click', (): void => {
            sidebarElement.classList.toggle('open');
            overlay!.classList.toggle('show');
        });

        overlay!.addEventListener('click', (): void => {
            sidebarElement.classList.remove('open');
            overlay!.classList.remove('show');
        });
    }

    private activateMenuItem(): void {
        let isTreeviewOpen: boolean = false;
        if (this.route.sidebarMenu) {
            if (this.route.sidebarMenu.isTreeviewOpen) {
                isTreeviewOpen = this.route.sidebarMenu.isTreeviewOpen;
            }
            if (this.route.sidebarMenu.highlightOption) {
                this.highlightOption = this.route.sidebarMenu.highlightOption;
            }
        } else {
            return
        }

        let dropdownHead: HTMLElement | null = document.getElementById('dropdown');
        let treeview: HTMLElement | null = document.getElementById('treeview');

        if (isTreeviewOpen) {
            treeview!.classList.add('open')
        }
        dropdownHead!.addEventListener('click', (): void => {
            treeview!.classList.toggle('open');
        });

        document.querySelectorAll('.sidebar .nav-link').forEach((option: Element) => {
            const optionHref: string | null = option.getAttribute('href');
            if (optionHref === this.highlightOption) {
                option.classList.add('active');
            }
        });
    }

    private balanceEventListener: () => Promise<void> = async (): Promise<void> => {
        await LocalStorageUtils.updateBalance()
        this.getBalanceFromLS();
        this.insertBalanceInHTML();
    }

}
