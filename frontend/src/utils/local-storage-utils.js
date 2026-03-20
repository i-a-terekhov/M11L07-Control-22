import {AuthenticationService} from "../services/authentication-service";
import {BalanceService} from "../services/balance-service";
import {isElement} from "bootstrap/js/src/util";

export class LocalStorageUtils {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoKey = 'userInfo';
    static choosenButtonId = 'filterChoosenButtonId'
    static filterDateFromKey = 'filterDateFrom';
    static filterDateUntilKey = 'filterDateUntil';

    static setAuthInfo(accessToken, refreshToken, userInfo = null) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if (userInfo) {
            localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
        }
    }

    static setFilterSettings(choosenButtonId, dateFrom, dateUntil) {
        let currentUserInfo = this.getAuthInfo(this.userInfoKey);
        let currentUserInfoObj = JSON.parse(currentUserInfo);

        currentUserInfoObj[this.choosenButtonId] = choosenButtonId;
        currentUserInfoObj[this.filterDateFromKey] = dateFrom;
        currentUserInfoObj[this.filterDateUntilKey] = dateUntil;

        localStorage.setItem(this.userInfoKey, JSON.stringify(currentUserInfoObj));
    }

    static getFilterDate() {
        let currentUserInfo = this.getAuthInfo(this.userInfoKey);
        let currentUserInfoObj = JSON.parse(currentUserInfo);
        let choosenButtonId = null, dateFrom = null, dateUntil = null;

        if (currentUserInfoObj[this.choosenButtonId]) {
            choosenButtonId = currentUserInfoObj[this.choosenButtonId];
        }
        if (currentUserInfoObj[this.filterDateFromKey]) {
            dateFrom = currentUserInfoObj[this.filterDateFromKey];
        }
        if (currentUserInfoObj[this.filterDateUntilKey]) {
            dateUntil = currentUserInfoObj[this.filterDateUntilKey];
        }
        return [choosenButtonId, dateFrom, dateUntil];
    }

    static async updateBalance() {
        const response = await BalanceService.balanceRequest();
        if (response) {
            if (this.getAuthInfo(this.userInfoKey)) {
                let userInfo = JSON.parse(this.getAuthInfo(this.userInfoKey));
                userInfo.balance = response.balance;
                localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
            }
        } else {
            console.error('Не удалось получить баланс');
        }
    }

    static removeAuthInfo() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoKey);
    }

    static getAuthInfo(key = null) {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            let allKeys = {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoKey]: localStorage.getItem(this.userInfoKey),
            }
            return allKeys
        }
    }

    static async updateRefreshToken() {
        let result = false;
        const refreshToken = this.getAuthInfo(this.refreshTokenKey);
        if (refreshToken) {
            const response = await AuthenticationService.refreshTokenRequest({
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