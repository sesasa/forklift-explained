import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL, area, hydraulics, stepLift, crankPosition, chainGeometry } from '../dist/physics.js';
const near = (actual, expected, tolerance=1e-8) => assert.ok(Math.abs(actual-expected)<tolerance, `${actual} != ${expected}`);
test('load force, cylinder pressure and the 2:1 reeving obey force balance',()=>{
  const h=hydraulics(750,1200,'raise',.2);
  near(h.cylinderPressure,62.452399669259734);
  near(h.cylinderForce,2*(750+MODEL.carriageMass)*MODEL.gravity);
  near(h.pistonSpeed,h.cylinderFlow/60000/area);
});
test('doubling rpm doubles flow and lifting speed without changing load pressure',()=>{
  const a=hydraulics(750,600,'raise',.2),b=hydraulics(750,1200,'raise',.2);
  near(b.pumpFlow,2*a.pumpFlow);near(b.pistonSpeed,2*a.pistonSpeed);near(a.cylinderPressure,b.cylinderPressure);
});
test('neutral holds the piston with cylinder pressure retained while the pump unloads',()=>{
  const h=hydraulics(750,1200,'hold',.35);
  near(h.cylinderFlow,0);near(h.pistonSpeed,0);near(stepLift(.35,100,h),.35);
  assert.ok(h.cylinderPressure>60);near(h.pumpPressure,3);near(h.pumpFlow,12);
});
test('gravity lowering returns oil and is independent of engine rpm',()=>{
  const a=hydraulics(750,600,'lower',.4),b=hydraulics(750,1800,'lower',.4);
  assert.ok(a.cylinderFlow<0);near(a.pistonSpeed,b.pistonSpeed);assert.ok(stepLift(.4,1,a)<.4);
  near(stepLift(.001,100,a),0);
});
test('end stop and excessive load open relief without extending beyond stroke',()=>{
  const end=hydraulics(750,1200,'raise',MODEL.stroke),heavy=hydraulics(2000,1200,'raise',.2);
  assert.ok(end.reliefOpen&&heavy.reliefOpen);near(end.cylinderPressure,120);near(heavy.pistonSpeed,0);
  near(stepLift(MODEL.stroke,10,end),MODEL.stroke);
});
test('the chain length stays constant and carriage travel is twice sheave travel',()=>{
  const a=chainGeometry(0),b=chainGeometry(73);
  const length=c=>c.anchorY+c.carriageY-2*c.sheaveY+Math.PI*c.radius;
  near(length(a),length(b));near(a.carriageY-b.carriageY,2*(a.sheaveY-b.sheaveY));
});
test('slider-crank connecting rod length is constant through both revolutions',()=>{
  for(let phase=0;phase<=Math.PI*4;phase+=.05){const p=crankPosition(phase);near(Math.hypot(p.x,p.y-p.pistonY),60);}
  near(crankPosition(Math.PI).pistonY-crankPosition(0).pistonY,36);
});
