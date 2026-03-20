import {HttpUtils} from "../utils/http-utils";

export class AuthenticationService {
    static async loginRequest(data) {
        const result = await HttpUtils.request('/login', 'POST', false, data);
        if (result.error ||
            !result.response || !result.response.tokens || !result.response.user ||
            (
                result.response.user && (!result.response.user.id || !result.response.user.name || !result.response.user.lastName) ||
                result.response.tokens && (!result.response.tokens.accessToken || !result.response.tokens.refreshToken)
            )
        ) {
            return false;
        }
        return result.response;
    }

    static async singUpRequest(data) {
        const result = await HttpUtils.request('/signup', 'POST', false, data);

        if (
            result.error ||
            !result.response ||
            (
                !result.response.user.email ||
                !result.response.user.id ||
                !result.response.user.lastName ||
                !result.response.user.name
            )
        ) {
            return false;
        }
        return result.response;
    }

    static async refreshTokenRequest(data) {
        const result = await HttpUtils.request('/refresh', 'POST', true, data);
        if (result.error || !result.response || !result.response.tokens ||
            !result.response.tokens.accessToken || !result.response.tokens.refreshToken) {
            return false;
        }
        return result.response;
    }

    static async logOutRequest(data) {
        const result = await HttpUtils.request('/logout', 'POST', false, data);
    }
}