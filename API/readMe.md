# Demo Project for Ecotricity

I hope this is suitable for your review. If I missed the brief completely, or have misinterpreted anything - please get back in touch as I would welcome the opportunity to rectify. 😄

## Getting Started:
- Run `docker run -d --name=dynamodb-local -p 8200:8000 amazon/dynamodb-local` (use `docker rm -f dynamodb-local` to remove afterwards)
- Navigate to the API folder
- Run `npm install` in the API folder to install dependencies
- Set the process env variables required
```
export API_PORT="3000"
export AWS_ACCESS_KEY_ID="MyAccessKeyId"
export AWS_SECRET_ACCESS_KEY="mySecretkey"
export DYNAMODB_IS_OFFLINE="true"
export DYNAMODB_TABLE="demoReadings"
export SHARED_SECRET="shared-secret"
```
- Run `npm start` to start the service
- Optionally run `npm test` to execute the test suite

## Initial Notes

- I took the approach of using a customerId stored in the JWT used to call the API. This is more akin to usage in a production environment. However, there could be a use case where an engineer is adding readings on behalf of a customer using a mobile device. In this scenario, the customerId in the payload would not match, but could be controlled using permissions. However, the engineer's `context.sub` would stamp the record's `createdBy` still.
- Error Middleware to inspect all errors thrown all the way up and return sensible http status codes (400, 401, 403, 404) based on the error raised
- Seperation of domain logic from controller to allow easy testing of business logic code
- Handling of badly formatted dates (all dates are assumed to be in UTC, however the JWT could carry a timezone to allow date conversion in the domain logic)
- I've had a stab at using DynamoDB as the back end persistence layer. The code is very much taken from the AWS developer examples, but it's not pretty - however I wanted embrace AWS in some fashion for the demo. Typically, I would have abstracted a lot of the code behind a seperately built and tested abstraction for many reasons:
    - The AWS JS SDK code feels a little unwieldy, and wrapping it up would allow for a better developer experience consuming it.
    - Things like table creation and connection persistence would be abstracted away and not needed to be considered by the developer
    - Client connection could be monitored and reconnected on any transisent errors, allowing a sinble connection to be maintained for the lifetime of the service (or closed and re-established on demand).
    - Testability, easier to test once, not in EVERY repo that consumes it

## Benefits of a more RESTful API???
- I Considered a more REST compliant API, however I didn't want to stray too far from the brief to include `meter-read` in the route. This would allow for more general use of the API (allowing for other software to consume it at a more business level, controlled by permissions). Example:
    - POST /customers/:customerId/meters/:serialNumber/readings
    - GET /customers/:customerId/meters/:serialNumber/readings
    - GET /customers/:customerId/meters/:serialNumber/readings/:readingId
- This way would allow for middleware to be added to the route config, that would validate the customerId existed, same for the serialNumber, providing superior validation to each API.

## Example Usage

### Create a reading
```
curl -X POST \
  http://localhost:3000/api/v1/meter-read \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGV4LnN0ZXZlbnMiLCJuYW1lIjoiQWxleCBTdGV2ZW5zIiwiaWF0IjoxNTE2MjM5MDIyLCJjdXN0b21lcklkIjoiY3VzdG9tZXIxMjMifQ.w1HaGMsth83_1aLNVMZwcQTIiEOK_BUeENYtDTc3qbM' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: d605e9eb-d4e1-4087-a446-f5a0c067c7f5' \
  -H 'cache-control: no-cache' \
  -d '{
    "serialNumber": "27263927192",
    "mpxn": "14582749",
    "read": [
        {"type": "ANYTIME", "registerId": "387373", "value": "2729"},
        {"type": "NIGHT", "registerId": "387373", "value": "2892"}
    ],
    "readDate": "2019-01-09T20:00:00+00:00"
}'
```
### Retrieve a specific reading
You may need to tweak the value in the url below to match the `id` returned in the call above
```
curl -X GET \
  http://localhost:3000/api/v1/meter-read/YXwpNPR8X3Y7EaHTXp0QDA== \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGV4LnN0ZXZlbnMiLCJuYW1lIjoiQWxleCBTdGV2ZW5zIiwiaWF0IjoxNTE2MjM5MDIyLCJjdXN0b21lcklkIjoiY3VzdG9tZXIxMjMifQ.w1HaGMsth83_1aLNVMZwcQTIiEOK_BUeENYtDTc3qbM' \
  -H 'Postman-Token: 354b4368-b506-4189-b403-1e1a462edb5a' \
  -H 'cache-control: no-cache'
```
### Retrieve all readings for the customer in context between two dates
```
curl -X GET \
  'http://localhost:3000/api/v1/meter-read?from=2019-01-01T10:00:00Z&to=2019-01-10T00:00:00Z' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGV4LnN0ZXZlbnMiLCJuYW1lIjoiQWxleCBTdGV2ZW5zIiwiaWF0IjoxNTE2MjM5MDIyLCJjdXN0b21lcklkIjoiY3VzdG9tZXIxMjMifQ.w1HaGMsth83_1aLNVMZwcQTIiEOK_BUeENYtDTc3qbM' \
  -H 'cache-control: no-cache'
```
## Other Areas to Explore & Observations
 I thought I would list what I would have done had I had a lot more time and more AWS experience:
 - I would have attempted to build a "serverless" solution with an AWS Lambda function for the API. I started to do this (you can see my progress on the `serverless-implementation` branch) however, I was hitting issues with running code locally, possibly some misconfigured local setup was causing issues. Primarily though, the learning curve was to high to be able to show what I wanted to (error handling, JWT auth).
 - Add API validation using OpenAPI or Swagger, to ensure the type safety of data and parameters being passed into the API.
 - I would probably consider using something like [AJV](https://www.npmjs.com/package/ajv#filtering-data) to format the reading json being returned by each API - as DynamoDB seems to mutate it slightly when persisting and querying. It is much better to present a consistent payload to consumers.

 ### Valid JWTs:
- customer123: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGV4LnN0ZXZlbnMiLCJuYW1lIjoiQWxleCBTdGV2ZW5zIiwiaWF0IjoxNTE2MjM5MDIyLCJjdXN0b21lcklkIjoiY3VzdG9tZXIxMjMifQ.w1HaGMsth83_1aLNVMZwcQTIiEOK_BUeENYtDTc3qbM`
- customer456: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiaWxseS50d2VsdmV0cmVlcyIsIm5hbWUiOiJCaWxseSBUd2VsdmV0cmVlcyIsImlhdCI6MTUxNjIzOTAyMiwiY3VzdG9tZXJJZCI6ImN1c3RvbWVyNDU2In0.kcEnZJrNehoHplRfckR2EM_8j4sZeQjCNDJN4OK-l44`