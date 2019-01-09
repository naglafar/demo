"use strict";

let commands = require("../domain/readingCommands.js");

module.exports = { 

    addReading(req, res, next){
        commands.addReadingAsync(req.context, req.body)
            .then((result) => {
                return res.json(result);
            })
            .catch(next);
    },

    getReading(req, res, next){
        commands.getReadingAsync(req.context, req.params.readingId)
            .then((result) => {
                return res.json(result);
            })
            .catch(next);
    },

    getAllReadings(req, res, next){
        commands.queryReadingsAsync(req.context, req.query.from, req.query.to)
            .then((result) => {
                return res.json(result);
            })
            .catch(next);
    }
}