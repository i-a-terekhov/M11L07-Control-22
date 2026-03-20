import {isNumber} from "chart.js/helpers";
import {LocalStorageUtils} from "../../utils/local-storage-utils";

export class MainPagesFilter {
    PERIOD_BEGIN_DAY_AGO = 25000;
    PERIOD_ENDS_DAY_AGO = 0;

    constructor() {
        this.dateFrom = null;
        this.dateUntil = null;
        this.choosenButtonId = null;
        this.dateFromElement = document.getElementById('interval-from-input');
        this.dateUntilElement = document.getElementById('interval-until-input');

        this.initActiveButton();
        this.grabTheDates();           // Запускаем функцию не только при нажатии кнопку фильтра, но и при иниц. страницы
        this.sayDiagramsAboutChange(); // Запускаем функцию не только при нажатии кнопку фильтра, но и при иниц. страницы

        this.addFilterSpeaker();
    }

    initActiveButton() {
        [this.choosenButtonId, this.dateFrom, this.dateUntil] = LocalStorageUtils.getFilterDate();

        if (this.choosenButtonId) {
            this.choosenButton = document.getElementById(this.choosenButtonId);
            this.choosenButton.classList.add("active");
            if (this.dateFrom) {
                this.dateFromElement.value = this.reformatDateToFlatpickr(this.dateFrom);
            }
            if (this.dateUntil) {
                this.dateUntilElement.value = this.reformatDateToFlatpickr(this.dateUntil);
            }

        } else {
            this.dateFrom = this.getDateXDaysAgo(this.PERIOD_BEGIN_DAY_AGO);
            this.dateUntil = this.getDateXDaysAgo(this.PERIOD_ENDS_DAY_AGO);

            let allButtons = document.querySelectorAll(".btn-filter");
            this.choosenButton = allButtons[0];
            this.choosenButton.classList.add('active');
            this.choosenButtonId = this.choosenButton.id;
        }
    }

    grabTheDates() {
        if (this.choosenButtonId === 'btn-today') {
            return this.getPeriodOnDays(0)
        }
        if (this.choosenButtonId === 'btn-week') {
            return this.getPeriodOnDays(7)
        }
        if (this.choosenButtonId === 'btn-month') {
            return this.getPeriodOnDays(30)
        }
        if (this.choosenButtonId === 'btn-year') {
            return this.getPeriodOnDays(365)
        }
        if (this.choosenButtonId === 'btn-all') {
            return this.getPeriodByDefault();
        }
        if (this.choosenButtonId === 'btn-period') {
            return this.customPeriodHandler();
        }
        if (this.choosenButtonId) {
            return this.getPeriodByDefault();
        }
    }

    addFilterSpeaker() {
        const filterBarElement = document.getElementById('filter-bar');
        if (filterBarElement.dataset.isFilterSpeakerSet) {
        } else {
            filterBarElement.dataset.isFilterSpeakerSet = 'true';

            filterBarElement.addEventListener('click', this.filterEventMaker.bind(this));
        }
    }

    filterEventMaker(event) {
        let targetElement = event.target.closest('.btn-filter')
        if (targetElement) {
            this.choosenButton.classList.remove("active");

            this.choosenButtonId = targetElement.getAttribute('id');
            this.choosenButton = targetElement;
            this.choosenButton.classList.add("active");

            this.grabTheDates();
            this.sayDiagramsAboutChange();
        }
    }

    sayDiagramsAboutChange() {
        document.dispatchEvent(new CustomEvent('filter-change', {
            bubbles: true,
            detail: {
                dateFrom: this.dateFrom,
                dateUntil: this.dateUntil
            }
        }));
    }

    customPeriodHandler() {
        if (this.dateFromElement.value) {
            this.dateFrom = this.reformatDateFromFlatpickr(this.dateFromElement.value);
            if (!this.dateFrom) {
                this.getPeriodByDefault(true, false);
            }
        }
        if (this.dateUntilElement) {
            this.dateUntil = this.reformatDateFromFlatpickr(this.dateUntilElement.value);
            if (!this.dateUntil) {
                this.getPeriodByDefault(false, true);
            }
        }

        if (this.dateFrom > this.dateUntil) {
            this.dateFromElement.value = this.reformatDateToFlatpickr(this.dateUntil)
            this.dateUntilElement.value = this.reformatDateToFlatpickr(this.dateFrom);
            return this.grabTheDates();
        }
    }

    getPeriodByDefault(dateFrom = true, dateUntil = true) {
        if (dateFrom) {
            this.dateFrom = this.getDateXDaysAgo(this.PERIOD_BEGIN_DAY_AGO);
        }
        if (dateUntil) {
            this.dateUntil = this.getDateXDaysAgo(this.PERIOD_ENDS_DAY_AGO);
        }
    }

    getPeriodOnDays(days) {
        this.dateFrom = this.getDateXDaysAgo(days);
        this.dateUntil = this.getDateXDaysAgo(this.PERIOD_ENDS_DAY_AGO);
    }

    reformatDateFromFlatpickr(dateFromFlatpickr) {
        if (dateFromFlatpickr) {
            const [day, month, year] = dateFromFlatpickr.split('.');
            let century = '19';
            if (year < 50) {
                century = '20';
            }
            return `${century}${year}-${month}-${day}`;
        }
        return null
    }

    reformatDateToFlatpickr(dateToFlatpick) {
        if (dateToFlatpick) {
            const [year, month, day] = dateToFlatpick.split('-');
            return `${day}.${month}.${year.slice(-2)}`;
        }
        return null
    }

    getDateXDaysAgo(x = 0) {
        let date = new Date();
        if (isNumber(x)) {
            date.setDate(date.getDate() - x);
        }
        return date.toISOString().slice(0, 10);
    }

    saveDatesToLocalStorage() {
        LocalStorageUtils.setFilterSettings(this.choosenButtonId, this.dateFrom, this.dateUntil);
    }

    destroyFilter() {
        this.saveDatesToLocalStorage();
        document.removeEventListener('click', this.filterEventMaker.bind(this));
    }
}