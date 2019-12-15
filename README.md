# special-disco

#### Features

- Sign up to the system (username, password)
- Logs in an existing user with a password
- Get the currently logged in user information
- Update the current users password
- List username & number of likes of a user
- Like a user
- Un-Like a user
- List users in a most liked to least liked


#### Installation

Install via [npm](http://npmjs.org).

    npm i

#### Start the server

    npm run start:dev

#### Testing

1) Using Postman(https://www.getpostman.com) and import postman collection "postman", stored in this repository

2) Using script located in test/apiTest.js 

 - Run all tests
        
        npm test
  
 - Test most liked
      
        ./node_modules/mocha/bin/mocha test/apiTest.js --grep="GET /api/v1/most-liked" --timeout 10000
 
 - Test user login, password change, user logaout and access authorized route
        
        ./node_modules/mocha/bin/mocha test/apiTest.js --grep="GET /api/v1/login-change-logout" --timeout 10000
 
 - Test user signup
 
        ./node_modules/mocha/bin/mocha test/apiTest.js --grep="POST /api/v1/signup" --timeout 10000
 
 - Test user login
 
        ./node_modules/mocha/bin/mocha test/apiTest.js --grep="POST /api/v1/login" --timeout 10000

- Test get user's likes

        ./node_modules/mocha/bin/mocha test/apiTest.js --grep="GET /api/v1/user/5df39ce46849412326d01a41" --timeout 10000
        
- Test logun => unlike user => like user => like user (error testing)

        ./node_modules/mocha/bin/mocha test/apiTest.js --grep="GET /api/v1/like-unlike-user" --timeout 10000
       
 
        
        
 
