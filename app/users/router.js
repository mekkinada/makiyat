const router = require('express').Router();
const passport = require('passport');
const controller = require('./controller');

router.get('/', controller.getUsers);

router.post('/register', controller.register);

router.get('/:id', controller.getUser);

router.patch('/:id', controller.updateUser);

router.patch('/change-password/:id', controller.updatePassword);

router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.deleteUser);

router.post('/login', controller.loginUser);

module.exports = router;
