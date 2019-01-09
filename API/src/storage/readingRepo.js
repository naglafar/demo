
'use strict';

// @ts-ignore
let Promise = require("bluebird");
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
    options = {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    };
}

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = {

    async addReadingAsync(reading) {

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: reading,
        };

        // Wrap the callbacks in a Promise
        return new Promise((resolve, reject) => {

            client.put(params, (error) => {

                if (!error) {
                    return resolve();
                }

                // Check for a duplicate key error, to transform the error

                reject(error);
            });

        });

    },

    async getReadingAsync(customerId, id) {

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                id: id,
                customerId: customerId
            },
        };


        // Wrap the callbacks in a Promise
        return new Promise((resolve, reject) => {

            client.get(params, (error, result) => {

                if (!error) {
                    return resolve(result.Item);
                }

                // Check for a item not found error, to transform the error

                reject(error);
            });

        });

    },

    async queryReadingsAsync(customerId, from, to) {
        
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
          };
        
          // Wrap the callbacks in a Promise
        return new Promise((resolve, reject) => {

            client.scan(params, (error, result) => {

                if (!error) {
                    return resolve(result.Items);
                }

                reject(error);
            });

        });

    }

}