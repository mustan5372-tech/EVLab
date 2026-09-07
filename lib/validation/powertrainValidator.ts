import { EVConfiguration } from '@/types/ev';
import { calculateBatteryPackMetrics } from '../physics/batteryModel';
import { calculateTotalGearRatio, motorRpmToVehicleSpeedMs, motorTorqueToWheelTorque } from '../physics/transmission';
import { calculateTireTractionLimit } from '../physics/tractiveForce';
import { msToKmh } from '../units/conversions';

export type ValidationStatus = 'optimal' | 'good' | 'attention' | 'critical';

export interface ValidationItem {
  id: string;
  category: 'electrical' | 'mechanical' | 'thermal' | 'traction';
  title: string;
  status: ValidationStatus;
  summary: string;
  details: string;
  recommendation?: string;
}

export interface PowertrainValidationReport {
  overallStatus: ValidationStatus;
  items: ValidationItem[];
}

export function validatePowertrainConfiguration(config: EVConfiguration): PowertrainValidationReport {
  const items: ValidationItem[] = [];
  const { vehicle, motor, battery, transmission } = config;

  const pack = calculateBatteryPackMetrics(battery);
  const totalGearRatio = calculateTotalGearRatio(transmission);

  // 1. Battery Power vs Motor Peak Power
  const motorPeakKw = motor.peakPowerKw;
  const battPeakKw = pack.maxPeakDischargePowerKw;
  const powerMarginRatio = battPeakKw / Math.max(1, motorPeakKw);

  if (powerMarginRatio < 0.85) {
    items.push({
      id: 'battery-power-deficit',
      category: 'electrical',
      title: 'Battery Pack Power Deficit',
      status: 'critical',
      summary: `Pack max discharge (${battPeakKw.toFixed(0)} kW) is insufficient for motor demand (${motorPeakKw.toFixed(0)} kW).`,
      details: `The motor will be electronically throttled because the battery cells cannot deliver the demanded discharge rate without severe voltage sag and thermal overload.`,
      recommendation: `Increase parallel cell count (P) or choose cells with a higher C-rate discharge rating.`,
    });
  } else if (powerMarginRatio < 1.05) {
    items.push({
      id: 'battery-power-marginal',
      category: 'electrical',
      title: 'Battery Power Headroom is Tight',
      status: 'attention',
      summary: `Pack peak power (${battPeakKw.toFixed(0)} kW) is barely equal to motor peak power (${motorPeakKw.toFixed(0)} kW).`,
      details: `When factoring inverter and wiring losses (~3%), the pack will operate at its absolute thermal discharge boundary during maximum acceleration.`,
      recommendation: `Consider adding 10-15% headroom by adding parallel strings or upgrading cell discharge C-rate.`,
    });
  } else {
    items.push({
      id: 'battery-power-optimal',
      category: 'electrical',
      title: 'Battery-to-Motor Power Matching',
      status: 'optimal',
      summary: `Battery peak output (${battPeakKw.toFixed(0)} kW) comfortably supports motor demand (${motorPeakKw.toFixed(0)} kW).`,
      details: `Ample electrical headroom ensures low pack resistance losses and minimizes cell degradation during aggressive acceleration.`,
    });
  }

  // 2. Wheel Torque vs Tire Traction Limit
  const peakWheelTorque = motorTorqueToWheelTorque(motor.peakTorqueNm, totalGearRatio, transmission.drivetrainEfficiency);
  const peakTractiveForceAtWheels = peakWheelTorque / vehicle.wheelRadiusM;
  const tireGripLimitN = calculateTireTractionLimit(vehicle.massKg, vehicle.drivenWheels);

  if (peakTractiveForceAtWheels > tireGripLimitN * 1.35) {
    items.push({
      id: 'traction-slip-excessive',
      category: 'traction',
      title: 'Excessive Wheel Slip Potential',
      status: 'attention',
      summary: `Launch wheel force (${(peakTractiveForceAtWheels / 1000).toFixed(1)} kN) exceeds tire adhesion limit (${(tireGripLimitN / 1000).toFixed(1)} kN).`,
      details: `On dry asphalt with standard road tires, launching at 100% torque will engage electronic traction control (TCS) and spin the driven wheels.`,
      recommendation: `Consider switching layout to AWD or reducing gear reduction ratio to trade launch slip for higher top speed.`,
    });
  } else if (peakTractiveForceAtWheels >= tireGripLimitN * 0.85) {
    items.push({
      id: 'traction-ideal',
      category: 'traction',
      title: 'Ideal Launch Traction Utilization',
      status: 'optimal',
      summary: `Wheel tractive force (${(peakTractiveForceAtWheels / 1000).toFixed(1)} kN) perfectly leverages tire friction limit (${(tireGripLimitN / 1000).toFixed(1)} kN).`,
      details: `The powertrain delivers maximum acceleration right at the threshold of tire adhesion without wasteful spinning.`,
    });
  } else {
    items.push({
      id: 'traction-conservative',
      category: 'traction',
      title: 'Under-utilized Tire Traction Limit',
      status: 'good',
      summary: `Available launch force (${(peakTractiveForceAtWheels / 1000).toFixed(1)} kN) is well within tire grip (${(tireGripLimitN / 1000).toFixed(1)} kN).`,
      details: `The vehicle will never experience wheel slip under dry conditions. You have headroom to safely increase motor torque or gear reduction for faster launch.`,
    });
  }

  // 3. Redline Speed Limit vs Reasonable Top Speed
  const maxVehicleSpeedAtRedlineMs = motorRpmToVehicleSpeedMs(motor.maxRpm, vehicle.wheelRadiusM, totalGearRatio);
  const maxVehicleSpeedAtRedlineKmh = msToKmh(maxVehicleSpeedAtRedlineMs);

  if (maxVehicleSpeedAtRedlineKmh < 130) {
    items.push({
      id: 'top-speed-too-low',
      category: 'mechanical',
      title: 'Gearing Limits Highway Top Speed',
      status: 'attention',
      summary: `Motor redline limits top vehicle speed to only ${maxVehicleSpeedAtRedlineKmh.toFixed(0)} km/h.`,
      details: `The selected gear reduction ratio (${totalGearRatio.toFixed(1)}:1) is very short, causing the motor to hit its maximum RPM (${motor.maxRpm} RPM) before standard highway cruising margins.`,
      recommendation: `Lower gear reduction ratio or increase motor maximum RPM.`,
    });
  } else if (maxVehicleSpeedAtRedlineKmh > 320) {
    items.push({
      id: 'gearing-too-tall',
      category: 'mechanical',
      title: 'Excessively Tall Transmission Ratio',
      status: 'good',
      summary: `Gearing theoretical redline speed is ${maxVehicleSpeedAtRedlineKmh.toFixed(0)} km/h.`,
      details: `Theoretical gearing exceeds aerodynamic drag balance. Real top speed will be aero-power limited rather than motor RPM limited.`,
    });
  } else {
    items.push({
      id: 'gearing-balanced',
      category: 'mechanical',
      title: 'Optimal Gear Ratio',
      status: 'optimal',
      summary: `Gearing redline ceiling (${maxVehicleSpeedAtRedlineKmh.toFixed(0)} km/h) is well-matched to automotive highway use.`,
      details: `Balances robust low-speed launch torque with quiet, efficient motor RPM at typical 100–120 km/h cruising speeds.`,
    });
  }

  // 4. Motor Thermal Continuous vs Peak Ratio
  const continuousRatio = motor.continuousPowerKw / Math.max(1, motor.peakPowerKw);
  if (continuousRatio < 0.4) {
    items.push({
      id: 'motor-thermal-margin',
      category: 'thermal',
      title: 'High Thermal De-rating Ratio',
      status: 'attention',
      summary: `Continuous power is only ${(continuousRatio * 100).toFixed(0)}% of peak power.`,
      details: `Sustained high-speed driving or towing up steep inclines will cause the motor controller to thermally de-rate quickly.`,
      recommendation: `Ensure active liquid cooling loop or specify higher thermal-rated stator windings.`,
    });
  } else {
    items.push({
      id: 'motor-thermal-good',
      category: 'thermal',
      title: 'Thermal Duty Cycle Capability',
      status: 'good',
      summary: `Continuous rating is ${(continuousRatio * 100).toFixed(0)}% of peak power (${motor.continuousPowerKw} kW).`,
      details: `Provides strong sustained endurance for prolonged highway cruising and mountainous elevation gains.`,
    });
  }

  // Determine overall status
  let overallStatus: ValidationStatus = 'optimal';
  if (items.some(i => i.status === 'critical')) {
    overallStatus = 'critical';
  } else if (items.some(i => i.status === 'attention')) {
    overallStatus = 'attention';
  } else if (items.some(i => i.status === 'good')) {
    overallStatus = 'good';
  }

  return {
    overallStatus,
    items,
  };
}

export const validatePowertrain = validatePowertrainConfiguration;
