const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const Card = require('./model');
const User = require('../users/model');

const validation = require('./validation');
const logger = require('../../utils/logger');


exports.registerCard = (req, res) => {
  
  console.log(req.file);
  const { isValid, errors } = validation.validateRegisterInput(req.body, req.file);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    
    User.findOne({ _id: req.body.user }, (err, user) => {
      if (!fs.existsSync("images")) {
        fs.mkdirSync("images")
      }

      const filename = `images/${Date.now()}-${user._doc._id}${path.extname(
        req.file.originalname,
      )}`;

      if (err) throw err;

      if (!user) {
        return res.status(404).json({ success: false, errors: { user: 'User not found' } });
      }

      fs.writeFile(filename, req.file.buffer, (error) => {
        if (error) throw error;

        logger.info(`saving image ${filename}`);

        new Card({
          title: req.body.title,
          description: req.body.description,
          user: user._doc._id,
          image: filename,
        })
          .save()
          .then((card) => {
            logger.info(`saving card${card._doc._id}`);

            user.cards.push(card);
            user
              .save()
              .then(u => res.status(201).json({ success: true, card }))
              .catch(e => res.status(500).json({ success: false, error: e }));
          })
          .catch(err => res.status(500).json({ success: false, errors: err }));
      });
    });
  } catch (e) {
    logger.error("Error in the 'registerCard' of the Cards group");
    logger.error(e);

    return res.status(500).json({ success: false, errors: e });
  }
};

exports.getCards = (req, res) => {
  try {
    Card.find({}, { __v: 0 })
      .populate({ path: 'user', select: '-password -__v -cards -date' })
      .exec((err, cards) => {
        if (err) throw err;

        logger.info('Returning all cards');
        return res.status(200).json({ success: true, cards });
      });
  } catch (e) {
    logger.error("Error in 'getCards' in the Cards group");
    logger.error(e);

    return res.status(500).json({ success: false, errors: e });
  }
};


exports.getCard = (req, res) => {
  const { id } = req.params;

  const { isValid, errors } = validation.validateObjectID(id);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    Card.findOne({ _id: id }, { __v: 0 })
      .populate({ path: 'user', select: '-password -__v -cards -date' })
      .exec((err, card) => {
        if (err) throw err;

        logger.info(`Returning card id: ${card._doc._id}`);

        return res.status(200).json({ success: true, card });
      });
  } catch (e) {
    logger.error("Error in 'getCard' in the Cards group");
    logger.error(e);

    return res.status(500).json({ success: false, errors: e });
  }
};

exports.editCard = (req, res) => {
  const { id } = req.params;

  console.log(req.body)

  const { isValid, errors } = validation.validateUpdateInput(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    
    Card.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true }, (err, card) => {
      if (err) throw err;

      if (!card) {
        return res.status(404).json({ success: false, errors: { id: 'No cards for this ID' } });
      }

      logger.info(`Updating card ${card._doc._id}`);

      return res.status(200).json({ success: true, card });
    });
  } catch (e) {
    logger.error("Error in the 'editCard' of the Cards group");
    logger.error(e);

    return res.status(500).json({ success: false, errors: e });
  }
};

exports.updateImage = (req, res) => {
  const { id } = req.params;

  console.log(req.file)
  
  const { isValid, errors } = validation.validateImageInput(req.file);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
  
    Card.findOne({ _id: id }, (err, card) => {
      if (err) throw err;

      if (!card) {
        return res.status(404).json({ success: false, errors: { id: 'No cards for this ID' } });
      }

      const filename = `images/${Date.now()}-${card._doc.user}${path.extname(
        req.file.originalname,
      )}`;

      fs.unlink(card.image, (err) => {
        if (err) throw err;

        fs.writeFile(filename, req.file.buffer, (error) => {
          if (error) throw error;

          logger.info(`Updating image ${filename}`);

          card.image = filename;

          card
            .save()
            .then(c => res.status(200).json({ success: true, c }))
            .catch(error => res.status(500).json({ success: false, errors: error }));
        });
      });
    });
  } catch (e) {
    logger.error("Error in the 'editCard' of the Cards group");
    logger.error(e);

    return res.status(500).json({ success: false, errors: e });
  }
};

exports.deleteCard = (req, res) => {
  const { id } = req.params;

  const { errors, isValid } = validation.validateObjectID(id);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    Card.findOneAndDelete({ _id: id }, (err, card) => {
      if (err) throw err;

      if (!card) {
        return res.status(404).json({ success: false, errors: { id: 'No cards for this ID' } });
      }

      User.findOne({ _id: card.user }, (e, user) => {
        if (e) throw e;

        const index = user.cards.indexOf(card._doc._id);

        index !== 1 && user.cards.splice(index, 1);

        logger.info(`removing card ${id}`)

        user
          .save()
          .then(c => res.status(200).json({ success: true, card }))
          .catch(error => res.status(400).json({ success: false, errors: error }));
      });
    });
  } catch (e) {
    logger.error("Error in 'deleteCard' in the Cards group");
    logger.error(e);

    return res.status(500).json({ success: false, errors: e });
  }
};


cron.schedule('10 * * * *', () => {

  logger.info("Performing cronjob to remove unsaved images")

  try {
  
    Card.find({}, (err, cards) => {
      if (err) throw err;
  
      cards.map(card => card._doc);
  
      fs.readdir('images', (err, fileNames) => {
        if (err) throw err;
  
        fileNames.forEach((item) => {
    
          const catched = cards.find(c => c.image.split('/')[1] === item);
  
          if (catched) {
            return
          } else {
            fs.unlinkSync(`images/${item}`, (err) => {
              if (err) throw err;

              logger.info(`removing image ${item}`)
            });
          }
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
  
});


