
const createUserValidationSchema = {
  firstName: {
    isLength: {
      options: {
        min: 3,
        max: 50,
      },
    },
    isString: {
      errorMessage: "Provide a valid name",
    },
    notEmpty: true,
  },
  lastName: {
    isLength: {
      options: {
        min: 3,
        max: 50,
      },
    },
    isString: {
      errorMessage: "Provide a valid name",
    },
    notEmpty: true,
  },
  password: {
    isStrongPassword: {
      ninLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
      errorMessage:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
    },
  },
  email: {
    notEmpty: {
      errorMessage: "Provide a valid email",
    },
    isEmail: true,
  },
  phoneNumber: {
    optional: true,
    notEmpty: false,
    isMobilePhone: {
      options: ["en-NG"],
      errorMessage: "Provide a valid phone number",
    },
  },
};

module.exports = { createUserValidationSchema };
