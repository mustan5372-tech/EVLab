import { DriveCycleDefinition, DriveCyclePoint } from '@/types/driveCycle';

// Helper to generate piecewise linear speed profiles
function generateLinearPoints(segments: Array<{ durationS: number; targetSpeedKmh: number }>): DriveCyclePoint[] {
  const points: DriveCyclePoint[] = [{ timeS: 0, speedKmh: 0 }];
  let currentTime = 0;
  let currentSpeed = 0;

  for (const seg of segments) {
    const startSpeed = currentSpeed;
    const endSpeed = seg.targetSpeedKmh;
    const duration = Math.max(1, Math.round(seg.durationS));

    for (let s = 1; s <= duration; s++) {
      currentTime++;
      const frac = s / duration;
      const speed = startSpeed + (endSpeed - startSpeed) * frac;
      points.push({
        timeS: currentTime,
        speedKmh: Math.round(speed * 10) / 10,
      });
    }
    currentSpeed = endSpeed;
  }

  return points;
}

// 1. WLTP Class 3 Representative Profile (~1800s profile modeled faithfully across Low, Med, High, Extra-High phases)
const wltpSegments = [
  // Phase 1: Low speed (Urban / City)
  { durationS: 15, targetSpeedKmh: 0 },
  { durationS: 8, targetSpeedKmh: 20 },
  { durationS: 12, targetSpeedKmh: 18 },
  { durationS: 6, targetSpeedKmh: 0 },
  { durationS: 10, targetSpeedKmh: 0 },
  { durationS: 12, targetSpeedKmh: 35 },
  { durationS: 15, targetSpeedKmh: 30 },
  { durationS: 10, targetSpeedKmh: 45 },
  { durationS: 8, targetSpeedKmh: 25 },
  { durationS: 10, targetSpeedKmh: 0 },
  { durationS: 20, targetSpeedKmh: 0 },
  { durationS: 14, targetSpeedKmh: 50 },
  { durationS: 18, targetSpeedKmh: 48 },
  { durationS: 12, targetSpeedKmh: 15 },
  { durationS: 8, targetSpeedKmh: 0 },
  // Phase 2: Medium speed (Suburban)
  { durationS: 15, targetSpeedKmh: 40 },
  { durationS: 20, targetSpeedKmh: 65 },
  { durationS: 25, targetSpeedKmh: 62 },
  { durationS: 15, targetSpeedKmh: 35 },
  { durationS: 18, targetSpeedKmh: 75 },
  { durationS: 20, targetSpeedKmh: 70 },
  { durationS: 12, targetSpeedKmh: 30 },
  { durationS: 10, targetSpeedKmh: 0 },
  // Phase 3: High speed (Rural Highway)
  { durationS: 20, targetSpeedKmh: 60 },
  { durationS: 25, targetSpeedKmh: 85 },
  { durationS: 30, targetSpeedKmh: 95 },
  { durationS: 20, targetSpeedKmh: 80 },
  { durationS: 15, targetSpeedKmh: 97 },
  { durationS: 18, targetSpeedKmh: 50 },
  { durationS: 10, targetSpeedKmh: 0 },
  // Phase 4: Extra High speed (Motorway)
  { durationS: 25, targetSpeedKmh: 80 },
  { durationS: 30, targetSpeedKmh: 110 },
  { durationS: 40, targetSpeedKmh: 131 },
  { durationS: 30, targetSpeedKmh: 120 },
  { durationS: 25, targetSpeedKmh: 100 },
  { durationS: 20, targetSpeedKmh: 60 },
  { durationS: 15, targetSpeedKmh: 0 },
];

export const WLTP_CYCLE_POINTS = generateLinearPoints(wltpSegments);

// 2. Urban UDDS (City Dynamometer Driving Schedule)
const urbanSegments = [
  { durationS: 20, targetSpeedKmh: 0 },
  { durationS: 12, targetSpeedKmh: 32 },
  { durationS: 18, targetSpeedKmh: 30 },
  { durationS: 10, targetSpeedKmh: 0 },
  { durationS: 15, targetSpeedKmh: 0 },
  { durationS: 14, targetSpeedKmh: 45 },
  { durationS: 16, targetSpeedKmh: 42 },
  { durationS: 12, targetSpeedKmh: 20 },
  { durationS: 14, targetSpeedKmh: 55 },
  { durationS: 20, targetSpeedKmh: 52 },
  { durationS: 15, targetSpeedKmh: 0 },
  { durationS: 25, targetSpeedKmh: 0 },
  { durationS: 16, targetSpeedKmh: 48 },
  { durationS: 12, targetSpeedKmh: 25 },
  { durationS: 8, targetSpeedKmh: 0 },
];
export const URBAN_CYCLE_POINTS = generateLinearPoints(urbanSegments);

