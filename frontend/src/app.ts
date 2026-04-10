import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";

import "./styles/main.scss";
import {Router} from "./router";

class App {
    constructor() {
        new Router();
    }
}

(new App());