
'use strict';

// @ts-ignore
let Promise = require("bluebird");
let errors = require("../shared/errors.js");

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};

// connect to local DB if running offline
if (process.env.DYNAMODB_IS_OFFLINE === "true") {
    options = {
        region: 'localhost',
        endpoint: 'http://192.168.99.100:8200',
    };
}

let _client;

async function initAsync() {

    if (_client) {
        return _client;
    }

    let service = new AWS.DynamoDB(options);
    await ensureTableExistsAsync(service);

    let client = new AWS.DynamoDB.DocumentClient(options);
    _client = client;

    return _client;
}

async function ensureTableExistsAsync(service) {

    let tableDef = {
        TableName: process.env.DYNAMODB_TABLE,
        AttributeDefinitions: [
            { 
                AttributeName: "id", 
                AttributeType: "S" 
            }
        ],
        KeySchema: [
            {
                AttributeName: 'id',
                KeyType: 'HASH'
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    };

    return new Promise((resolve, reject) => {

        // Call DynamoDB to create the table
        service.createTable(tableDef, function (err, data) {
            if (err) {
                // Handle the table already existing
                if (err.code === "ResourceInUseException"){
                    resolve();
                } else {
                    reject(err);
                }
            } else {
                resolve();
            }
        });

    });

}

module.exports = {

    async addReadingAsync(reading) {

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: reading,
            ConditionExpression: "attribute_not_exists(id)"
        };

        let client = await initAsync();

        // Wrap the callbacks in a Promise
        return new Promise((resolve, reject) => {

            client.put(params, (error) => {

                if (!error) {
                    return resolve(reading);
                }

                if (error.code === "ConditionalCheckFailedException"){
                    return reject(new errors.ItemAlreadyExistsError(reading.id, "reading"));
                }

                // Check for a duplicate key error, to transform the error
                return reject(error);
            });

        });

    },

    async getReadingAsync(id) {

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            ExpressionAttributeValues: {
                ":id": id,
            },
            KeyConditionExpression: "id = :id"
        };

        let client = await initAsync();

        // Wrap the callbacks in a Promise
        return new Promise((resolve, reject) => {

            client.query(params, (error, result) => {

                if (error) {
                    return reject(error);
                }
                
                if (!result.Items.length){
                    reject(new errors.ItemNotFoundError(id, "reading"));
                }
                
                return resolve(result.Items[0]);

            });

        });

    },

    async queryReadingsAsync(customerId, from, to) {

        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: "customerId = :customerId AND readDate BETWEEN :from AND :to",
            ExpressionAttributeValues: {
                ":customerId": customerId,
                ':from': from,
                ':to': to
            }
        };

        let client = await initAsync();

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