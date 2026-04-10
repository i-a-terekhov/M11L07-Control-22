import {LocalStorageUtils} from "../../utils/local-storage-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {AuthenticationService} from "../../services/authentication-service";
import {ValidateInputsRulesType} from "../../types/validate-inputs-rules.type";
import {ResponseOfAuthResult} from "../../types/response-of-http-request";


export class Login {
    static create(openNewRoute: Function): Login | null {
        if (LocalStorageUtils.getAuthInfo(LocalStorageUtils.accessTokenKey)) {
            openNewRoute('/');
            return null;
        }
        return new Login(openNewRoute);
    }

    openNewRoute: Function;

    readonly emailElement: HTMLInputElement | null;
    readonly passwordElement: HTMLInputElement | null;
    readonly rememberMeElement: HTMLInputElement | null;
    readonly commonErrorElement: HTMLElement | null;

    readonly validations: ValidateInputsRulesType;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;

        this.emailElement = document.getElementById("email") as HTMLInputElement;
        this.passwordElement = document.getElementById("password") as HTMLInputElement;
        this.rememberMeElement = document.getElementById("remember-me-checkbox") as HTMLInputElement;
        this.commonErrorElement = document.getElementById("common-error") as HTMLElement;

        this.validations = [
            {element: this.passwordElement},
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
        ];
        const processButton: HTMLElement | null = document.getElementById("process-button");
        if (processButton) {
            processButton.addEventListener("click", this.login.bind(this));
        }
    }

    async login(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = "none";
        }
        if (ValidationUtils.validateForm(this.validations)) {

            const loginResult: ResponseOfAuthResult | false = await AuthenticationService.loginRequest({
                email: this.emailElement!.value,
                password: this.passwordElement!.value,
                rememberMe: this.rememberMeElement!.checked,
            });

            if (loginResult) {
                LocalStorageUtils.setAuthInfo(loginResult.tokens.accessToken, loginResult.tokens.refreshToken, {
                    id: loginResult.user.id,
                    name: loginResult.user.name,
                    lastName: loginResult.user.lastName,
                });
                return this.openNewRoute('/');
            }
            if (this.commonErrorElement) {
                this.commonErrorElement!.style.display = "block";
            }
        }
    }
}