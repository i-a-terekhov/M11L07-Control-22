import config from "../config/config";
import {LocalStorageUtils} from "./local-storage-utils";
import {FetchMethod, ResultOfHttpRequest} from "../types/response-of-http-request";


export class HttpUtils {
    protected static tokenName = 'x-auth-token';

    public static async request(url: string, method: FetchMethod = 'GET', useAuth: boolean = true, body: (null | Object) = null): Promise<ResultOfHttpRequest> {
        const result: ResultOfHttpRequest = {
            error: false,
            response: null
        };

        const params: any = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };
        let token: string | null = null;
        if (useAuth) {
            token = LocalStorageUtils.getAuthInfo(LocalStorageUtils.accessTokenKey) as (string | null);
            if (token) {
                params.headers[this.tokenName] = token;
            }
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response: Response | null = null;
        try {
            response = await fetch(config.api + url, params)
            result.response = await response.json();
        } catch (e) {
            result.error = true;
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true;
            if (useAuth && response.status === 401) {
                if (token) {
                    const updateTokenResult: boolean = await LocalStorageUtils.updateRefreshToken();
                    if (updateTokenResult) {
                        return this.request(url, method, useAuth, body);
                    }
                }
            }
        }
        return result;
    }
}