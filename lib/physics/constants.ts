/**
 * Fundamental Engineering and Physical Constants for EVLAB
 * All SI units: m, kg, s, N, W, J, Pa, K
 */

export const STANDARD_GRAVITY = 9.80665; // m/s²
export const STANDARD_AIR_DENSITY = 1.225; // kg/m³ at 15°C sea level
export const SPECIFIC_GAS_CONSTANT_DRY_AIR = 287.058; // J/(kg·K)
export const STANDARD_PRESSURE_PA = 101325; // Pa (1 atm)
export const KELVIN_OFFSET = 273.15; // °C to K

/**
 * Calculates air density based on ambient temperature and altitude
 * @param tempC Ambient temperature in °C
 * @param altitudeM Altitude above sea level in meters (default: 0)
 * @returns Air density in kg/m³
 */
export function getAirDensity(tempC: number = 20, altitudeM: number = 0): number {
  const tempK = tempC + KELVIN_OFFSET;
  // Barometric formula for pressure at altitude
  const pressure = STANDARD_PRESSURE_PA * Math.pow(1 - (0.0065 * altitudeM) / 288.15, 5.255);
  return pressure / (SPECIFIC_GAS_CONSTANT_DRY_AIR * tempK);
}

/**
 * Typical road tire-surface adhesion friction coefficients (μ)
 */
export const TIRE_FRICTION_COEFFICIENTS = {
  dryAsphalt: 0.9,
  wetAsphalt: 0.6,
  snow: 0.25,
  ice: 0.1,
} as const;
