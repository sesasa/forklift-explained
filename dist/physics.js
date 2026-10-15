export const MODEL = Object.freeze({ bore: 0.06, pumpDisplacement: 10e-6, carriageMass: 150, chainRatio: 2, stroke: 0.75, reliefBar: 120, gravity: 9.81, displayTimeScale: 0.45 });
export const area = Math.PI * MODEL.bore ** 2 / 4;
export function hydraulics(load, rpm, valve, extension) {
  const loadPressure = (load + MODEL.carriageMass) * MODEL.gravity * MODEL.chainRatio / area / 1e5;
  const pumpFlow = MODEL.pumpDisplacement * rpm * 1000;
  const endStop = valve === 'raise' && extension >= MODEL.stroke - 1e-6;
  const overload = loadPressure >= MODEL.reliefBar;
  const moving = valve === 'raise' ? !endStop && !overload : valve === 'lower' && extension > 0;
  // Gravity lowering is metered independently of engine speed (8 L/min in this example).
  const cylinderFlow = moving ? (valve === 'raise' ? pumpFlow : -8) : 0;
  const cylinderPressure = endStop || (valve === 'raise' && overload) ? MODEL.reliefBar : extension <= 0 && valve !== 'raise' ? 0 : loadPressure;
  return { pumpFlow, cylinderFlow, cylinderPressure, pumpPressure: valve === 'raise' ? cylinderPressure : 3, loadPressure, endStop, reliefOpen: endStop || (valve === 'raise' && overload), pistonSpeed: cylinderFlow / 60000 / area, forkHeight: extension * MODEL.chainRatio, cylinderForce: cylinderPressure * 1e5 * area };
}
export function stepLift(extension, dt, state) { return Math.max(0, Math.min(MODEL.stroke, extension + state.pistonSpeed * dt * MODEL.displayTimeScale)); }
export function crankPosition(phase, radius = 18, rodLength = 60) {
  const x = radius * Math.sin(phase), y = -radius * Math.cos(phase);
  return { x, y, pistonY: y - Math.sqrt(rodLength ** 2 - x ** 2) };
}
export function chainGeometry(extensionPixels) {
  return { sheaveY: 295 - extensionPixels, carriageY: 527 - 2 * extensionPixels, anchorY: 531, radius: 26 };
}
