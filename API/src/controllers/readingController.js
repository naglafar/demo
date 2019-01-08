"use strict";

let commands = require("../domain/readingCommands.js");

function mapResult(result){
    // Remove any internal fields here
    return result;
}

module.exports = { 

    addReading(req, res, next){
        commands.addReadingAsync(req.context, req.body)
            .then((result) => {
                return res.json(mapResult(result));
            }).catch(next);
    },

    getReading(req, res, next){
        commands.getReadingAsync(req.context, req.params.readingId)
            .then((result) => {
                return res.json(mapResult(result));
            }).catch(next);
    },

    getAllReadings(req, res, next){
        commands.getReadingsAsync(req.context, req.params.from, req.params.to)
            .then((result) => {
                return res.json(result.map(mapResult));
            }).catch(next);        
    }
}