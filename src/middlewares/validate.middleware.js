// import { ApiError } from "../utils/ApiError.js";

// const validate = (schema) => (req, res, next) => {
//   const { error } = schema.validate(req.body, {
//     abortEarly: false,
//     stripUnknown: true,
//   });

//   if (!error) return next();

//   const errors = error.details.map((detail) => ({
//     field: detail.path.join("."),
//     message: detail.message.replace(/['"]/g, ""),
//     // const errors = error.details.map((d) => d.message);
//     // throw ApiError.badRequest("Validation failed.", errors);
//   }));
// console.log(errors);

//   return next(ApiError.badRequest("Validation failed", errors));
// };

// export default validate;


// validate.middleware.js
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true, });
  if (error) {
    console.log("Validation errors:", error.details);  // ← أضيف
    return res.status(400).json({
      status:  400,
      message: "Validation failed",
      errors:  error.details.map((d) => d.message),
    });
  }
  next();
};

export default validate;