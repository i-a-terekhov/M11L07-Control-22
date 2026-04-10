import {LocalStorageUtils} from "../utils/local-storage-utils";
import {HttpUtils} from "../utils/http-utils";
import {ResultOfHttpRequest} from "../types/response-of-http-request";

export class AuthenticationService {
    public static async checkAuthorization(): Promise<boolean> {
        const result: ResultOfHttpRequest = await HttpUtils.request('/balance', 'GET', true, null)

        if (!result || result.error) {
            console.error('Не удалось провести аутентификацию')
            if (result.response && ('message' in result.response)) {
                console.error(result.response.message);
            }
            LocalStorageUtils.removeAuthInfo();
            return false
        }
        return true
    }
}