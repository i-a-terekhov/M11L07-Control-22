import {LocalStorageUtils} from "../utils/local-storage-utils";
import {HttpUtils} from "../utils/http-utils";

export class AuthenticationService {
    static async checkAuthorization() {
        const result = await HttpUtils.request('/balance', 'GET', true, null)

        if (!result || result.error) {
            console.error('Не удалось провести аутентификацию')
            if (result.response && result.response.message) {
                console.error(result.response.message);
            }
            LocalStorageUtils.removeAuthInfo();
            return false
        }
        return true
    }
}