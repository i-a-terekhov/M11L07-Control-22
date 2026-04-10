import {isNumber} from "chart.js/helpers";
import {LocalStorageUtils} from "../../utils/local-storage-utils";
import {FilterChangeDetail} from "../../types/response-of-http-request";

export class MainPagesFilter {
    PERIOD_BEGIN_DAY_AGO = 25000;
    PERIOD_ENDS_DAY_AGO = 0;

    dateFrom: string | undefined | null;
    dateUntil: string | undefined | null;
    chosenButtonId: string | undefined | null;
    chosenButton!: HTMLElement | null;
    dateFromElement: HTMLInputElement | null;
    dateUntilElement: HTMLInputElement | null;

    constructor() {
        this.dateFrom = null;
        this.dateUntil = null;
        this.chosenButtonId = null;
        this.dateFromElement = document.getElementById('interval-from-input') as HTMLInputElement;
        this.dateUntilElement = document.getElementById('interval-until-input') as HTMLInputElement;

        this.initActiveButton();
        this.grabTheDates();           // Запускаем функцию не только при нажатии кнопку фильтра, но и при иниц. страницы
        this.sayDiagramsAboutChange(); // Запускаем функцию не только при нажатии кнопку фильтра, но и при иниц. страницы

        this.addFilterSpeaker();
    }

    initActiveButton(): void {
        [this.chosenButtonId, this.dateFrom, this.dateUntil] = LocalStorageUtils.getFilterDate();

        if (this.chosenButtonId) {
            this.chosenButton = document.getElementById(this.chosenButtonId);
            this.chosenButton!.classList.add("active");
            if (this.dateFrom) {
                this.dateFromElement!.value = this.reformatDateToFlatpickr(this.dateFrom)!;
            }
            if (this.dateUntil) {
                this.dateUntilElement!.value = this.reformatDateToFlatpickr(this.dateUntil)!;
            }

        } else {
            this.dateFrom = this.getDateXDaysAgo(this.PERIOD_BEGIN_DAY_AGO);
            this.dateUntil = this.getDateXDaysAgo(this.PERIOD_ENDS_DAY_AGO);

            let allButtons: NodeListOf<Element> = document.querySelectorAll(".btn-filter");
            this.chosenButton = allButtons[0] as HTMLElement;
            this.chosenButton.classList.add('active');
            this.chosenButtonId = this.chosenButton.id;
        }
    }

    grabTheDates(): void {
        if (this.chosenButtonId === 'btn-today') {
            return this.getPeriodOnDays(0)
        }
        if (this.chosenButtonId === 'btn-week') {
            return this.getPeriodOnDays(7)
        }
        if (this.chosenButtonId === 'btn-month') {
            return this.getPeriodOnDays(30)
        }
        if (this.chosenButtonId === 'btn-year') {
            return this.getPeriodOnDays(365)
        }
        if (this.chosenButtonId === 'btn-all') {
            return this.getPeriodByDefault();
        }
        if (this.chosenButtonId === 'btn-period') {
            return this.customPeriodHandler();
        }
        if (this.chosenButtonId) {
            return this.getPeriodByDefault();
        }
    }

    addFilterSpeaker(): void {
        const filterBarElement: HTMLElement | null = document.getElementById('filter-bar');
        if (filterBarElement!.dataset.isFilterSpeakerSet) {
        } else {
            filterBarElement!.dataset.isFilterSpeakerSet = 'true';

            filterBarElement!.addEventListener('click', this.filterEventMaker.bind(this));
        }
    }

    filterEventMaker(event: Event): void {
        if (!(event.target instanceof HTMLElement)) return;

        let targetElement: Element | null = event.target.closest('.btn-filter')
        if (targetElement) {
            this.chosenButton!.classList.remove("active");

            this.chosenButtonId = targetElement.getAttribute('id');
            this.chosenButton = targetElement as HTMLElement;
            this.chosenButton.classList.add("active");

            this.grabTheDates();
            this.sayDiagramsAboutChange();
        }
    }

    sayDiagramsAboutChange(): void {
        document.dispatchEvent(new CustomEvent<FilterChangeDetail>('filter-change', {
            bubbles: true,
            detail: {
                dateFrom: this.dateFrom!,
                dateUntil: this.dateUntil!
            }
        }));
    }

    customPeriodHandler() {
        if (this.dateFromElement!.value) {
            this.dateFrom = this.reformatDateFromFlatpickr(this.dateFromElement!.value);
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

        if (this.dateFrom! > this.dateUntil!) {
            this.dateFromElement!.value = this.reformatDateToFlatpickr(this.dateUntil as string)!;
            this.dateUntilElement!.value = this.reformatDateToFlatpickr(this.dateFrom as string)!;
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

    getPeriodOnDays(days: number): void {
        this.dateFrom = this.getDateXDaysAgo(days);
        this.dateUntil = this.getDateXDaysAgo(this.PERIOD_ENDS_DAY_AGO);
    }

    reformatDateFromFlatpickr(dateFromFlatpickr: string): string | null {
        if (dateFromFlatpickr) {
            const [day, month, year] = dateFromFlatpickr.split('.');
            let century: string = '19';
            if (year && Number(year) < 50) {
                century = '20';
            }
            return `${century}${year}-${month}-${day}`;
        }
        return null
    }

    reformatDateToFlatpickr(dateToFlatpick: string): string | null {
        if (dateToFlatpick) {
            const [year, month, day] = dateToFlatpick.split('-');
            return `${day}.${month}.${year!.slice(-2)}`;
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
        LocalStorageUtils.setFilterSettings(this.chosenButtonId as string, this.dateFrom as string, this.dateUntil as string);
    }

    destroyFilter() {
        this.saveDatesToLocalStorage();
        document.removeEventListener('click', this.filterEventMaker.bind(this));
    }
}