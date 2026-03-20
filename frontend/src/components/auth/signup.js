import {LocalStorageUtils} from "../../utils/local-storage-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {AuthenticationService} from "../../services/authentication-service";


export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (LocalStorageUtils.getAuthInfo(LocalStorageUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.findElements();

        this.validations = [
            {element: this.nameElement},
            {element: this.lastNameElement},
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement, options: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/}},
            {element: this.passwordRepeatElement, options: {compareTo: this.passwordElement.value}},
        ];

        document.getElementById("process-button").addEventListener("click", this.signUp.bind(this));
    }

    findElements() {
        this.nameElement = document.getElementById("name");
        this.lastNameElement = document.getElementById("last-name");
        this.emailElement = document.getElementById("email");
        this.passwordElement = document.getElementById("password");
        this.passwordRepeatElement = document.getElementById("password-repeat");
        this.commonErrorElement = document.getElementById("common-error");
    }

    async signUp() {
        this.commonErrorElement.style.display = "none";
        for (let i = 0; i < this.validations.length; i++) {
            if (this.validations[i].element === this.passwordRepeatElement) {
                this.validations[i].options.compareTo = this.passwordElement.value;
            }
        }
        if (ValidationUtils.validateForm(this.validations)) {
            const signupResult = await AuthenticationService.singUpRequest({
                name: this.nameElement.value,
                lastName: this.lastNameElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value,
            });

            if (signupResult) {
                return this.openNewRoute('/login');
            }

            this.commonErrorElement.style.display = "block";
        }
    }
}