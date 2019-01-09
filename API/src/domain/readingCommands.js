"use strict";

let moment = require("moment");
let errors = require("../shared/errors.js");
let crypto = require("crypto");

let repo = require("../storage/readingRepo.js");

module.exports = {
    
    /**
     * Adds a reading for a customer's meter
     * @param {Object} context - context data identifying the caller
     * @param {Object} reading - the reading data payload
     */
    async addReadingAsync(context, reading){

        // create a hash from the data to uniquely identify this data
        let readingDate = moment(reading.readDate);
        let hasher = crypto.createHash("md5");
        
        hasher.update(`${reading.customerId}|${reading.serialNumber}|${readingDate.unix()}`);
        let readingId = hasher.digest("base64");
        
        reading.id = readingId;
        reading.customerId = context.customerId;
        reading.readDate = readingDate.toISOString();
        reading.createdBy = context.sub;
        reading.createdOn = moment().toISOString();

        return await repo.addReadingAsync(reading);
    },

    /**
     * Retrieves a reading
     * @param {Object} context - context data identifying the caller
     * @param {*} id - the id of the reading to retrieve
     */
    async getReadingAsync(context, id){
        
        // retrieve and validate that the reading belongs to the caller's customerId
        let result = await repo.getReadingAsync(id);
        if (result.customerId !== context.customerId){
            throw new errors.NotAuthorisedError();
        }

        return result;
    },

    /**
     * Retrieves readings between two dates
     * @param {Object} context - context data identifying the caller
     * @param {String?} from - ISO date string to query from
     * @param {String?} to -  ISO date string to query to
     */
    async getReadingsAsync(context, from, to){
        return await repo.queryReadingsAsync(context.customerId, from, to);
    }

}