import mongoose from 'mongoose';


const trainingPlanSchema = new mongoose.Schema({
    /* 
    Based on a calendar week, a training plan will have a list of workouts for each day of the week.
    The week will start on Monday and end on Sunday. And a last column will be for the total distance for the week.
    The user can enter a comment for each workout. 
    */
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    week: {
        type: Number,
        required: [true, 'Week is required'],
    },
    workouts: [
        {
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                required: [true, 'Day is required'],
            },
            workout: {
                type: mongoose.Schema.ObjectId,
                ref: 'Workout',
                required: [true, 'Workout is required'],
            },
            comment: [
                {
                    type: String,
                    trim: true,
                    maxLength: [250, 'Comment cannot exceed 250 characters'],
                }
            ],
        },
    ],
    totalDistance: {
        type: Number,
        default: 0,
    },
    completedDistance: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
});


const TrainingPlan = mongoose.model('TrainingPlan', trainingPlanSchema);

export default TrainingPlan;