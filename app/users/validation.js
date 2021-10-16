const isEquals = require('validator/lib/equals');
const isLength = require('validator/lib/isLength');
const isEmail = require('validator/lib/isEmail');
const isEmpty = require('../../utils/is-empty');

const { ObjectId } = require('mongoose').Types;

exports.validateRegisterInput = (data) => {
  const errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';


  if (!isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'The name field must contain a name between 2 and 30 characters';
  }

  if (!isEmail(data.email)) {
    errors.email = 'The email field must contain a valid email address';
  }

  if (!isLength(data.password, { min: 4, max: 30 })) {
    errors.password = 'Password must contain between 4 and 30 characters';
  }


  if (!isEquals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  if (isEmpty(data.name)) {
    errors.name = 'name field cannot be empty';
  }

  if (isEmpty(data.email)) {
    errors.email = 'Email field cannot be empty';
  }

  if (isEmpty(data.password)) {
    errors.password = 'Password field cannot be empty';
  }

  if (isEmpty(data.password2)) {
    errors.password2 = 'Password2 field cannot be empty';
  }

  return {
    errors,
    isValid: isEmpty(errors),
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


exports.validateUpdateInput = (id, data) => {
  const errors = {};

  if (!ObjectId.isValid(id)) {
    errors.id = 'Not a valid ObjectID';
  }
  if (isEmpty(id)) {
    errors.id = 'ID cannot be empty';
  }

  if (!isEmpty(data.name)) {
    if (!isLength(data.name, { min: 2, max: 30 })) {
      errors.name = 'The name field must contain a name between 2 and 30 characters';
    }
  }

  if (!isEmpty(data.email)) {
    if (!isEmail(data.email)) {
      errors.email = 'The email field must contain a valid email address.';
    }
  }

  return {
    isValid: isEmpty(errors),
    errors,
  };
};


exports.validatePassword = (id, data) => {
  const errors = {};

  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';


  if (!ObjectId.isValid(id)) {
    errors.id = 'Not a valid ObjectID';
  }
  if (isEmpty(id)) {
    errors.id = 'ID cannot be empty';
  }


  if (!isLength(data.password, { min: 4, max: 30 })) {
    errors.password = 'Password must contain between 4 and 30 characters';
  }


  if (!isEquals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  
  if (isEmpty(data.password)) {
    errors.password = 'Password field cannot be empty';
  }

  if (isEmpty(data.password2)) {
    errors.password2 = 'Password field cannot be empty';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};


exports.validateLoginInput = (data) => {
  const errors = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if (!isEmail(data.email)) {
    errors.email = 'Invalid email';
  }
  if (isEmpty(data.email)) {
    errors.email = 'Email field cannot be empty';
  }

  if (isEmpty(data.password)) {
    errors.password = 'Password field cannot be empty';
  }

  return {
    isValid: isEmpty(errors),
    errors,
  };
};
