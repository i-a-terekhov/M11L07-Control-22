import {HttpUtils} from "../utils/http-utils";
import {ResponseOfAuthResult, ResultOfHttpRequest} from "../types/response-of-http-request";

export class AuthenticationService {
    public static async loginRequest(data: Object): Promise<false | ResponseOfAuthResult> {
        const result: ResultOfHttpRequest = await HttpUtils.request('/login', 'POST', false, data);
        if (result.error ||
            !result.response || !('tokens' in result.response) || !('user' in result.response) ||
            (
                'user' in result.response && (!result.response.user.id || !result.response.user.name || !result.response.user.lastName) ||
                'tokens' in result.response && (!result.response.tokens.accessToken || !result.response.tokens.refreshToken)
            )
        ) {
            return false;
        }
        return result.response as ResponseOfAuthResult;
    }

    public static async singUpRequest(data: Object): Promise<false | ResponseOfAuthResult> {
        const result: ResultOfHttpRequest = await HttpUtils.request('/signup', 'POST', false, data);

        if (
            result.error ||
            !result.response || !('user' in result.response) ||
            (
                !('email' in result.response.user) ||
                !('id' in result.response.user) ||
                !('lastName' in result.response.user) ||
                !('name' in result.response.user)
            )
        ) {
            return false;
        }
        return result.response;
    }

    public static async refreshTokenRequest(data: Object): Promise<false | ResponseOfAuthResult> {
        const result: ResultOfHttpRequest = await HttpUtils.request('/refresh', 'POST', true, data);
        if (result.error || !result.response || !('tokens' in result.response) ||
            !result.response.tokens.accessToken || !result.response.tokens.refreshToken) {
            return false;
        }
        return result.response;
    }

    public static async logOutRequest(data: Object): Promise<void> {
        const result: ResultOfHttpRequest = await HttpUtils.request('/logout', 'POST', false, data);
    }
}