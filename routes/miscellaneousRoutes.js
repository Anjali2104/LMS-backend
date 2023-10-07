import { Router } from "express";
import { contactUs } from "../controllers/miscellaneousController.js";

const router = Router();

router
    .route('/contact')
    .post(contactUs);

export default router;