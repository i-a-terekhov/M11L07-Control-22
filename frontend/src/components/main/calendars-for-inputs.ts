import flatpickr from "flatpickr";

export class CalendarsForInputs {
    private flatpickrOne: flatpickr.Instance;
    private flatpickrTwo: flatpickr.Instance;

    constructor() {
        this.flatpickrOne = flatpickr("#interval-from-input", {dateFormat: "d.m.y",}) as flatpickr.Instance;
        this.flatpickrTwo = flatpickr("#interval-until-input", {dateFormat: "d.m.y",}) as flatpickr.Instance;
    }

    destroyFlatpickr(): void {
        this.flatpickrOne.destroy();
        this.flatpickrTwo.destroy();
    }
}