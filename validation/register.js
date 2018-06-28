const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
  date.name = !isEmpty(data.name) ? data.name : "";
  if (!validator.isLength(data.name, { min: 5, max: 30 })) {
    errors.name = "Name must be between 5 and 30 characters";
  }
  if (!validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
