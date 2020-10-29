const { Router } = require('express');
const router = Router();
const controller = require('../controllers/auth.controller');


//    request: JSON { "email": "User's email", "password": "User's password" }
//    response: { "refresh": "refresh token" }
//              cookie: 'jwt': 'signed JWT token'
//              success: CODE 201
router.put('/reg', controller.register);


//    request: JSON { "email": "User's email", "password": "User's password" }
//    response: { "refresh": "refresh token" }
//              cookie: 'jwt': 'signed JWT token'
//              success: CODE 202
router.post('/login', controller.login);


//    request: JSON { "refresh": "refresh token" }
//             cookie: 'jwt': 'signed JWT token'
//    response: { "refresh": "new refresh token" }
//              cookie: 'jwt': 'new signed JWT token'
//              success: CODE 200
router.post('/refresh', controller.refresh);


//    request: JSON { "refresh": "refresh token" }
//             cookie: 'jwt': 'signed JWT token'
//    response: success: CODE 200 **deleted cookie and refresh token**
router.delete('/logout', controller.logout);

module.exports = router;
