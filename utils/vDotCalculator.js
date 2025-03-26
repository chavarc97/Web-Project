// utils/vdotCalculator.js
import { vdotTable } from "./vDotTable.js";

/**
 * Calculate VDOT from race performance using Jack Daniels' formula
 *
 * @param {number} distance - Race distance in kilometers
 * @param {number} timeInSeconds - Race time in seconds
 * @return {number} - The calculated VDOT value
 */

const calculateVdot = (distance, timeInSeconds) => {
  // Convert time from seconds to minutes for formula
  const timeInMinutes = timeInSeconds / 60;

  // Calculate percent VO2max based on race time as a percentage of world record time
  let percentVO2max;
  if (timeInMinutes <= 3.5) {
    // Short races (≤3.5 minutes) - approximately 100% VO2max
    percentVO2max = 0.98;
  } else if (timeInMinutes <= 7) {
    // 3.5-7 minute races - approximately 95-98% VO2max
    percentVO2max = 0.95 + (7 - timeInMinutes) * 0.01;
  } else if (timeInMinutes <= 30) {
    // 7-30 minute races - approximately 90-95% VO2max
    percentVO2max = 0.9 + (30 - timeInMinutes) * 0.002;
  } else if (timeInMinutes <= 120) {
    // 30-120 minute races - approximately 83-90% VO2max
    percentVO2max = 0.83 + (120 - timeInMinutes) * 0.000775;
  } else {
    // Races > 120 minutes - approximately 80-83% VO2max
    percentVO2max = 0.8 + (180 - timeInMinutes) * 0.00005;
    if (percentVO2max > 0.83) percentVO2max = 0.83;
  }

  // Calculate velocity in meters per minute
  const velocity = (distance * 1000) / timeInMinutes; // m/min

  // Calculate VO2 in ml/kg/min using Daniels-Gilbert formula
  const oxygenCost =
    -4.6 + 0.182258 * velocity + 0.000104 * velocity * velocity;
  const VO2 = oxygenCost / percentVO2max;

  // VDOT is essentially the estimated VO2max
  return Math.round(VO2);
};

/**
 * Get training paces based on VDOT value
 *
 * @param {number} vdot - The VDOT value
 * @return {object} - Object containing recommended training paces
 */

const getTrainingPaces = (vdot) => {
  // Find the exact or closest VDOT value in the table
  const closest = vdotTable.reduce((prev, curr) => {
    return Math.abs(curr.vdot - vdot) < Math.abs(prev.vdot - vdot)
      ? curr
      : prev;
  });

  return closest.paces;
};

/**
 * Calculate equivalent race times for different distances based on VDOT
 *
 * @param {number} vdot - The VDOT value
 * @return {object} - Object containing predicted race times for standard distances
 */

const getPredictedRaceTimes = (vdot) => {
  // Approximate race times in seconds for different distances at given VDOT
  // These are simplified calculations - actual predictions would use more complex formulas
  const raceDistances = {
    "800m": 0.8,
    "1500m": 1.5,
    Mile: 1.609,
    "3000m": 3,
    "5K": 5,
    "10K": 10,
    "15K": 15,
    "Half Marathon": 21.0975,
    Marathon: 42.195,
  };

  const results = {};

  for (const [distance, km] of Object.entries(raceDistances)) {
    let percentVO2max;

    // Estimate time in minutes based on distance and VDOT
    let estimatedTimeMinutes;

    if (km <= 3) {
      // For shorter distances (800m, 1500m, mile, 3000m)
      const velocity =
        (-4.6 + Math.sqrt(21.16 + 0.000104 * vdot * 0.98)) / 0.000104;
      estimatedTimeMinutes = (km * 1000) / velocity;
    } else if (km <= 5) {
      // 5K
      percentVO2max = 0.93;
      const velocity =
        (-4.6 + Math.sqrt(21.16 + 0.000104 * vdot * percentVO2max)) / 0.000104;
      estimatedTimeMinutes = (km * 1000) / velocity;
    } else if (km <= 10) {
      // 10K
      percentVO2max = 0.9;
      const velocity =
        (-4.6 + Math.sqrt(21.16 + 0.000104 * vdot * percentVO2max)) / 0.000104;
      estimatedTimeMinutes = (km * 1000) / velocity;
    } else if (km <= 21.1) {
      // 15K, Half Marathon
      percentVO2max = 0.87;
      const velocity =
        (-4.6 + Math.sqrt(21.16 + 0.000104 * vdot * percentVO2max)) / 0.000104;
      estimatedTimeMinutes = (km * 1000) / velocity;
    } else {
      // Marathon
      percentVO2max = 0.83;
      const velocity =
        (-4.6 + Math.sqrt(21.16 + 0.000104 * vdot * percentVO2max)) / 0.000104;
      estimatedTimeMinutes = (km * 1000) / velocity;
    }

    // Convert time to HH:MM:SS format
    const hours = Math.floor(estimatedTimeMinutes / 60);
    const minutes = Math.floor(estimatedTimeMinutes % 60);
    const seconds = Math.round(
      (estimatedTimeMinutes - Math.floor(estimatedTimeMinutes)) * 60
    );

    if (hours > 0) {
      results[distance] = `${hours}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      results[distance] = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  }

  return results;
};

/**
 * Convert pace string (mm:ss) to seconds per kilometer
 *
 * @param {string} pace - Pace in format "mm:ss"
 * @return {number} - Pace in seconds
 */
const paceToSeconds = (pace) => {
  const [minutes, seconds] = pace.split(":").map(Number);
  return minutes * 60 + seconds;
};

/**
 * Convert seconds to pace string (mm:ss)
 *
 * @param {number} seconds - Pace in seconds
 * @return {string} - Pace in format "mm:ss"
 */
const secondsToPace = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Example usage:
 *
 * // Calculate VDOT from a 5K time of 20 minutes (1200 seconds)
 * const myVdot = calculateVdot(5, 1200); // Returns approx. 53
 *
 * // Get training paces for that VDOT
 * const myPaces = getTrainingPaces(myVdot);
 *
 * // Get predicted race times for other distances
 * const myPredictions = getPredictedRaceTimes(myVdot);
 */

export {
  calculateVdot,
  getTrainingPaces,
  getPredictedRaceTimes,
  paceToSeconds,
  secondsToPace,
};