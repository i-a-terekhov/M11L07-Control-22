import {HttpUtils} from "../utils/http-utils";
import {ResponseOfAuthResult, ResponseOfBalanceResult, ResultOfHttpRequest} from "../types/response-of-http-request";

export class BalanceService {
    public static async balanceRequest(): Promise<ResponseOfBalanceResult | false> {
        let result: ResultOfHttpRequest = await HttpUtils.request('/balance', "GET", true, null);
        if (result.error || !result.response || !('balance' in result.response)) {
            return false;
        }
        return result.response as ResponseOfBalanceResult
    }
}