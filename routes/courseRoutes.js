import { Router } from "express";
import { addLectureToCourseById, 
    createCourse, 
    deleteCourse, 
    deleteLectureToCourseById, 
    getAllCourses,
    getLecturesByCourseId, 
    updateCourse } 
    from "../controllers/courseController.js";
import { authorizedRoles, 
    authorizedSubscriber, 
    isLoggedIn } 
    from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

router
    .route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse
    );

router
    .route('/:courseId')
    .get( 
        isLoggedIn, 
        authorizedSubscriber,
        getLecturesByCourseId)
    .put(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        updateCourse)
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        deleteCourse)
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('lecture'),
        addLectureToCourseById,
    )
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        deleteLectureToCourseById,
    )
    ;

export default router;