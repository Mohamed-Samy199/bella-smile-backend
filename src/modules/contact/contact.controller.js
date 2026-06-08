import * as contactService from "./contact.service.js";
import { ApiResponse }     from "../../utils/ApiResponse.js";
import asyncHandler        from "../../utils/asyncHandler.js";

/**
 * POST /api/contact
 * Public — anyone can send a message
 */
export const submitContact = asyncHandler(async (req, res) => {
  const contact = await contactService.submitContact(req.body);
  return ApiResponse.created(
    res,
    "Message sent successfully. We'll get back to you soon!",
    { contact }
  );
});