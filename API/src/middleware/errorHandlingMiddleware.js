"use strict";

module.exports = (err, req, res, next) => {

    if (!err){
        return next();
    }
    
    // Handle errors raised by the JWT framework
    if (err.name === "UnauthorizedError"){
        console.log("Caught an authentication error from the jwt middleware");
        return res.sendStatus(401);
    }

    if (err.name === "NotAuthorisedError"){
        return res.sendStatus(403);
    }

    if (err.name === "ValidationError"){
        return res.status(400).json({ failures : err.failures }).end(); // Not Found
    }

    // Handle ItemNotFoundError with a 404
    if (err.name === "ItemNotFoundError"){
        return res.sendStatus(404);
    }

    // Handle ItemAlreadyExistsError with a 409
    if (err.name === "ItemAlreadyExistsError"){
        return res.sendStatus(409);
    }

    return res.sendStatus(500);
}