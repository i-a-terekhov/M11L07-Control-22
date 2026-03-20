import {HttpUtils} from "../utils/http-utils";

export class BalanceService {
    static async balanceRequest() {
        let result = await HttpUtils.request('/balance', "GET", true, null);
        if (result.error || !result.response || !('balance' in result.response)) {
            return false;
        }
        return result.response
    }
}