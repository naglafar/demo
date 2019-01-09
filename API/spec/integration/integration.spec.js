// @ts-nocheck
"use strict";

let Promise = require("bluebird");
let request = Promise.promisifyAll(require("request"));
let moment = require("moment");
let port;

/**
 * Use this function to generate different 
 */
function createNewJwt(){
    let jwt = require('jsonwebtoken');
    let timestamp = (new Date()).getTime();
    let payload = {
        "sub": `user.${timestamp}`,
        "customerId": `customer${timestamp}`,
    };
    return jwt.sign(payload, process.env.SHARED_SECRET);
}

describe("integration tests / ", function(){

    //Explicitly set the process port - unless already defined somewhere
    process.env.PORT = process.env.PORT || "3000";
    process.env.AWS_ACCESS_KEY_ID = "MyAccessKeyId";
    process.env.AWS_SECRET_ACCESS_KEY = "mySecretkey";
    process.env.DYNAMODB_IS_OFFLINE = "true";
    process.env.DYNAMODB_TABLE = "demoReadings";
    process.env.SHARED_SECRET = "shared-secret";

    let customer1Jwt = createNewJwt();
    let customer2Jwt = createNewJwt();

    // let customer1Jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGV4LnN0ZXZlbnMiLCJuYW1lIjoiQWxleCBTdGV2ZW5zIiwiaWF0IjoxNTE2MjM5MDIyLCJjdXN0b21lcklkIjoiY3VzdG9tZXIxMjMifQ.w1HaGMsth83_1aLNVMZwcQTIiEOK_BUeENYtDTc3qbM";
    // let customer2Jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiaWxseS50d2VsdmV0cmVlcyIsIm5hbWUiOiJCaWxseSBUd2VsdmV0cmVlcyIsImlhdCI6MTUxNjIzOTAyMiwiY3VzdG9tZXJJZCI6ImN1c3RvbWVyNDU2In0.kcEnZJrNehoHplRfckR2EM_8j4sZeQjCNDJN4OK-l44";

    port = process.env.PORT;
    let baseUrl = `http://localhost:${port}/api/v1/meter-read/`;

    describe("meter-read tests / ", function(){

        let app;
        beforeAll(() => {
            app = require("../../src/app.js");
        })
        
        it("should start the service", async (done) => {
            app.listen(port, () => {
                console.log('Service: The reading service was launched at http://localhost:' + port);
                done();
            });    
        }, 10000);
    
        it("should fail with a 401", async (done) => {
            
            // By not including a JWT we should see a failure
            let response = await request.getAsync({
                url: `${baseUrl}`,
                json : true
            });

            expect(response.statusCode).toBe(401);
            done();
        }); 

        it("should return an empty array for both tokens", async (done) => {
            
            //Check they are different!
            expect(customer1Jwt).not.toEqual(customer2Jwt);

            let response = await request.getAsync({
                url: `${baseUrl}`,
                auth: {
                    bearer: customer1Jwt
                },
                json : true
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(0);

            response = await request.getAsync({
                url: `${baseUrl}`,
                auth: {
                    bearer: customer2Jwt
                },
                json : true
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(0);
            done();
        });

        it("should add and retrieve a single reading", async (done) => {
            
            let reading = {
                "serialNumber": "27263927192",
                "mpxn": "14582749",
                "read": [
                    {"type": "ANYTIME", "registerId": "387373", "value": "2729"},
                    {"type": "NIGHT", "registerId": "387373", "value": "2892"}
                ],
                "readDate": "2019-01-09T20:00:00+00:00"
            }

            let response = await request.postAsync({
                url: `${baseUrl}`,
                auth: {
                    bearer: customer1Jwt
                },
                body: reading,
                json : true
            });

            expect(response.statusCode).toBe(200);

            let readingId = response.body.id;
            response = await request.getAsync({
                url: `${baseUrl}${readingId}`,
                auth: {
                    bearer: customer1Jwt
                },
                json : true
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toEqual(readingId);

            done();
        }); 

        it("should return a value for token1, but an empty array for token2", async (done) => {
            
            let response = await request.getAsync({
                url: `${baseUrl}`,
                auth: {
                    bearer: customer1Jwt
                },
                json : true
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(1);

            response = await request.getAsync({
                url: `${baseUrl}`,
                auth: {
                    bearer: customer2Jwt
                },
                json : true
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(0);
            done();
        });


    });

});