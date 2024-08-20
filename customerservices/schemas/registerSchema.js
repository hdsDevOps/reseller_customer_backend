/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserInput:
 *      type: object
 *      required: 
 *        - firstName
 *        - lastName
 *        - businessName
 *        - streetAddress
 *        - state
 *        - region
 *        - city
 *        - zipCode
 *        - email
 *        - phoneNumber
 *        - password
 *      properties:
 *        firstName:
 *          type: string
 *          description: First name of the user
 *          default: John
 *          example: John
 *        lastName:
 *          type: string
 *          description: Last name of the user
 *          default: Doe
 *          example: Doe
 *        businessName:
 *          type: string
 *          description: Business name of the user
 *          default: JohnDoe Associates
 *          example: JohnDoe Associates
 *        streetAddress:
 *          type: string
 *          description: Street address of the user
 *          default: 123 Main St
 *          example: 123 Main St 
 *        state:
 *          type: string
 *          description: State of the user
 *          default: California
 *          example: California
 *        region:
 *          type: string
 *          description: Region of the user
 *          default: East California
 *          example: East California
 *        city:
 *          type: string
 *          description: City of the user
 *          default: San Francisco
 *          example: San Francisco
 *        zipCode:
 *          type: number
 *          description: Zip code of the user
 *          default: 94105
 *          example: 94105
 *        email:
 *          type: string
 *          description: Email of the user
 *          default: johndoe@example.com
 *          example: johndoe@example.com
 *        phoneNumber:
 *          type: string
 *          description: Phone number of the user
 *          default: "+2341234567890"
 *          example: "+2341234567890"
 *        password:
 *          type: string
 *          description: Password of the user
 *          default: Welcome1$
 *          example: Welcome1$
 *    CreateUserCreatedResponse:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *        id:
 *          type: string
 *        email:
 *          type: string
 *        isVerified:
 *          type: boolean
 *    CreateUnprocessableError:
 *      type: object
 *      properties:
 *        errors:
 *          type: array
 *          items:
 *            type: object
 *            properties: 
 *              type:
 *                type: string
 *              value: 
 *                type: string
 *              msg:  
 *                type: string
 *              path:
 *                type: string
 *              location: 
 *                type: string
 *    BadRequestError:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *    CreateVerifyOtp:
 *      type: object
 *      required:
 *        - email
 *        - otp
 *      properties:
 *        email:
 *          type: string
 *        otp:
 *          type: string
 *    VerifyUserResponse:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *        id:
 *          type: string
 *    CreateNewOtp:
 *      type: object
 *      required:
 *        - email
 *      properties:
 *        email:
 *          type: string
 *    NewOtpResponse:
 *      type: object
 *      properties:
 *        message:
 *          type: string 
*/

const createUserValidationSchema = {
  firstName: {
    isLength: {
      options: {
        min: 3,
        max: 50,
      },
    },
    isString: {
      errorMessage: "Provide a string value",
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
      errorMessage: "Provide a string value",
    },
    notEmpty: true,
  },
  businessName: {
    isLength: {
      options: {
        min: 3,
      },
    },
    isString: {
      errorMessage: "Provide a string value",
    },
    notEmpty: true,
  },
  streetAddress: {
    isString: {
      errorMessage: "Provide a string value",
    },
    notEmpty: {
      errorMessage: "Value cannot be empty",
    },
  },
  state: {
    isString: {
      errorMessage: "Provide a string value",
    },
    notEmpty: {
      errorMessage: "Value cannot be empty",
    },
  },
  region: {
    isString: {
      errorMessage: "Provide a string value",
    },
    notEmpty: {
      errorMessage: "Value cannot be empty",
    },
  },
  city: {
    isString: {
      errorMessage: "Provide a string value",
    },
    notEmpty: {
      errorMessage: "Value cannot be empty",
    },
  },
  zipCode: {
    isInt: {
      errorMessage: "Input should be a valid interger",
    },
    notEmpty: {
      errorMessage: "Provide a valid zip code",
    },
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
