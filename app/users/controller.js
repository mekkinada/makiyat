// Importando bcrypt
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./model');
const validation = require('./validation');

const logger = require('../../utils/logger');
const config = require('../../config');

exports.getUsers = (req, res) => {
  try {
    User.find({}, { password: 0, __v: 0 })
      .populate({ path: 'cards', select: '-__v' })
      .exec((err, users) => {
        if (err) throw err;

        logger.info('Returning all users');

        return res.status(200).json({ success: true, users });
      });
  } catch (err) {
    logger.error('Error in getUsers from Users group');
    logger.error(err);

    return res.status(500).json({ success: false, errors: err });
  }
};

exports.register = (req, res) => {
  const { errors, isValid } = validation.validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) throw err;

      if (user) {
        return res.status(400).json({ success: false, errors: { email: 'E-mail already registered' } });
      }

      const newUser = { name: req.body.name, email: req.body.email };

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;

        bcrypt.hash(req.body.password, salt, (error, hash) => {
          if (error) throw error;

          newUser.password = hash;
          new User(newUser)
            .save()
            .then((user) => {
              logger.info(`User ${user._doc._id} Registered`);
              res.status(201).json({ success: true, user });
            })
            .catch(e => res.status(500).json({ success: false, errors: e }));
        });
      });

    });
  } catch (err) {
    logger.error('User group register error');
    logger.error(err);
    return res.status(500).json({ success: false, errors: err });
  }
};

exports.getUser = (req, res) => {
  const { id } = req.params;

  const { isValid, errors } = validation.validateObjectID(id);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    User.findOne({ _id: id }, { password: 0 }, async (err, user) => {
      if (err) throw err;

      if (!user) {
        return res
          .status(404)
          .json({ success: false, errors: { id: 'No users for this id' } });
      }

      logger.info(`Returning user ${user._doc._id}`);
      return res.status(200).json({ success: true, user });
    });
  } catch (err) {
    logger.error('Error in getUser of Users group');
    logger.error(err);

    return res.status(500).json({ success: false, errors: err });
  }
};

exports.updateUser = (req, res) => {
  const { id } = req.params;

  const { isValid, errors } = validation.validateUpdateInput(id, req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    User.findOneAndUpdate(
      { _id: id },
      {
        $set: req.body,
      },
      { new: true },
      (err, user) => {
        if (err) throw err;

        if (!user) {
          return res
            .status(404)
            .json({ success: false, errors: { id: 'No users for this id' } });
        }

        logger.info(`Updating user data ${user._doc._id}`);
        return res.status(200).json({ success: true, user });
      },
    );
  } catch (err) {
    logger.error("Error in 'updateUser' of Users group");
    logger.error(err);

    return res.status(500).json({ success: false, errors: err });
  }
};


exports.updatePassword = (req, res) => {
  const { id } = req.params;

  const { isValid, errors } = validation.validatePassword(id, req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    User.findOne({ _id: id }, async (err, user) => {
      if (err) throw err;

      if (!user) {
        return res
          .status(404)
          .json({ success: false, errors: { id: 'No users for this id' } });
      }

      await bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;

        bcrypt.hash(req.body.password, salt, async (error, hash) => {
          if (error) throw error;

          user.password = await hash;
          user
            .save()
            .then((userUpdated) => {
              logger.info(`User password ${userUpdated._doc._id} changed`);
              res.status(201).json({ success: true, user: userUpdated });
            })
            .catch(e => res.status(500).json({ success: false, errors: e }));
        });
      });
    });
  } catch (err) {
    logger.error("Error in 'updatePassword' of users group");
    logger.error(err);

    return res.status(500).json({ success: false, errors: err });
  }
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const { isValid, errors } = validation.validateObjectID(id);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    User.findByIdAndDelete({ _id: id }, async (err, user) => {
      if (err) throw err;

      if (!user) {
        return res
          .status(404)
          .json({ success: false, errors: { id: 'No users for this id' } });
      }

      logger.info(`User ${user._doc._id} deleted`);
      return res.status(200).json({ success: true, user });
    });
  } catch (err) {
    logger.error("Error in 'deleteUser' of group users");
    logger.error(err);

    return res.status(500).json({ success: false, errors: err });
  }
};

exports.loginUser = (req, res) => {
  const { errors, isValid } = validation.validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) throw err;

      if (!user) {
        errors.email = 'User not found';

        return res.status(404).json({ success: false, errors });
      }

      bcrypt.compare(req.body.password, user.password, (error, isMatch) => {
        if (error) throw error;

        if (isMatch) {
          const payload = {
            _id: user._id,
            name: user.name,
            email: user.email,
          };

          jwt.sign(payload, config.secret, (e, token) => {
            if (e) throw e;

            logger.info(`User ${user._doc._id} Logged`);
            return res.status(200).json({ success: true, token: `Bearer ${token}` });
          });
        } else {
          errors.password = 'Incorrect password'; 
          
          return res.status(400).json({ success: false, errors });
        }
      });
    });
  } catch (e) {
    logger.error("Error in 'loginUser' of Users group");
    logger.error(e);

    return res.status(500).json({ success: false, errors: e });
  }
};
