const express = require("express");
const morgan = require("morgan");
require('dotenv').config()
class ApplicationServer {
    constructor() {
		//Express application object
		this.app = express();
		//Method that initialized the express framework.
		this.initExpress();
		//Method that initialized middleware modules
		this.initExpressMiddleWare();
		//Method that initialized the controllers where you defined the endpoints
		this.initControllers();
		//Method that run the express application.
		this.start();
	}

    initExpress() {
		this.app.set("port", process.env.APP_PORT);
	}

    initExpressMiddleWare() {
		this.app.use(morgan("dev"));
		this.app.use(express.json()) //For JSON requests
        this.app.use(express.urlencoded({extended: true}));
	}

    initControllers() {
        require("./controllers/dummyController.js")(this.app);
        require("./controllers/postsController.js")(this.app);
	}

    start() {
		let self = this;
		this.app.listen(this.app.get("port"), () => {
			console.log(`Server Listening for port: ${self.app.get("port")}`);
		});
	}
}

new ApplicationServer();