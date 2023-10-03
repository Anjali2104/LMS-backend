import Course from "../models/courseModel.js"
import AppError from "../utils/appError.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

export const getAllCourses = async (req,res,next) => {
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success:true,
            message:'All courses',
            courses,
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}

export const getLecturesByCourseId =  async(req,res,next) => {
    try {
        const { courseId } = req.params;
        const course = await Course.find({courseId}) ;

        if(!course){
            return next(
                new AppError('Invalid course Id ', 400)
            )
        }

        res.status(200).json({
            success:true,
            message:'Course lectures fetched successfully ',
            lectures: course.lectures,
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
   
}

export const createCourse = async(req,res,next) => {

 try {
    const { title, description, category, createdBy } = req.body;
    if(!title || !description || !category || !createdBy){
        return next(
            new AppError('All fields are required', 400)
        )
    } 
     
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:"DUMMY_DATA",
            secure_url:"DUMMY_URL"
        },
    });

    if(req.file){
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder:'lms',
      });
      if(result){
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`);

    }

    await course.save();

    res.status(200).json({
        success:true,
        message:'Course created successfully!',
        course,
    })


 } catch (error) {
    return next(
        new AppError(error.message, 500)
    )
 }
}

export const updateCourse = async(req,res,next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndUpdate(
        courseId,
        {
            $set: req.body,
        },
        {
            runValidators: true
        }
    ) 

    if(!course){
        return next(
            new AppError('Course does not exists', 400)
        )
    }

    res.status(200).json({
        success:true,
        message:'Course updated successfully!',
        course,
    })
  } catch (error) {
    return next(
        new AppError(error.message, 500)
    )
  }
}

export const deleteCourse = async(req,res,next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if(!course){
        return next(
            new AppError('Course does not exist with given id!', 500)
        )
    }
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
        success:true,
        message:'Course deleted successfully!'
    })

  } catch (error) {
    return next(
        new AppError(error.message, 500)
    )
  }
}

export const addLectureToCourseById = async(req,res,next) => {
  
    try {
        const { courseId } = req.params;
        const { title, description } = req.body;

        if(!title || !description){
            return next(
                new AppError('All fields are mandatory!', 400)
            )
        }

        const course = await Course.findById({courseId});
        if(!course){
            return next(
                new AppError('Course with given id does not exists', 400)
            )
        }

        const lectureData = {}

        if(req.file){
           try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder:'lms',
                resource_type: 'video',
            });

            if(result){
                lectureData.public_id = result.public_id;
                lectureData.secure_url = result.secure_url;
            }

            fs.rm(`uploads/${req.file.filename}`);
           } catch (error) {
            // Empty the uploads directory without deleting the uploads directory
            for (const file of await fs.readdir('uploads/')) {
                await fs.unlink(path.join('uploads/', file));
            }
   
             // Send the error message
            return next( 
                new AppError('File not uploaded , please try again !')
              );
           }
        }

        course.lectures.push({
            title,
            description,
            lecture: lectureData,
          });
        course.numbersOfLectures = course.lectures.length;
        
         // Save the course object
        await course.save();

        res.status(200).json({
            success:true,
            message:'Lecture added successfully!',
            course,
        })

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }

}

export const deleteLectureToCourseById = async(req,res,next) => {
   
    try {
        const { courseId, lectureId } = req.params;
        // Checking if both courseId and lectureId are present
        if (!courseId ) {
          return next(new AppError('Course ID is required', 400));
        }

        if (!lectureId) {
            return next(new AppError('Lecture ID is required', 400));
        }
        
        // Find the course using the courseId
        const course = await Course.findById({courseId});
        if(!course){
            return next(
                new AppError('Course with given id does not exists', 400)
            )
        }

         // Find the index of the lecture using the lectureId
        const lectureIndex = course.lectures.findIndex(
           (lecture) => lecture._id.toString() === lectureId.toString()
        );

         // If returned index is -1 then send error as mentioned below
        if (lectureIndex === -1) {
           return next(new AppError('Lecture does not exist.', 404));
        }

         // Delete the lecture from cloudinary
        await cloudinary.v2.uploader.destroy(
        course.lectures[lectureIndex].lecture.public_id,
          {
           resource_type: 'video',
          }
        );

        // Remove the lecture from the array
        course.lectures.splice(lectureIndex, 1);

        // update the number of lectures based on lectres array length
        course.numberOfLectures = course.lectures.length;

        // Save the course object
        await course.save();

        // Return response
        res.status(200).json({
          success: true,
          message: 'Course lecture removed successfully',
        });
        
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}