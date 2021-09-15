class DummyController {
    constructor(app) {
        this.app = app;
        this.dummyGet();
        this.dummyGet2();
    }

    dummyGet() {
        this.app.get('/', function(req, res) {
            return res.send('Dummy get request')
        })
    }

    dummyGet2() {
        this.app.get('/foo', function(req, res) {
            return res.send('Dummy get request, foo')
        })
    }
}

module.exports = (app) => { return new DummyController(app);}