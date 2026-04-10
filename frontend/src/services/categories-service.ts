import {HttpUtils} from "../utils/http-utils";
import {
    ResponseOfAllCategoriesResult,
    ResponseOfCategoryResult,
    ResultOfHttpRequest
} from "../types/response-of-http-request";

export class CategoriesService {
    public static async getAllExpenseCategories(): Promise<ResponseOfAllCategoriesResult | false> {
        let result: ResultOfHttpRequest = await HttpUtils.request('/categories/expense', "GET", true, null);
        if (result.error || !result.response) {
            return false;
        }
        return result.response as ResponseOfAllCategoriesResult
    }

    public static async getAllIncomeCategories(): Promise<ResponseOfAllCategoriesResult | false> {
        let result: ResultOfHttpRequest = await HttpUtils.request('/categories/income', "GET", true, null);
        if (result.error || !result.response) {
            return false;
        }
        return result.response as ResponseOfAllCategoriesResult
    }

    public static async deleteCategory(typeOfCategory: string, id: string): Promise<boolean> {
        let result: ResultOfHttpRequest = await HttpUtils.request(`/categories/${typeOfCategory}/${id}`, "DELETE", true, null);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return true
    }

    public static async getCategory(typeOfCategory: string, id: string): Promise<ResponseOfCategoryResult | false> {
        let result: ResultOfHttpRequest = await HttpUtils.request(`/categories/${typeOfCategory}/${id}`, "GET", true, null);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return result.response as ResponseOfCategoryResult
    }

    public static async updateCategory(typeOfCategory: string, id: string, body: Object): Promise<ResponseOfCategoryResult | false> {
        let result: ResultOfHttpRequest = await HttpUtils.request(`/categories/${typeOfCategory}/${id}`, "PUT", true, body);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return result.response as ResponseOfCategoryResult
    }

    public static async createCategory(typeOfCategory: string, body: Object): Promise<ResponseOfCategoryResult | false> {
        let result: ResultOfHttpRequest = await HttpUtils.request(`/categories/${typeOfCategory}`, "POST", true, body);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return result.response as ResponseOfCategoryResult
    }
}