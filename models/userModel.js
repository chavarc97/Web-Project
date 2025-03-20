const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "coach"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dq7vq8fbj/image/upload/v1631017866/avatars/default_avatar_q6jv4b.png",
    },
    vDot: {
      type: Number,
      default: 0,
    },
    personalBests: {
      fiveK: {
        date: {
          type: Date,
          default: null,
        },
        time: {
          type: String,
          match: [
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Please provide time in HH:MM:SS format",
          ],
          default: null,
        },
        timeInSeconds: {
          type: Number,
          default: null,
        },
        location: {
          type: String,
          default: null,
        },
      },
      tenK: {
        date: {
          type: Date,
          default: null,
        },
        time: {
          type: String,
          match: [
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Please provide time in HH:MM:SS format",
          ],
          default: null,
        },
        timeInSeconds: {
          type: Number,
          default: null,
        },
        location: {
          type: String,
          default: null,
        },
      },
      halfMarathon: {
        date: {
          type: Date,
          default: null,
        },
        time: {
          type: String,
          match: [
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Please provide time in HH:MM:SS format",
          ],
          default: null,
        },
        timeInSeconds: {
          type: Number,
          default: null,
        },
        location: {
          type: String,
          default: null,
        },
      },
      marathon: {
        date: {
          type: Date,
          default: null,
        },
        time: {
          type: String,
          match: [
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Please provide time in HH:MM:SS format",
          ],
          default: null,
        },
        timeInSeconds: {
          type: Number,
          default: null,
        },
        location: {
          type: String,
          default: null,
        },
      },
    },
    upcomingRaces: [
      {
        name: {
          type: String,
          required: [true, "Race name is required"],
        },
        date: {
          type: Date,
          required: [true, "Race date is required"],
        },
        projectedTime: {
          type: String,
          match: [
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Please provide time in HH:MM:SS format",
          ],
          required: [true, "Projected time is required"],
        },
      },
    ],
    recentRaces: [
      {
        name: String,
        time: String,
        date: Date,
      },
    ],
    trainingPlans: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "TrainingPlan",
      },
    ],
  },
  {
    timestamps: true, // This replaces the manual createdAt and adds updatedAt
  }
);

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate timeInSeconds for personal bests
userSchema.pre("save", function (next) {
  const races = ["fiveK", "tenK", "halfMarathon", "marathon"];

  races.forEach((race) => {
    if (this.personalBests[race].time) {
      const [hours, minutes, seconds] = this.personalBests[race].time
        .split(":")
        .map(Number);
      this.personalBests[race].timeInSeconds =
        hours * 3600 + minutes * 60 + seconds;
    }
  });

  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user's fastest race
userSchema.methods.getFastestRace = function () {
  const races = ["fiveK", "tenK", "halfMarathon", "marathon"];
  let fastestRace = null;
  let bestPace = Infinity;

  races.forEach((race) => {
    if (this.personalBests[race].timeInSeconds) {
      let distanceInKm;
      switch (race) {
        case "fiveK":
          distanceInKm = 5;
          break;
        case "tenK":
          distanceInKm = 10;
          break;
        case "halfMarathon":
          distanceInKm = 21.0975;
          break;
        case "marathon":
          distanceInKm = 42.195;
          break;
      }

      const pacePerKm = this.personalBests[race].timeInSeconds / distanceInKm;
      if (pacePerKm < bestPace) {
        bestPace = pacePerKm;
        fastestRace = race;
      }
    }
  });

  return fastestRace;
};

module.exports = mongoose.model("User", userSchema);
