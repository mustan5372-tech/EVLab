# EVLAB — Electric Vehicle Design, Powertrain Simulation & Optimization Platform

> **Design. Simulate. Optimize.**  
> An interactive engineering platform built for automobile/EV engineering students, researchers, and powertrain specialists.

[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-green?style=flat&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**EVLAB** bridges the gap between theoretical vehicle dynamics and real-world electric vehicle powertrain engineering. It provides an intuitive, high-performance simulation environment where users can configure vehicles down to individual battery cell chemistry and motor field-weakening parameters, validate electrical and mechanical limits, and simulate multi-dimensional performance across standard international regulatory drive cycles.

---

## 🚀 Core Features

### 1. ⚙️ Interactive Powertrain Designer
- **Vehicle Dynamics**: Curb weight, payload, frontal area, aerodynamic drag coefficient ($C_d$), rolling resistance coefficient ($C_{rr}$), wheel radius, and drivetrain layout (FWD, RWD, AWD).
- **Battery Architecture**: Series-parallel cell arrangement ($S \times P$), nominal pack voltage, usable capacity (kWh), continuous & peak C-rates, internal resistance ($R_i$), and automated pack weight calculation.
- **Traction Motor Model**: Support for **PMSM**, **BLDC**, **Induction**, **Switched Reluctance (SRM)**, and **Axial Flux** topologies. Configurable base RPM, max RPM, peak torque, and field-weakening regimes.
- **Transmission & Driveline**: Single-speed reduction, dual-speed transmissions, differential ratios, driveline mechanical efficiency, and tire adhesion limits.
- **Rule-Based Validation**: Real-time powertrain sanity checks detecting voltage mismatches, thermal headroom deficit, motor overspeed, and road-tire traction limits.

### 2. 📊 Dynamic Performance Simulation
- **Longitudinal Dynamics**: Runge-Kutta numerical integration of tractive effort against aerodynamic drag, rolling resistance, and gradient forces.
- **Acceleration Benchmarks**: $0–40$, $0–60$, $0–80$, $0–100$, and $0–120\text{ km/h}$ timings, along with standing quarter-mile ($402\text{ m}$) metrics.
- **Top Speed Equilibrium**: Analytical intersection of motor power limits and speed-squared drag dissipation.
- **Gradeability Matrix**: Maximum climbing gradient capabilities evaluated across continuous speeds up to $100\text{ km/h}$.
- **Steady-State Range**: Theoretical range and specific consumption ($\text{Wh/km}$) computed at $60$, $90$, and $120\text{ km/h}$.

### 3. ⏱️ Regulatory Drive Cycles & Regenerative Braking
- **Standardized Cycles**: Complete second-by-second velocity profiles for **WLTP Class 3**, **EPA UDDS (Urban)**, **EPA HWFET (Highway)**, **NEDC**, and **Constant 90 km/h Highway Cruise**.
- **Regen Braking Simulator**: 4 selectable regeneration strategies (None, Low, Medium, High / One-Pedal) modeling kinetic energy capture, motor generating efficiency, and battery acceptance limits.
- **Telemetry Charts**: Instantaneous velocity traces, tractive vs regen power profiles, and cumulative energy consumption / State of Charge (SoC) decay curves.

### 4. ⚖️ Multi-Vehicle Comparison Bench
- Side-by-side benchmarking of up to 4 custom EV configurations or OEM presets (**City Commuter**, **Performance Sedan**, **Commercial Delivery Van**, **Long-Range Highway Cruiser**).
- Comprehensive comparison matrix highlighting $0–100\text{ km/h}$, top speed, total battery capacity, peak power, gradeability, and specific efficiency.

### 5. 📚 Engineering Knowledge Base & Sandbox
- Interactive formula cards explaining aerodynamic drag, rolling resistance, traction motor envelopes, and battery pack mathematics.
- Real-time **Aero Drag Sandbox** demonstrating the quadratic relationship between velocity and aerodynamic power requirements.

### 6. 🛠️ Project Management & State Persistence
- Persistent project saving and configuration management via `localStorage`.
- Full JSON export and import capabilities for reproducible engineering workflows.
- Metric and Imperial unit conversion toggles.

---

## 📐 Mathematical & Physical Modeling

The simulation core adheres to classical longitudinal vehicle dynamics:

### Total Longitudinal Resistance:
$$F_{\text{total}} = F_{\text{aero}} + F_{\text{roll}} + F_{\text{grade}} + F_{\text{accel}}$$

Where:
- **Aerodynamic Drag**: $F_{\text{aero}} = \frac{1}{2} \rho \cdot C_d \cdot A \cdot v^2$
- **Rolling Resistance**: $F_{\text{roll}} = C_{rr} \cdot m \cdot g \cdot \cos(\theta)$
- **Grade Resistance**: $F_{\text{grade}} = m \cdot g \cdot \sin(\theta)$
- **Inertial Resistance**: $F_{\text{accel}} = m \cdot (1 + \delta) \cdot a$ (where $\delta$ is the rotational inertia coefficient)

### Motor Torque-Speed Envelope:
- **Constant Torque Region** ($n \le n_{\text{base}}$): $T(n) = T_{\text{max}}$
- **Field Weakening Region** ($n > n_{\text{base}}$): $T(n) = \frac{P_{\text{max}}}{\omega} = \frac{T_{\text{max}} \cdot n_{\text{base}}}{n}$

---

## 💻 Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Design System**: Samsung One UI Dark Aesthetics (Deep navy `#0B0F17`, glowing cyan `#00D2FF`, smooth pill cards, tabular numerals)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🏃 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/mustan5372-tech/EVLab.git
cd EVLab

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start designing and simulating electric vehicles!

### Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Running Tests

```bash
# Run physics & simulation engine unit tests
npm test
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
