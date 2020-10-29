const { Router } = require('express');
const router = Router();
const controller = require('../controllers/auth.controller');

router.put('/reg', controller.register)

router.post('/login', controller.login)

router.post('/refresh', controller.refresh)

module.exports = router;
