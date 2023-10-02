import { Router } from "express";
import { addLectureToCourseById, 
    createCourse, 
    deleteCourse, 
    getAllCourses,
    getLecturesByCourseId, 
    updateCourse } 
    from "../controllers/courseController.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/authMiddleware.js";
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
        authorizedRoles('ADMIN'),
        getLecturesByCourseId)
    .put(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        updateCourse)
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        deleteCourse)
    // .post(
    //     isLoggedIn,
    //     authorizedRoles('ADMIN'),
    //     upload.single('thumbnail'),
    //     addLectureToCourseById,
    // )
    ;

export default router;