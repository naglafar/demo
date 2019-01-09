Add
- Login API
- Describe improvements to the API, based on more detailed business requirements: 
    - POST customers/customer123/meters/meter1/readings
    - GET customers/customer123/meters/meter1/readings
- Try to consume AWS products
- https://medium.freecodecamp.org/express-js-and-aws-lambda-a-serverless-love-story-7c77ba0eaa35


Key Areas
 - Error Middleware to inspect all errors thrown all the way up and return sensible http status codes based on the error
 - Seperation of domain logic from controller to allow easy testing of functional code
 - JWT auth on routes to provide context for API operations (stamping of reading records)
 - Handling of erroneous 

Getting Started:
- Run `npm install` in the API folder
- Ensure you have the AWS CLI installed `https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html`
- Run `docker run -p 8000:8000 amazon/dynamodb-local`
