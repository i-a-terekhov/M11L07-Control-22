import {OptionOfValidation, ValidateInputsRulesType, ValidateRule} from "../types/validate-inputs-rules.type";

export class ValidationUtils {

    public static validateForm(validations: ValidateInputsRulesType): boolean {
        let isValid: boolean = true;

        for (let i: number = 0; i < validations.length; i++) {
            const rule: ValidateRule | undefined= validations[i];
            if (!rule) continue;
            if (!ValidationUtils.validateField(rule.element, rule.options)) {
                isValid = false;
            }
        }

        return isValid;
    }

    private static validateField(element: HTMLInputElement, options: OptionOfValidation | undefined): boolean {
        let condition: boolean = Boolean(element.value);
        if (options) {
            if ('pattern' in options) {
                condition = Boolean(element.value && element.value.match(options.pattern));
            } else if ('compareTo' in options) {
                condition = Boolean(element.value && element.value === options.compareTo);
            }
        }

        if (condition) {
            element.classList.remove("is-invalid");
            return true;
        } else {
            element.classList.add("is-invalid");
            return false;
        }
    }
}