import {LocalStorageUtils} from "../utils/local-storage-utils";

export class Sidebar {
    constructor(contentBlock, route) {
        this.sidebarHTML = '/templates/sidebar.html';
        this.contentBlock = contentBlock;
        this.route = route;
        this.highlightOption = null;
        this.balance = ''
        this.userName = 'Пользователь';

        document.addEventListener('balance-change', this.balanceEventListener);
    }

    async getSidebarInitiated() {
        this.getBalanceFromLS();    // метод получения баланса отделен от получения имени, т.к. будет использоваться отдельно
        this.insertBalanceInHTML();
        this.getUsernameFromLS();
        this.insertUserNameInHTML();
        this.addOverlay();         // добавляем оверлей и кнопку вызова сайдбара (при малой ширине экрана)
        this.activateMenuItem();   // раскрашиваем кнопки меню
    }

    async buildSidebarHTML() {
        this.contentBlock.innerHTML = await fetch(this.sidebarHTML).then(response => response.text());
        this.contentBlock = document.getElementById('content-layout');
        return this.contentBlock;
    }

    getBalanceFromLS() {
        let userInfoFromLS = LocalStorageUtils.getAuthInfo(LocalStorageUtils.userInfoKey);
        if (userInfoFromLS) {
            let userInfoObj = JSON.parse(userInfoFromLS);
            if ('balance' in userInfoObj) {
                this.balance = userInfoObj.balance + '$';
            }
        }
    }

    insertBalanceInHTML() {
        let balanceElement = document.getElementById('user-balance');
        balanceElement.innerText = this.balance;
    }

    getUsernameFromLS() {
        let userInfoFromLS = LocalStorageUtils.getAuthInfo(LocalStorageUtils.userInfoKey);
        if (userInfoFromLS) {
            let userNameObj = JSON.parse(userInfoFromLS);
            if (userNameObj.name && userNameObj.lastName) {
                this.userName = userNameObj.name + ' ' + userNameObj.lastName;
            }
        }
    }

    insertUserNameInHTML() {
        let profileNameElement = document.getElementById('profile-name');
        profileNameElement.innerText = this.userName;
    }

    addOverlay() {
        const sidebarElement = document.getElementById('sidebar');
        if (!sidebarElement) return;

        const overlay = document.getElementById('overlay');
        const toggle = document.getElementById('sidebar-toggle');

        toggle.addEventListener('click', () => {
            sidebarElement.classList.toggle('open');
            overlay.classList.toggle('show');
        });

        overlay.addEventListener('click', () => {
            sidebarElement.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    activateMenuItem() {
        let isTreeviewOpen = false;
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

        let dropdownHead = document.getElementById('dropdown');
        let treeview = document.getElementById('treeview');

        if (isTreeviewOpen) {
            treeview.classList.add('open')
        }
        dropdownHead.addEventListener('click', () => {
            treeview.classList.toggle('open');
        });

        document.querySelectorAll('.sidebar .nav-link').forEach(option => {
            const optionHref = option.getAttribute('href');
            if (optionHref === this.highlightOption) {
                option.classList.add('active');
            }
        });
    }

    balanceEventListener = async () => {
        await LocalStorageUtils.updateBalance()
        this.getBalanceFromLS();
        this.insertBalanceInHTML();
    }

}
