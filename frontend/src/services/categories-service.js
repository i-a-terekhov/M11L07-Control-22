import {HttpUtils} from "../utils/http-utils";

export class CategoriesService {
    static async getAllExpenseCategories() {
        let result = await HttpUtils.request('/categories/expense', "GET", true, null);
        if (result.error || !result.response) {
            return false;
        }
        return result.response
    }

    static async getAllIncomeCategories() {
        let result = await HttpUtils.request('/categories/income', "GET", true, null);
        if (result.error || !result.response) {
            return false;
        }
        return result.response
    }

    static async deleteCategory(typeOfCategory, id) {
        let result = await HttpUtils.request(`/categories/${typeOfCategory}/${id}`, "DELETE", true, null);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return true
    }

    static async getCategory(typeOfCategory, id) {
        let result = await HttpUtils.request(`/categories/${typeOfCategory}/${id}`, "GET", true, null);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return result.response
    }

    static async updateCategory(typeOfCategory, id, body) {
        let result = await HttpUtils.request(`/categories/${typeOfCategory}/${id}`, "PUT", true, body);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return result.response
    }

    static async createCategory(typeOfCategory, body) {
        let result = await HttpUtils.request(`/categories/${typeOfCategory}`, "POST", true, body);
        if (result.error) {
            console.error(result.message)
            return false;
        }
        return result.response
    }
}