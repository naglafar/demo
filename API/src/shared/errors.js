"use strict";

/// Specific error used to signify that an item already exists with the a id
function ItemAlreadyExistsError(item, itemType) {
    Error.captureStackTrace(this);
    this.name = "ItemAlreadyExistsError";
    this.item = item;
    this.itemType = itemType;
    this.message = `The ${itemType ? itemType : "item"} already exists`;
 }
 ItemAlreadyExistsError.prototype = Object.create(Error.prototype);
 module.exports.ItemAlreadyExistsError = ItemAlreadyExistsError;
 
 /// Specific error used to signify that an item was not found
 function ItemNotFoundError(item, itemType) {
    Error.captureStackTrace(this);
    this.name = "ItemNotFoundError";
    this.item = item;
    this.itemType = itemType;
    this.message = `The ${itemType ? itemType : "item"} was not found`;
 }
 ItemNotFoundError.prototype = Object.create(Error.prototype);
 module.exports.ItemNotFoundError = ItemNotFoundError;

 /// Specific error used to return input validation issues
 function ValidationError(failures) {
   Error.captureStackTrace(this);
   this.failures = Array.isArray(failures) ? failures: [failures]; // allow for single failures an multiple to be passed in
   this.name = "ValidationError";
   this.message = `There was a validation issue, check the failures`;
}
ValidationError.prototype = Object.create(Error.prototype);
module.exports.ValidationError = ValidationError;

/// Specific error used to notify of Authorisation errors
function NotAuthorisedError() {
   Error.captureStackTrace(this);
   this.name = "NotAuthorisedError";
   this.message = `There was a validation issue, check the failures`;
}
NotAuthorisedError.prototype = Object.create(Error.prototype);
module.exports.NotAuthorisedError = NotAuthorisedError;