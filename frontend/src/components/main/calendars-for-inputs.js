// всплывающие календари, для задания кастомного периода
export class CalendarsForInputs {
    constructor() {
        this.flatpickrOne = new flatpickr("#interval-from-input", {dateFormat: "d.m.y",});

        this.flatpickrTwo = new flatpickr("#interval-until-input", {dateFormat: "d.m.y",});

    }

    destroyFlatpickr() {
        this.flatpickrOne.destroy();
        this.flatpickrTwo.destroy();
    }
}