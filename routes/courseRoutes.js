import { Router } from "express";
import { getAllCourses, getLecturesByCourseId } from "../controllers/courseController.js";
import { isLoggedIn } from "../middlewares/authMiddleware.js";

const router = Router();

router
    .route('/')
    .get(getAllCourses)
router
    .route('/:courseId')
    .get( isLoggedIn, getLecturesByCourseId)

export default router;