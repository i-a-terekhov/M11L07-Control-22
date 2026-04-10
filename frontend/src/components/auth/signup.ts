import {LocalStorageUtils} from "../../utils/local-storage-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {AuthenticationService} from "../../services/authentication-service";
import {OptionOfValidation, ValidateInputsRulesType} from "../../types/validate-inputs-rules.type";
import {ResponseOfAuthResult} from "../../types/response-of-http-request";


export class SignUp {
    static create(openNewRoute: Function): SignUp | null {
        if (LocalStorageUtils.getAuthInfo(LocalStorageUtils.accessTokenKey)) {
            openNewRoute('/');
            return null;
        }
        return new SignUp(openNewRoute);
    }

    readonly openNewRoute: Function;

    readonly nameElement: HTMLInputElement | null;
    readonly lastNameElement: HTMLInputElement | null;
    readonly emailElement: HTMLInputElement | null;
    readonly passwordElement: HTMLInputElement | null;
    readonly passwordRepeatElement: HTMLInputElement | null;
    readonly commonErrorElement: HTMLElement | null;

    readonly validations: ValidateInputsRulesType;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;

        this.nameElement = document.getElementById("name") as HTMLInputElement;
        this.lastNameElement = document.getElementById("last-name") as HTMLInputElement;
        this.emailElement = document.getElementById("email") as HTMLInputElement;
        this.passwordElement = document.getElementById("password") as HTMLInputElement;
        this.passwordRepeatElement = document.getElementById("password-repeat") as HTMLInputElement;
        this.commonErrorElement = document.getElementById("common-error") as HTMLElement;

        this.validations = [
            {element: this.nameElement},
            {element: this.lastNameElement},
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement, options: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/}},
            {element: this.passwordRepeatElement, options: {compareTo: this.passwordElement.value}},
        ];
        const processButton: HTMLElement | null = document.getElementById("process-button");
        if (processButton) {
            processButton.addEventListener("click", this.signUp.bind(this));
        }
    }

    async signUp(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = "none";
        }
        for (let i: number = 0; i < this.validations.length; i++) {
            if (this.validations[i]!.element === this.passwordRepeatElement) {
                const options: OptionOfValidation | undefined = this.validations[i]!.options;
                if (options && 'compareTo' in options) {
                    options.compareTo = this.passwordElement!.value;
                }
            }
        }
        if (ValidationUtils.validateForm(this.validations)) {
            const signupResult: ResponseOfAuthResult | false = await AuthenticationService.singUpRequest({
                name: this.nameElement!.value,
                lastName: this.lastNameElement!.value,
                email: this.emailElement!.value,
                password: this.passwordElement!.value,
                passwordRepeat: this.passwordRepeatElement!.value,
            });

            if (signupResult) {
                return this.openNewRoute('/login');
            }
            if (this.commonErrorElement) {
                this.commonErrorElement!.style.display = "block";
            }
        }
    }
}