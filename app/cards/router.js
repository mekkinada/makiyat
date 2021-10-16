const multer = require('multer');
const passport = require('passport');

const upload = multer();
const router = require('express').Router();

const controller = require('./controller');


router.get('/', controller.getCards);

router.get('/:id', controller.getCard);


router.post(
  '/register',
  passport.authenticate('jwt', { session: false }),
  upload.single('image'),
  controller.registerCard,
);


router.put('/update/:id', controller.editCard);


router.put('/update-image/:id', upload.single('image'), controller.updateImage);

router.delete('/:id', controller.deleteCard);

module.exports = router;
