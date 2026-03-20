import {HttpUtils} from "../utils/http-utils";

export class OperationsService {
    static async getOneOperation(id) {
        let result = await HttpUtils.request('/operations/' + id, "GET", true, null);
        if (
            result.error || !result.response ||
            !result.response.amount ||
            !result.response.comment || !result.response.date ||
            !result.response.id || !result.response.type
        ) {
            return false;
        }
        if (!result.response.category) {
            result.response.category = ''
        }
        return result.response
    }

    static async updateOperation(id, body) {
        let result = await HttpUtils.request('/operations/' + id, "PUT", true, body);
        return result.response;
    }

    static async createNewOperation(body) {
        let result = await HttpUtils.request('/operations', "POST", true, body);
        return result.response;
    }
}
