import {LocalStorageUtils} from "../../utils/local-storage-utils";
import {AuthenticationService} from "../../services/authentication-service";

export class Logout {
    readonly openNewRoute: Function;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;

        if (!LocalStorageUtils.getAuthInfo(LocalStorageUtils.accessTokenKey) || !LocalStorageUtils.getAuthInfo(LocalStorageUtils.refreshTokenKey)) {
            return this.openNewRoute('/login');
        }

        this.logout().then();
    }

    private async logout(): Promise<void> {
        await AuthenticationService.logOutRequest({
            refreshToken: LocalStorageUtils.getAuthInfo(LocalStorageUtils.refreshTokenKey),
        });
        LocalStorageUtils.removeAuthInfo();

        this.openNewRoute();
    }
}