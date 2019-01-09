"use strict";

let commands = require("../domain/readingCommands.js");

function mapResult(result){
    // Remove any internal fields here
    return result;
}

/**
 * https://medium.com/tensult/async-await-on-aws-lambda-function-for-nodejs-2783febbccd9
 */

module.exports = {

    async create(event, context){
        
        let data = JSON.parse(event.body);
        let context = req.context;

        let result = await commands.addReadingAsync(context, data);
        return mapResult(result);
    },

    async get(event, context){
        //let result = commands.getReadingAsync(req.context, req.params.readingId);
        let result = {};
        return mapResult(result);
    },

    async list(event, context){
        //let result = commands.getReadingsAsync(req.context, event.query.from, event.query.to);
        let result = [];
        console.log(event.query);
        console.log(context);
        return result.map(mapResult);
    }

}