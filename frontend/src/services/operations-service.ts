import {HttpUtils} from "../utils/http-utils";
import {ResponseOfOperationResult, ResultOfHttpRequest} from "../types/response-of-http-request";

export class OperationsService {
    public static async getOneOperation(id: string): Promise<ResponseOfOperationResult | false> {
        let result: ResultOfHttpRequest = await HttpUtils.request('/operations/' + id, "GET", true, null);
        if (
            result.error || !result.response ||
            !('amount' in result.response) || !('comment' in result.response) ||
            !('date' in result.response) || !('id' in result.response) ||
            !('type' in result.response)
        ) {
            return false;
        }
        if (!result.response.category) {
            result.response.category = ''
        }
        return result.response
    }

    public static async updateOperation(id: string, body: Object): Promise<ResponseOfOperationResult> {
        let result: ResultOfHttpRequest = await HttpUtils.request('/operations/' + id, "PUT", true, body);
        return result.response as ResponseOfOperationResult;
    }

    public static async createNewOperation(body: Object): Promise<ResponseOfOperationResult> {
        let result: ResultOfHttpRequest = await HttpUtils.request('/operations', "POST", true, body);
        return result.response as ResponseOfOperationResult;
    }
}
