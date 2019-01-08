let port = process.env.API_PORT || 3000;

let app = require("./app.js");
app.listen(port, () => {
    console.log('Service: The reading service was launched at http://localhost:' + port);
});