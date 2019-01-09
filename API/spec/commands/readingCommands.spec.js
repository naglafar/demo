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

        it("should validate an invalid readDate", async (done) => {
            
            mockRepo.addReadingAsync = async () => fail("should not reach this point");

            defaultReading.readDate = "2019-14-08T18:00:00+00:00";

            try {
                await target.addReadingAsync(mockContext, defaultReading);
            } catch (err) {
                expect(err.name).toEqual("ValidationError");
                expect(err.failures.length).toEqual(1);
                expect(err.failures[0].parameter).toEqual("readDate");
                expect(err.failures[0].message).toEqual("Dates must be provided in a valid ISO format");
                done();
            }

        }); 

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
            mockRepo.addReadingAsync = async (reading) => {
                savedIds.push(reading.id)
                return reading;
            };

            await target.addReadingAsync(mockContext, defaultReading);

            defaultReading.serialNumber = "serialNumber2";
            await target.addReadingAsync(mockContext, defaultReading);

            defaultReading.readDate = "2019-01-09T18:00:00+00:00"; // Day later
            let result = await target.addReadingAsync(mockContext, defaultReading);

            // Validate that each id is different
            expect(savedIds.length).toEqual(3);
            expect(savedIds[0]).not.toEqual(savedIds[1]);
            expect(savedIds[0]).not.toEqual(savedIds[2]);
            expect(savedIds[1]).not.toEqual(savedIds[2]);
            expect(result).toBe(defaultReading);
            done();
        }); 

        it("should add the reading to the repo", async (done) => {
            
            // Determine a specific createdOn date by overriding moment
            target.__set__("moment", (date) => date ? moment(date) : moment("2019-01-08T19:00:00.000Z"));

            mockRepo.addReadingAsync = async (reading) => {
                expect(reading.id).toBeDefined();
                expect(reading.customerId).toEqual(defaultReading.customerId);
                expect(reading.serialNumber).toEqual(defaultReading.serialNumber);
                expect(reading.mpxn).toEqual(defaultReading.mpxn);
                expect(reading.read).toEqual(defaultReading.read);
                expect(reading.readDate).toEqual("2019-01-08T18:00:00.000Z");
                expect(reading.createdOn).toEqual("2019-01-08T19:00:00.000Z");
                expect(reading.createdBy).toEqual("myTestUser");
                done();
            };

            await target.addReadingAsync(mockContext, defaultReading);
        });

    });

    describe("getReadingAsync tests / ", function(){
    
        it("should retrieve a reading from the repo based on it's id when the context.customerId matches", async (done) => {
            
            let reading = {
                customerId: mockContext.customerId,
                id: "myReadingId"
            };

            mockRepo.getReadingAsync = async (id) => {
                expect(id).toEqual(reading.id);
                return reading;
            }

            let result = await target.getReadingAsync(mockContext, reading.id);
            expect(result).toBe(reading);
            done();
        });

        it("should raise a NotAuthorisedError when retrieving a reading that does not belong to the customerId in context", async (done) => {
            
            
            let reading = {
                customerId: "notTheSameAsInContext",
                id: "myReadingId"
            };

            mockRepo.getReadingAsync = async (id) => {
                expect(id).toEqual(reading.id);
                return reading;
            }

            try {
                await target.getReadingAsync(mockContext, reading.id);
            } catch (err) {
                expect(err.name).toEqual("NotAuthorisedError");
                done();
            }
        }); 
    
    });

    describe("queryReadingsAsync tests / ", function(){
    
        it("should handle invalid dates", async (done) => {
            
            let fromDate = "2019-14-08T18:00:00+00:00";
            let toDate = "2019-12-56T18:00:00+00:00";

            try {
                await target.queryReadingsAsync(mockContext, fromDate, toDate);
            } catch (err) {
                expect(err.name).toEqual("ValidationError");
                expect(err.failures.length).toEqual(2);
                expect(err.failures[0].parameter).toEqual("from");
                expect(err.failures[0].message).toEqual("Dates must be provided in a valid ISO format");
                expect(err.failures[1].parameter).toEqual("to");
                expect(err.failures[1].message).toEqual("Dates must be provided in a valid ISO format");
                done();
            }
            
        }); 

        it("should handle the to date being before the from date", async (done) => {
            
            let fromDate = "2019-01-01T00:00:00.000Z";
            let toDate = "2010-07-01T00:00:00.000Z";

            try {
                await target.queryReadingsAsync(mockContext, fromDate, toDate);
            } catch (err) {
                expect(err.name).toEqual("ValidationError");
                expect(err.failures.length).toEqual(1);
                expect(err.failures[0].parameter).toEqual("from");
                expect(err.failures[0].message).toEqual("The 'from' date, must come before the 'to' date");
                done();
            }
            
        }); 


        it("should return the values from the repo call", async (done) => {
            
            let readings = [];
            let fromDate = "2019-01-01T00:00:00.000Z";
            let toDate = "2019-07-01T00:00:00.000Z";

            mockRepo.queryReadingsAsync = async (customerId, from, to) => {
                expect(customerId).toEqual(mockContext.customerId);
                expect(from).toEqual(fromDate);
                expect(to).toEqual(toDate);
                return readings;
            }

            let result = await target.queryReadingsAsync(mockContext, fromDate, toDate);
            expect(result).toBe(readings);
            done();
        });
    
    });
});