import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./env.config.js";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

export default stripe;