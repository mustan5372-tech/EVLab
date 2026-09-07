/**
 * Reliable Engineering Unit Conversions for EVLAB
 */

// Speed
export const msToKmh = (ms: number): number => ms * 3.6;
export const kmhToMs = (kmh: number): number => kmh / 3.6;
export const kmhToMph = (kmh: number): number => kmh * 0.621371;
export const mphToKmh = (mph: number): number => mph / 0.621371;

// Mass
export const kgToLbs = (kg: number): number => kg * 2.20462;
export const lbsToKg = (lbs: number): number => lbs / 2.20462;

// Torque
export const nmToLbFt = (nm: number): number => nm * 0.737562;
export const lbFtToNm = (lbFt: number): number => lbFt / 0.737562;

// Power
export const kwToHp = (kw: number): number => kw * 1.34102;
export const hpToKw = (hp: number): number => hp / 1.34102;

// Force
export const nToLbf = (n: number): number => n * 0.224809;
export const lbfToN = (lbf: number): number => lbf / 0.224809;

// Energy & Consumption
export const whPerKmToKwhPer100Km = (whKm: number): number => whKm / 10;
export const kwhPer100KmToWhPerKm = (kwh100Km: number): number => kwh100Km * 10;
export const whKmToMpge = (whKm: number): number => (whKm > 0 ? 33705 / (whKm * 1.60934) : 0);

// Distance
export const mToKm = (m: number): number => m / 1000;
export const kmToMiles = (km: number): number => km * 0.621371;
export const milesToKm = (miles: number): number => miles / 0.621371;

// Angular Velocity & RPM
export const radSToRpm = (radS: number): number => (radS * 60) / (2 * Math.PI);
export const rpmToRadS = (rpm: number): number => (rpm * 2 * Math.PI) / 60;
