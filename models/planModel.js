import mongoose from "mongoose";

const trainingPlanSchema = new mongoose.Schema(
  {
    /* 
    Based on a calendar week, a training plan will have a list of workouts for each day of the week.
    The week will start on Monday and end on Sunday. And a last column will be for the total distance for the week.
    The user can enter a comment for each workout. 
    */
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    week: {
      type: Number,
      required: [true, "Week is required"],
      min: [1, "Week must be at least 1"],
      max: [53, "Week must not exceed 53"],
    },
    workouts: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: [true, "Day is required"],
        },
        workout: {
          type: mongoose.Schema.ObjectId,
          ref: "Workout",
          required: [true, "Workout is required"],
        },
        comment: [
          {
            type: String,
            trim: true,
            maxLength: [250, "Comment cannot exceed 250 characters"],
            default: "",
          },
        ],
      },
    ],
    totalDistance: {
      type: Number,
      default: 0,
      min: [0, "Total distance must be at least 0"],
    },
    completedDistance: {
      type: Number,
      default: 0,
      min: [0, "Completed distance can't be less than 0"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

// Add cascade delete middleware
trainingPlanSchema.pre('remove', async function(next) {
    await this.model('User').updateOne(
      { _id: this.user },
      { $pull: { trainingPlans: this._id } }
    );
    next();
  });

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);

export default TrainingPlan;
