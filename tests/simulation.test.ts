import { describe, it, expect } from 'vitest';
import { simulateAcceleration } from '../lib/simulation/accelerationSimulator';
import { calculateTopSpeed } from '../lib/simulation/topSpeedCalculator';
import { calculateRange } from '../lib/simulation/rangeCalculator';
import { simulateDriveCycle } from '../lib/simulation/driveCycleSimulator';
import { STANDARD_DRIVE_CYCLES } from '../lib/simulation/driveCyclesData';
import { DEFAULT_CITY_EV, DEFAULT_PERFORMANCE_EV } from '../lib/storage/defaultPresets';

describe('Acceleration Simulation', () => {
  it('should calculate realistic 0-100 km/h time for City EV', () => {
    const results = simulateAcceleration(DEFAULT_CITY_EV);
    expect(results.timeTo100Kmh).not.toBeNull();
    if (results.timeTo100Kmh) {
      // 85 kW, 1250 kg compact EV typically achieves 0-100 in 7.0 - 9.5s
      expect(results.timeTo100Kmh).toBeGreaterThan(6.5);
      expect(results.timeTo100Kmh).toBeLessThan(10.0);
    }
    expect(results.timeTo60Kmh).toBeLessThan(results.timeTo100Kmh || 10);
    expect(results.timeSeries.length).toBeGreaterThan(10);
  });

  it('should show significantly faster acceleration for Performance EV', () => {
    const cityRes = simulateAcceleration(DEFAULT_CITY_EV);
    const perfRes = simulateAcceleration(DEFAULT_PERFORMANCE_EV);

    expect(perfRes.timeTo100Kmh).not.toBeNull();
    if (perfRes.timeTo100Kmh && cityRes.timeTo100Kmh) {
      // 320 kW AWD performance EV should beat 85 kW City EV by a large margin
      expect(perfRes.timeTo100Kmh).toBeLessThan(cityRes.timeTo100Kmh);
      expect(perfRes.timeTo100Kmh).toBeLessThan(4.5);
    }
  });
});

describe('Top Speed Solver', () => {
  it('should find deterministic top speed within realistic automotive envelope', () => {
    const cityTopSpeed = calculateTopSpeed(DEFAULT_CITY_EV);
    const perfTopSpeed = calculateTopSpeed(DEFAULT_PERFORMANCE_EV);

    expect(cityTopSpeed.topSpeedKmh).toBeGreaterThan(140);
    expect(cityTopSpeed.topSpeedKmh).toBeLessThan(185);

    expect(perfTopSpeed.topSpeedKmh).toBeGreaterThan(220);
    expect(perfTopSpeed.topSpeedKmh).toBeLessThan(280);

    expect(cityTopSpeed.equilibriumPoints.length).toBeGreaterThan(15);
  });
});

describe('Range Estimation', () => {
  it('should compute decreasing range at higher steady cruising speeds due to aero drag', () => {
    const range = calculateRange(DEFAULT_CITY_EV);
    expect(range.steadyState60Kmh).toBeGreaterThan(range.steadyState90Kmh);
    expect(range.steadyState90Kmh).toBeGreaterThan(range.steadyState120Kmh);
  });
});

describe('Drive Cycle Simulation with Regeneration', () => {
  it('should simulate WLTP cycle and compute positive regeneration when active', () => {
    const wltp = STANDARD_DRIVE_CYCLES[0];
    const results = simulateDriveCycle(DEFAULT_CITY_EV, wltp);

    expect(results.totalDistanceKm).toBeGreaterThan(5);
    expect(results.grossEnergyConsumedKwh).toBeGreaterThan(0);
    expect(results.energyRegeneratedKwh).toBeGreaterThan(0);
    expect(results.netEnergyConsumedKwh).toBeLessThan(results.grossEnergyConsumedKwh);
    expect(results.averageConsumptionWhPerKm).toBeGreaterThan(90);
    expect(results.averageConsumptionWhPerKm).toBeLessThan(220);
  });
});
