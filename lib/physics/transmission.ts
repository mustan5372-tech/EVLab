import { TransmissionParameters } from '@/types/ev';

export function calculateTotalGearRatio(params: TransmissionParameters): number {
  return params.gearRatio * params.differentialRatio;
}

/**
 * Calculates vehicle linear velocity (m/s) from motor RPM
 */
export function motorRpmToVehicleSpeedMs(
  motorRpm: number,
  wheelRadiusM: number,
  totalGearRatio: number
): number {
  if (totalGearRatio <= 0 || wheelRadiusM <= 0) return 0;
  const wheelAngularVelRadS = (motorRpm * 2 * Math.PI) / (60 * totalGearRatio);
  return wheelAngularVelRadS * wheelRadiusM;
}

/**
 * Calculates motor RPM from vehicle linear speed (m/s)
 */
export function vehicleSpeedMsToMotorRpm(
  speedMs: number,
  wheelRadiusM: number,
  totalGearRatio: number
): number {
  if (wheelRadiusM <= 0) return 0;
  const wheelAngularVelRadS = speedMs / wheelRadiusM;
  const motorAngularVelRadS = wheelAngularVelRadS * totalGearRatio;
  return (motorAngularVelRadS * 60) / (2 * Math.PI);
}

/**
 * Calculates wheel torque delivered by motor in Newtons * meters
 * Tw = Tm * G_total * eta_drive
 */
export function motorTorqueToWheelTorque(
  motorTorqueNm: number,
  totalGearRatio: number,
  drivetrainEfficiency: number
): number {
  return motorTorqueNm * totalGearRatio * drivetrainEfficiency;
}

/**
 * Calculates required motor torque to produce a desired wheel tractive force
 * Tm = (Ft * r_w) / (G_total * eta_drive)
 */
export function tractiveForceToMotorTorque(
  tractiveForceN: number,
  wheelRadiusM: number,
  totalGearRatio: number,
  drivetrainEfficiency: number
): number {
  if (totalGearRatio <= 0 || drivetrainEfficiency <= 0) return 0;
  const wheelTorqueNm = tractiveForceN * wheelRadiusM;
  return wheelTorqueNm / (totalGearRatio * drivetrainEfficiency);
}

/**
 * Calculates tractive force generated at the contact patch by wheel torque
 * Ft = Tw / r_w
 */
export function wheelTorqueToTractiveForce(
  wheelTorqueNm: number,
  wheelRadiusM: number
): number {
  if (wheelRadiusM <= 0) return 0;
  return wheelTorqueNm / wheelRadiusM;
}
