"user strict";

let express = require("express");
let app = express();

let jwt = require("express-jwt");
app.use(jwt({ secret: 'shared-secret', requestProperty: 'context'}));

let readingRoute = require("./routes/readingRoute.js");
app.use("/api/v1", readingRoute);

let errorHandler = require("./middleware/errorHandlingMiddleware.js");
app.use(errorHandler);

module.exports = app;