import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
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
        location: String,
        distance: {
          type: Number,
          enum: [5, 10, 21.0975, 42.195],
        },
        time: {
          type: String,
          match: [
            /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
            "Please provide time in HH:MM:SS format",
          ],
        },
        timeInSeconds: Number,
        date: { type: Date, default: Date.now }
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



const User = mongoose.model("User", userSchema);
export default User;