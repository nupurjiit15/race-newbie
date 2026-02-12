# BMW Duel Racing (Zero-Dependency Browser Build)

A realistic-feeling **3D-style racing game** using only vanilla JavaScript and HTML5 Canvas (no npm install, no external libraries).

## What You Get
- Two selectable cars:
  - **BMW M340i**: faster acceleration, sharper handling, higher top-end feel
  - **BMW X5**: heavier, slower to accelerate, better stability and traction
- Third-person chase camera
- Keyboard driving controls
- Engine sound logic (Web Audio API)
- Speedometer + RPM meter
- AI opponent
- Track boundaries with collision response
- 3-lap race logic

## Run (No npm, No Dependencies)
Any static server works:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

> You can also open `index.html` directly, but browsers may restrict module loading from `file://` URLs.

## Controls
- `W` / `↑`: throttle
- `S` / `↓`: brake
- `A` / `←`: steer left
- `D` / `→`: steer right
- `Space`: handbrake

## Physics Formulas Used
Implemented in `src/physics/vehiclePhysics.js`.

1. Power conversion: `P(W) = HP * 745.7`
2. Engine torque curve (approx): `T(rpm) = T_peak * curve(rpm) * throttle`
3. Wheel force: `F_wheel = (T_engine * gear * finalDrive * eta) / wheelRadius`
4. Aerodynamic drag: `F_drag = 0.5 * rho * Cd * A * v^2`
5. Rolling resistance: `F_rr = Crr * m * g`
6. Brake force: `F_brake = brake * m * g * grip`
7. Traction cap: `F_max = m * g * grip(speed)`

Net longitudinal force:
`F_net = F_drive - (F_drag + F_rr + F_brake)`

Acceleration:
`a = F_net / m`

## Suspension + Handling Differences
- M340i uses stiffer suspension and faster steering response for sharper turn-in.
- X5 uses softer suspension and higher grip bias for stability and reduced twitchiness.
- Suspension values influence body roll/pitch in rendering and steering stability behavior.

## Folder Structure
```text
race-newbie/
├─ index.html
├─ README.md
└─ src/
   ├─ main.js
   ├─ styles.css
   ├─ ai/
   │  └─ OpponentAI.js
   ├─ audio/
   │  └─ EngineSound.js
   ├─ core/
   │  ├─ controls.js
   │  ├─ LapSystem.js
   │  └─ SoftwareRenderer.js
   ├─ physics/
   │  └─ vehiclePhysics.js
   ├─ track/
   │  └─ createTrack.js
   ├─ ui/
   │  └─ GameUI.js
   └─ vehicles/
      ├─ Car.js
      └─ carConfigs.js
```

## Architecture Notes
- `vehicles/Car.js`: per-car drivetrain, gear shifting, steering, roll/pitch, kinematics.
- `physics/vehiclePhysics.js`: pure physics formulas for forces and constraints.
- `core/SoftwareRenderer.js`: dependency-free perspective renderer and chase camera.
- `ai/OpponentAI.js`: waypoint-based virtual driver returning input controls.
- `track/createTrack.js`: track layout + boundary correction/collision response.
- `core/LapSystem.js`: finish-line crossing + checkpoint-gated lap increments.
- `ui/GameUI.js`: car selection and HUD updates.

This keeps modules clean and makes it easy to tune physics or swap rendering/AI later.
