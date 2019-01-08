"use strict";

let rewire = require("rewire");

describe("readingCommands tests / ", function(){

    let target;
    let mockRepo;
    let mockContext;

    beforeEach(() => {
        mockRepo = {};
        mockContext = {
            sub: "myTestUser",
            customerId: "customer123"
        }

        // Rewire is great for swapping out module level variables;
        target = rewire("../../src/domain/readingCommands.js");
        target.__set__("repo", mockRepo);
    });

    describe("addReadingAsync tests / ", function(){

        it("should handle differing date formats and save an ISO format", async (done) => {
            
            done();
        });

        it("should generate a unique hash and set the id", async (done) => {
            
            done();
        }); 

        it("should add the reading to the repo", async (done) => {
            
            done();
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