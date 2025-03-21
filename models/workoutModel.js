import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({
  distance: {
    type: Number,
    unit: {
      type: String,
      enum: ["m", "km", "mi"],
    },
  },
  time: String,
  pace: String,
});

const paceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["easy", "marathon", "tempo", "threshold", "interval", "repetition"],
    required: [true, "Pace type is required"],
  },
  pace: {
    type: String,
    /* format match in mm:ss */
    match: [/^([0-5][0-9]):[0-5][0-9]$/, "Please provide pace in mm:ss format"],
    required: [true, "Pace is required"],
  },
});

const workoutSchema = new mongoose.Schema({
  workoutName: {
    type: String,
    required: [true, "Workout name is required"],
    trim: true,
    minlength: [2, "Workout name must be at least 2 characters"],
    maxlength: [25, "Workout name cannot exceed 50 characters"],
  },
  warmUp: {
    type: String,
    pace: {
      type: paceSchema,
      default: null,
    },
    splits: [splitSchema],
  },
  work: [
    {
      type: {
        type: String,
        enum: ["distance", "time"],
        required: [true, "Work type is required"],
      },
      // if type is distance then ask for a distance
      distance: {
        type: Number,
        unit: {
          type: String,
          enum: ["m", "km", "mi"],
        },
      },
      // if type is time then ask for a time
      time: String,
      pace: {
        type: paceSchema,
        default: null,
      },
      repetitions: {
        type: Number,
        default: 1,
      },
      splits: [splitSchema],
    },
  ],
  coolDown: {
    type: String,
    pace: {
      type: paceSchema,
      default: null,
    },
    splits: [splitSchema],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
}, {
    timestamps: true,
});

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;