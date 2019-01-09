"use strict";

let rewire = require("rewire");
let moment = require("moment");

describe("readingCommands tests / ", function(){

    let target;
    let mockRepo;
    let mockContext;
    let mockMoment;

    beforeEach(() => {
        mockRepo = {};
        mockContext = {
            sub: "myTestUser",
            customerId: "customer123"
        }
        mockMoment = moment;

        // Rewire is great for swapping out module level variables;
        target = rewire("../../src/domain/readingCommands.js");
        target.__set__("moment", mockMoment);
        target.__set__("repo", mockRepo);
    });

    describe("addReadingAsync tests / ", function(){

        let defaultReading;
        beforeEach(() => {
            defaultReading = {
                "serialNumber": "serialNumber1",
                "mpxn": "14582749",
                "read": [
                    {"type": "ANYTIME", "registerId": "387373", "value": "2729"},
                    {"type": "NIGHT", "registerId": "387373", "value": "2892"}
                ],
                "readDate": "2019-01-08T18:00:00+00:00"
            };
        })

        it("should handle differing readDate formats and save in ISO format", async (done) => {
            
            let savedReadDates = [];
            mockRepo.addReadingAsync = async (reading) => savedReadDates.push(reading.readDate);

            defaultReading.readDate = "2019-01-08T18:00:00+00:00";
            await target.addReadingAsync(mockContext, defaultReading);

            // modify the readDate to be the same date, but in a UTC
            defaultReading.readDate = "2019-01-08T18:00:00.000Z";
            await target.addReadingAsync(mockContext, defaultReading);

            // Validate that the same Id was set each time
            expect(savedReadDates.length).toEqual(2);
            expect(savedReadDates[0]).toEqual("2019-01-08T18:00:00.000Z");
            expect(savedReadDates[1]).toEqual("2019-01-08T18:00:00.000Z");
            done();
        });

        it("should generate a unique hash and set the id", async (done) => {
            
            let savedIds = [];
            mockRepo.addReadingAsync = async (reading) => savedIds.push(reading.id);

            defaultReading.customerId = "customer456";
            await target.addReadingAsync(mockContext, defaultReading);

            defaultReading.serialNumber = "serialNumber2";
            await target.addReadingAsync(mockContext, defaultReading);

            defaultReading.readDate = "2019-01-09T18:00:00+00:00"; // Day later
            await target.addReadingAsync(mockContext, defaultReading);

            // Validate that each id is different
            expect(savedIds.length).toEqual(3);
            expect(savedIds[0]).not.toEqual(savedIds[1]);
            expect(savedIds[0]).not.toEqual(savedIds[2]);
            expect(savedIds[1]).not.toEqual(savedIds[2]);
            done();
        }); 

        it("should add the reading to the repo", async (done) => {
            
            mockMoment = moment("2019-01-08T19:00:00.000Z");

            mockRepo.addReadingAsync = async (reading) => {
                expect(reading.id).toBeDefined();
                expect(reading.customerId).toEqual(defaultReading.customerId);
                expect(reading.serialNumber).toEqual(defaultReading.serialNumber);
                expect(reading.mpxn).toEqual(defaultReading.mpxn);
                expect(reading.read).toEqual(defaultReading.read);
                expect(reading.readDate).toEqual("2019-01-08T18:00:00.000Z");
                expect(reading.createdOn).toEqual("2019-01-08T19:00:00.000Z");
                expect(reading.createdBy).toEqual("myTestUser");
            };

            await target.addReadingAsync(mockContext, defaultReading);
        });

    });

    describe("getReadingAsync tests / ", function(){
    
        it("should retrieve a reading from the repo based on it's id when the context.customerId matches", async (done) => {
            
            done();
        });

        it("should raise a NotAuthorisedError when retrieving a reading that does not belong to the customerId in context", async (done) => {
            
            done();
        }); 
    
    });
});