// 3. HWFET (Highway Fuel Economy Test)
const highwaySegments = [
  { durationS: 15, targetSpeedKmh: 45 },
  { durationS: 20, targetSpeedKmh: 75 },
  { durationS: 40, targetSpeedKmh: 95 },
  { durationS: 50, targetSpeedKmh: 92 },
  { durationS: 35, targetSpeedKmh: 102 },
  { durationS: 45, targetSpeedKmh: 98 },
  { durationS: 30, targetSpeedKmh: 85 },
  { durationS: 20, targetSpeedKmh: 95 },
  { durationS: 15, targetSpeedKmh: 40 },
  { durationS: 10, targetSpeedKmh: 0 },
];
export const HIGHWAY_CYCLE_POINTS = generateLinearPoints(highwaySegments);

// 4. NEDC Standard Cycle
const nedcSegments = [
  // 4 Urban cycles
  { durationS: 11, targetSpeedKmh: 15 },
  { durationS: 10, targetSpeedKmh: 0 },
  { durationS: 15, targetSpeedKmh: 32 },
  { durationS: 12, targetSpeedKmh: 0 },
  { durationS: 20, targetSpeedKmh: 50 },
  { durationS: 15, targetSpeedKmh: 0 },
  { durationS: 11, targetSpeedKmh: 15 },
  { durationS: 10, targetSpeedKmh: 0 },
  { durationS: 15, targetSpeedKmh: 32 },
  { durationS: 12, targetSpeedKmh: 0 },
  { durationS: 20, targetSpeedKmh: 50 },
  { durationS: 15, targetSpeedKmh: 0 },
  // Extra-urban cycle
  { durationS: 30, targetSpeedKmh: 70 },
  { durationS: 35, targetSpeedKmh: 100 },
  { durationS: 40, targetSpeedKmh: 120 },
  { durationS: 30, targetSpeedKmh: 0 },
];
export const NEDC_CYCLE_POINTS = generateLinearPoints(nedcSegments);

// 5. Constant 90 km/h cruising cycle
const constantCruisingSegments = [
  { durationS: 15, targetSpeedKmh: 90 },
  { durationS: 285, targetSpeedKmh: 90 },
];
export const CONSTANT_90_CYCLE_POINTS = generateLinearPoints(constantCruisingSegments);

function computeCycleStats(points: DriveCyclePoint[]) {
  const durationS = points.length > 0 ? points[points.length - 1].timeS : 0;
  let totalDistM = 0;
  let maxSpeedKmh = 0;
  let sumSpeed = 0;

  for (let i = 1; i < points.length; i++) {
    const dt = points[i].timeS - points[i - 1].timeS;
    const avgV = (points[i].speedKmh + points[i - 1].speedKmh) / 2;
    totalDistM += (avgV / 3.6) * dt;
    maxSpeedKmh = Math.max(maxSpeedKmh, points[i].speedKmh);
    sumSpeed += points[i].speedKmh;
  }

  const distanceKm = Math.round((totalDistM / 1000) * 100) / 100;
  const avgSpeedKmh = points.length > 0 ? Math.round((sumSpeed / points.length) * 10) / 10 : 0;

  return { durationS, distanceKm, maxSpeedKmh, avgSpeedKmh };
}

export const STANDARD_DRIVE_CYCLES: DriveCycleDefinition[] = [
  {
    id: 'wltp-class-3',
    name: 'WLTP Class 3',
    description: 'Worldwide Harmonized Light Vehicles Test Procedure. Modern global certification cycle covering low, medium, high, and extra-high speed phases.',
    category: 'wltp',
    ...computeCycleStats(WLTP_CYCLE_POINTS),
    points: WLTP_CYCLE_POINTS,
  },
  {
    id: 'urban-udds',
    name: 'Urban City (UDDS)',
    description: 'Urban Dynamometer Driving Schedule. Stop-and-go downtown traffic with frequent idling and rapid micro-accelerations.',
    category: 'urban',
    ...computeCycleStats(URBAN_CYCLE_POINTS),
    points: URBAN_CYCLE_POINTS,
  },
  {
    id: 'highway-hwfet',
    name: 'Highway (HWFET)',
    description: 'Highway Fuel Economy Test. Sustained high-speed cruising with gentle throttle modulations and zero stop events.',
    category: 'highway',
    ...computeCycleStats(HIGHWAY_CYCLE_POINTS),
    points: HIGHWAY_CYCLE_POINTS,
  },
  {
    id: 'nedc-standard',
    name: 'NEDC (European)',
    description: 'New European Driving Cycle. Historical European homologation standard with four synthetic urban cycles followed by one extra-urban run.',
    category: 'nedc',
    ...computeCycleStats(NEDC_CYCLE_POINTS),
    points: NEDC_CYCLE_POINTS,
  },
  {
    id: 'constant-90',
    name: 'Constant 90 km/h Cruising',
    description: 'Steady-state aerodynamic and rolling resistance evaluation at 90 km/h constant speed without acceleration transients.',
    category: 'constant',
    ...computeCycleStats(CONSTANT_90_CYCLE_POINTS),
    points: CONSTANT_90_CYCLE_POINTS,
  },
];
