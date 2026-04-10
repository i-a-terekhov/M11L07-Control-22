export type ValidateInputsRulesType = Array<ValidateRule>;

export type ValidateRule = {
    element: HTMLInputElement;
    options?: OptionOfValidation;
}

export type OptionOfValidation = { pattern: RegExp } | { compareTo: string } | { checkProperty : boolean}