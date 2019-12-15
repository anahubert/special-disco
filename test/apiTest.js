//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const server = require('./../server');

chai.use(chaiHttp);

/*
Test unprotected routes
*/

// Get most liked users
describe('GET /api/v1/most-liked', () => {
    it('respond with most-liked json list results', function(done) {
        chai.request(server)
            .get('/api/v1/most-liked')
            .set('Accept', 'application/json')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Object');
                res.body.results.should.be.eql(15);
                res.body.data.users[0].email.should.be.eq('test4@test.com');
                res.body.data.users[0].likes.should.be.eq(1);
                done();
            });
    });
});

// Get user's likes
describe('GET /api/v1/user/5df39ce46849412326d01a41', () => {
    it('respond with most-liked json list results', function(done) {
        chai.request(server)
            .get('/api/v1/user/5df39ce46849412326d01a41')
            .set('Accept', 'application/json')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Object');
                res.body.results.should.be.eql(1);
                done();
            });
    });
});

/*
Test user login
*/
describe('POST /api/v1/login', function() {
    it('respond with the token for user login', function(done) {
        chai.request(server)
            .post('/api/v1/login')
            .send({
                email: 'aleksandra.hubert3@gmail.com',
                password: '12345678'
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
                const token = jwt.sign(
                    { id: '5df3730f26b5ce1d5bc2f3c1' },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.TOKEN_EXPIRES
                    }
                );
                res.should.have.status(200);
                res.body.should.have.property('token');
                res.body.token.should.be.eql(token);
                done();
            });
    });
});

// /*
// Test for user signup
// */
describe('POST /api/v1/signup', function() {
    it('respond with the id and token for user signup', function(done) {
        chai.request(server)
            .post('/api/v1/signup')
            .send({
                email: 'aleksandra.hubert32@gmail.com',
                password: '123456789',
                name: 'ana'
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property('token');
                res.body.data.user.should.have.property('_id');
                done();
            });
    });
});

// /*
// Test protected routes
// */
describe('GET /api/v1/login-change-logout', function() {
    it('should login user and respond with user token', function(done) {
        chai.request(server)
            .post('/api/v1/login')
            .send({
                email: 'aleksandra.hubert32@gmail.com',
                password: '12345678'
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.have.cookie('jwt');
                //console.log(res.header['set-cookie'][0]);
                //cookie = res.headers['set-cookie'].pop().split(';')[0];
                cookie = res.header['set-cookie'][0];
                done();
            });
    });

    it('should set cookie and respond with user info', function(done) {
        chai.request(server)
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('data');
                res.body.data.should.have.property('user');
                res.body.data.user.email.should.be.eq(
                    'aleksandra.hubert32@gmail.com'
                );
                res.body.data.user.name.should.be.eq('ana');

                done();
            });
    });

    it("should update user's password and refresh token", function(done) {
        chai.request(server)
            .patch('/api/v1/me/update-password')
            .send({
                name: 'aleksandra',
                email: 'aleksandra.hubert32@gmail.com',
                password: '12345678',
                passwordCurrent: '12345678'
            })
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('data');
                res.body.data.should.have.property('user');
                res.body.data.user.email.should.be.eq(
                    'aleksandra.hubert32@gmail.com'
                );
                res.body.data.user.name.should.be.eq('ana');
                //console.log(res.header['set-cookie'][0]);
                cookie = res.header['set-cookie'][0];
                done();
            });
    });

    it('should set new cookie and respond with user info', function(done) {
        chai.request(server)
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('data');
                res.body.data.should.have.property('user');
                res.body.data.user.email.should.be.eq(
                    'aleksandra.hubert32@gmail.com'
                );
                res.body.data.user.name.should.be.eq('ana');
                //cookie = res.header['set-cookie'][0];
                console.log(res.header);
                done();
            });
    });

    it('should logout user', function(done) {
        chai.request(server)
            .post('/api/v1/logout')
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                res.should.have.status(200);
                cookie = res.header['set-cookie'][0];
                console.log(res.header);
                done();
            });
    });

    it('should respond with 401 after user logout', done => {
        chai.request(server)
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                console.log(res.body);
                res.should.have.status(401);
                done();
            });
    });
});

describe('GET /api/v1/like-unlike-user', function() {
    it('should login user and respond with user token', function(done) {
        chai.request(server)
            .post('/api/v1/login')
            .send({
                email: 'aleksandra.hubert32@gmail.com',
                password: '12345678'
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.have.cookie('jwt');
                cookie = res.header['set-cookie'][0];
                done();
            });
    });

    it('should unlike the user', done => {
        chai.request(server)
            .delete('/api/v1/user/5df39ce46849412326d01a41/unlike')
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('should like the user', done => {
        chai.request(server)
            .post('/api/v1/user/5df39ce46849412326d01a41/like')
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                res.should.have.status(201);
                done();
            });
    });
    it('should like the user again and respond with 209', done => {
        chai.request(server)
            .post('/api/v1/user/5df39ce46849412326d01a41/like')
            .set('Accept', 'application/json')
            .set('Cookie', `${cookie}`)
            .end((err, res) => {
                res.should.have.status(209);
                done();
            });
    });
});
