const express = require("express");
const morgan = require("morgan");
const mysql = require('mysql2');
require('dotenv').config()
class ApplicationServer {
    constructor() {
        // create the connection to database
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

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
        require("./constrollers/dummyController.js")(this.app, this.connection);
	}

    start() {
		let self = this;
		this.app.listen(this.app.get("port"), () => {
			console.log(`Server Listening for port: ${self.app.get("port")}`);
		});
	}
}

new ApplicationServer();