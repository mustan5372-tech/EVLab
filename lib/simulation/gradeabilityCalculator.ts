import { EVConfiguration } from '@/types/ev';
import { GradeabilityResult, GradeabilityItem } from '@/types/simulation';
import { calculateAerodynamicDrag } from '../physics/aerodynamics';
import { calculateRollingResistance } from '../physics/rollingResistance';
import { calculateGradeResistance } from '../physics/gradeResistance';
import { calculateTotalGearRatio, vehicleSpeedMsToMotorRpm, motorTorqueToWheelTorque, wheelTorqueToTractiveForce } from '../physics/transmission';
import { getMotorOperatingLimits } from '../physics/motorModel';
import { calculateBatteryPackMetrics } from '../physics/batteryModel';
import { kmhToMs } from '../units/conversions';

export function calculateGradeability(config: EVConfiguration): GradeabilityResult {
  const { vehicle, motor, battery, transmission } = config;
  const totalGearRatio = calculateTotalGearRatio(transmission);
  const pack = calculateBatteryPackMetrics(battery);

  const batteryMaxMechPowerKw = pack.maxContinuousDischargePowerKw * 0.95 * motor.baseEfficiency;
  const motorContinuousKw = Math.min(motor.continuousPowerKw, batteryMaxMechPowerKw);

  const targetGrades = [5, 10, 15, 20, 30];
  const items: GradeabilityItem[] = [];

  for (const grade of targetGrades) {
    // Determine maximum steady-state speed the vehicle can sustain on this grade
    let maxSpeedKmh = 0;
    let reqTorqueNm = 0;
    let reqPowerKw = 0;
    let feasible = false;

    // Scan downward from 140 km/h to 5 km/h
    for (let vKmh = 140; vKmh >= 5; vKmh -= 2) {
      const vMs = kmhToMs(vKmh);
      const rpm = vehicleSpeedMsToMotorRpm(vMs, vehicle.wheelRadiusM, totalGearRatio);

      if (rpm > motor.maxRpm) continue;

      const fAero = calculateAerodynamicDrag(vMs, vehicle.cd, vehicle.frontalAreaM2);
      const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
      const fGrade = calculateGradeResistance(vehicle.massKg, grade);
      const fTotal = fAero + fRolling + fGrade;

      const wheelTorqueReq = fTotal * vehicle.wheelRadiusM;
      const motorTorqueReq = wheelTorqueReq / (totalGearRatio * transmission.drivetrainEfficiency);
      const motorPowerReqKw = (motorTorqueReq * ((rpm * 2 * Math.PI) / 60)) / 1000;

      const motorLimits = getMotorOperatingLimits(rpm, {
        ...motor,
        continuousPowerKw: motorContinuousKw,
      });

      if (
        motorTorqueReq <= motorLimits.availablePeakTorqueNm &&
        motorPowerReqKw <= motor.peakPowerKw
      ) {
        maxSpeedKmh = vKmh;
        reqTorqueNm = Math.round(motorTorqueReq * 10) / 10;
        reqPowerKw = Math.round(motorPowerReqKw * 10) / 10;
        feasible = true;
        break;
      }
    }

    items.push({
      gradePercent: grade,
      maxSpeedKmh,
      requiredTorqueNm: reqTorqueNm,
      requiredPowerKw: reqPowerKw,
      feasible,
    });
  }

  // Calculate max grade sustainable at 20 km/h and 50 km/h
  const findMaxGradeAtSpeed = (vKmh: number): number => {
    const vMs = kmhToMs(vKmh);
    const rpm = vehicleSpeedMsToMotorRpm(vMs, vehicle.wheelRadiusM, totalGearRatio);
    const motorLimits = getMotorOperatingLimits(rpm, motor);
    const maxWheelTorque = motorTorqueToWheelTorque(
      motorLimits.availablePeakTorqueNm,
      totalGearRatio,
      transmission.drivetrainEfficiency
    );
    const maxAvailForceN = wheelTorqueToTractiveForce(maxWheelTorque, vehicle.wheelRadiusM);

    const fAero = calculateAerodynamicDrag(vMs, vehicle.cd, vehicle.frontalAreaM2);
    const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);

    let lowGrade = 0;
    let highGrade = 60;
    for (let i = 0; i < 20; i++) {
      const mid = (lowGrade + highGrade) / 2;
      const fGrade = calculateGradeResistance(vehicle.massKg, mid);
      if (fAero + fRolling + fGrade > maxAvailForceN) {
        highGrade = mid;
      } else {
        lowGrade = mid;
      }
    }
    return Math.round(lowGrade * 10) / 10;
  };

  return {
    grades: items,
    maxGradeAt20Kmh: findMaxGradeAtSpeed(20),
    maxGradeAt50Kmh: findMaxGradeAtSpeed(50),
  };
}
