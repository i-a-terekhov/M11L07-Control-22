import {LocalStorageUtils} from "../../utils/local-storage-utils";
import {AuthenticationService} from "../../services/authentication-service";

export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (!LocalStorageUtils.getAuthInfo(LocalStorageUtils.accessTokenKey) || !LocalStorageUtils.getAuthInfo(LocalStorageUtils.refreshTokenKey)) {
            return this.openNewRoute('/login');
        }

        this.logout().then();
    }

    async logout() {
        await AuthenticationService.logOutRequest({
            refreshToken: LocalStorageUtils.getAuthInfo(LocalStorageUtils.refreshTokenKey),
        });
        LocalStorageUtils.removeAuthInfo();

        this.openNewRoute();
    }
}