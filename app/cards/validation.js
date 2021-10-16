const { ObjectId } = require('mongoose').Types;

const isLength = require('validator/lib/isLength');
const isEmpty = require('../../utils/is-empty');

exports.validateRegisterInput = (data, file) => {
  const errors = {};
  let mimetype;

  data.title = !isEmpty(data.title) ? data.title : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.user = !isEmpty(data.user) ? data.user : '';

  if (isEmpty(file)) {
    errors.image = 'The image field cannot be empty';
  } else {
    mimetype = file.mimetype.split('/')[1];

    if (!['jpg', 'jpeg', 'png'].includes(mimetype)) {
      errors.image = 'Invalid file type';
    }
  }

  if (!isLength(data.title, { min: 2, max: 40 })) {
    errors.title = 'The title must contain between 2 and 40 characters';
  }
  if (isEmpty(data.title)) {
    errors.title = 'Title field cannot be empty';
  }

  if (!isLength(data.description, { min: 2, max: 120 })) {
    errors.description = 'The description must contain between 2 and 120 characters';
  }
  if (isEmpty(data.description)) {
    errors.description = 'Description field cannot be empty';
  }

  if (!ObjectId.isValid(data.user)) {
    errors.user = 'User objectID is invalid';
  }
  if (isEmpty(data.user)) {
    errors.user = 'User objectID cannot be empty';
  }

  return {
    isValid: isEmpty(errors),
    errors,
  };
};

exports.validateUpdateInput = (data) => {
  const errors = {};

  if (!isEmpty(data.user)) {
    errors.user = 'Cannot change card creator';
  }

  if (!isLength(data.title, { min: 2, max: 40 })) {
    errors.title = 'The title must contain between 2 and 40 characters';
  }
  if (isEmpty(data.title)) {
    errors.title = 'Title field cannot be empty';
  }

  if (!isLength(data.description, { min: 2, max: 120 })) {
    errors.description = 'The description must contain between 2 and 120 characters';
  }
  if (isEmpty(data.description)) {
    errors.description = 'Description field cannot be empty';
  }

  return {
    isValid: isEmpty(errors),
    errors,
  };
};

exports.validateImageInput = (file) => {
  const errors = {};
  let mimetype;

  if (isEmpty(mimetype)) {
    errors.image = 'The image field cannot be empty';
  } else {
    mimetype = file.mimetype.split('/')[1];

    if (!['jpg', 'jpeg', 'png'].includes(mimetype)) {
      errors.image = 'Invalid file type, valid types: [.jpg, .jpeg, .png]';
    }
  }

  return {
    isValid: isEmpty(errors),
    errors,
  };
};

exports.validateObjectID = (id) => {
  const errors = {};

  id = !isEmpty(id) ? id : '';

  if (!ObjectId.isValid(id)) {
    errors.id = 'Not a valid ObjectID';
  }

  if (isEmpty(id)) {
    errors.id = 'ID cannot be empty';
  }

  return {
    isValid: isEmpty(errors),
    errors,
  };
};
