import {AuthenticationService} from "../services/authentication-service";
import {BalanceService} from "../services/balance-service";
import {
    infoFromLocalStorage,
    ResponseOfAuthResult,
    ResponseOfBalanceResult
} from "../types/response-of-http-request";

export class LocalStorageUtils {
    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';
    public static userInfoKey: string = 'userInfo';
    private static chosenButtonId: string = 'filterChosenButtonId'
    private static filterDateFromKey: string = 'filterDateFrom';
    private static filterDateUntilKey: string = 'filterDateUntil';

    public static setAuthInfo(accessToken: string, refreshToken: string, userInfo: Object | null = null): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if (userInfo) {
            localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
        }
    }

    public static setFilterSettings(chosenButtonId: string, dateFrom: string, dateUntil: string): void {
        let currentUserInfo: string = this.getAuthInfo(this.userInfoKey) as string;
        let currentUserInfoObj: Record<string, string> = JSON.parse(currentUserInfo);

        currentUserInfoObj[this.chosenButtonId] = chosenButtonId;
        currentUserInfoObj[this.filterDateFromKey] = dateFrom;
        currentUserInfoObj[this.filterDateUntilKey] = dateUntil;

        localStorage.setItem(this.userInfoKey, JSON.stringify(currentUserInfoObj));
    }

    public static getFilterDate(): (string|null|undefined)[] {
        let currentUserInfo: string = this.getAuthInfo(this.userInfoKey) as string;
        let currentUserInfoObj: Record<string, string> = JSON.parse(currentUserInfo);
        let chosenButtonId: string | undefined | null = null,
            dateFrom: string | undefined | null = null,
            dateUntil: string | undefined | null = null;

        if (currentUserInfoObj[this.chosenButtonId]) {
            chosenButtonId = currentUserInfoObj[this.chosenButtonId];
        }
        if (currentUserInfoObj[this.filterDateFromKey]) {
            dateFrom = currentUserInfoObj[this.filterDateFromKey];
        }
        if (currentUserInfoObj[this.filterDateUntilKey]) {
            dateUntil = currentUserInfoObj[this.filterDateUntilKey];
        }
        return [chosenButtonId, dateFrom, dateUntil];
    }

    public static async updateBalance(): Promise<void> {
        const response: false | ResponseOfBalanceResult = await BalanceService.balanceRequest();
        if (response) {
            if (this.getAuthInfo(this.userInfoKey)) {
                let userInfo: Record<string, string> = JSON.parse(this.getAuthInfo(this.userInfoKey) as string);
                userInfo.balance = String(response.balance);
                localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
            }
        } else {
            console.error('Не удалось получить баланс');
        }
    }

    public static removeAuthInfo(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoKey);
    }

    public static getAuthInfo(key: string | null = null): infoFromLocalStorage {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoKey]: localStorage.getItem(this.userInfoKey),
            }
        }
    }

    public static async updateRefreshToken(): Promise<boolean> {
        let result: boolean = false;
        const refreshToken: string | null = this.getAuthInfo(this.refreshTokenKey) as (string | null);
        if (refreshToken) {
            const response: false | ResponseOfAuthResult = await AuthenticationService.refreshTokenRequest({
                refreshToken: refreshToken
            });
            if (response && response.tokens) {
                this.setAuthInfo(response.tokens.accessToken, response.tokens.refreshToken);
                result = true;
            }
        }
        if (!result) {
            this.removeAuthInfo();
        }
        return result;
    }
}