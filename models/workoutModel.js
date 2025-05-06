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
  estimatedDuration: Number,
  warmUp: {
    time: {
      type: String,
      match: [/^([0-5][0-9]):[0-5][0-9]$/, "Please provide time in mm:ss format"],
    },
    distance: {
      type: Number,
      unit: {
        type: String,
        enum: ["m", "km", "mi"],
      },
    },
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
    time: {
      type: String,
      match: [/^([0-5][0-9]):[0-5][0-9]$/, "Please provide time in mm:ss format"],
    },
    distance: {
      type: Number,
      unit: {
        type: String,
        enum: ["m", "km", "mi"],
      },
    },
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
    index: true,
  }
}, {
    timestamps: true,
});

workoutSchema.virtual('totalDistance').get(function () {
  let total = 0;
  // check if the warm up has distance if not asume it as easy pace
  if(this.warmUp?.distance?.value) {
    total += this.warmUp.distance.value;
  }
  else if(this.warmUp?.pace) {
    let sum = 0;
    // divide warm up time by pace to get the average distance
    const pace = this.warmUp.pace.pace.split(':');
    const paceInSeconds = parseInt(pace[0]) * 60 + parseInt(pace[1]);
    const time = this.warmUp.time.split(':');
    const timeInSeconds = parseInt(time[0]) * 60 + parseInt(time[1]);
    const distance = timeInSeconds / paceInSeconds;
    total += distance;  
  }
  // check if the cooldown exists and if it has distance add it if not assume it as easy pace
  if(this.coolDown?.distance?.value) {
    total += this.coolDown.distance.value;
  }
  else if(this.coolDown?.pace) {
    let sum = 0;
    // divide cooldown time by pace to get the average distance
    const pace = this.coolDown.pace.pace.split(':');
    const paceInSeconds = parseInt(pace[0]) * 60 + parseInt(pace[1]);
    const time = this.coolDown.time.split(':');
    const timeInSeconds = parseInt(time[0]) * 60 + parseInt(time[1]);
    const distance = timeInSeconds / paceInSeconds;
    total += distance;  
  }
  // check if theres any work with distance if not assume it as the target pace
  if(this.work?.length > 0) {
    this.work.forEach((work) => {
      let distance = 0;
      if(work.type === "distance") {
        distance = work.distance.value;
      } else if(work.type === "time") {
        const pace = work.pace.pace.split(':');
        const paceInSeconds = parseInt(pace[0]) * 60 + parseInt(pace[1]);
        const time = work.time.split(':');
        const timeInSeconds = parseInt(time[0]) * 60 + parseInt(time[1]);
        distance = timeInSeconds / paceInSeconds;
      }
      total += distance * (work.repetitions || 1);
    });
  }
  // return the total distance
  return total;
})

// Add cascade delete middleware
workoutSchema.pre('remove', async function(next) {
  await TrainingPlan.updateMany(
    { 'workouts.workout': this._id },
    { $pull: { workouts: { workout: this._id } } }
  );
  next();
});

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;