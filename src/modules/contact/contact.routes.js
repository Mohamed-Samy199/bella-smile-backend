import { Router }      from "express";
import { submitContact } from "./contact.controller.js";
import validate        from "../../middlewares/validate.middleware.js";
import { contactSchema } from "./contact.validation.js";

const router = Router();

// Public
router.post("/", validate(contactSchema), submitContact);

export default router;