import { MODEL, hydraulics, stepLift, crankPosition, chainGeometry } from './physics.js';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const chapters = [
  { name:'Overview', kicker:'THE BIG PICTURE', title:'From fuel<br>to lifting force.', symbol:'↗', duration:10, camera:[100,110,980,565], description:'An LPG forklift is an energy-conversion machine. Follow the engine, pump, valve and lift cylinder to see how a pallet leaves the ground.', label:'THE ENERGY PATH', formula:'Chemical → mechanical → hydraulic → motion', detail:'Start with the whole system, then travel inside each component. The cutaways reveal what the bodywork normally hides.', note:'One machine. A connected chain of energy.' },
  { name:'Combustion', kicker:'01 / MAKE THE POWER', title:'A spark starts<br>the story.', symbol:'ϟ', duration:26, camera:[223,282,260,207], description:'LPG passes through a vaporizer and mixes with air. The piston draws in the mixture, compresses it, then a spark ignites it. Expanding hot gas pushes the piston down.', label:'THE FOUR-STROKE CYCLE', formula:'Intake → compress → power → exhaust', detail:'The connecting rod turns the crankshaft. One power stroke occurs every two crankshaft revolutions. One representative cylinder is shown in slow motion.', note:'Watch the spark, the piston, and the rotating crankshaft.' },
  { name:'Transmission', kicker:'02 / TRANSFER ROTATION', title:'Keep the<br>power turning.', symbol:'⟳', duration:16, camera:[260,305,370,255], description:'The crankshaft delivers torque through a mechanical power take-off. A shaft and meshing gears turn the hydraulic pump whenever the engine is running.', label:'MECHANICAL POWER', formula:'Power = torque × angular speed', detail:'The view pulls back from the working engine to reveal the connection. The wheel-drive transmission is a separate branch; lifting does not require the truck to move.', note:'The pale-gold shaft carries rotation from engine to pump.' },
  { name:'Pump', kicker:'03 / MOVE THE OIL', title:'Rotation<br>becomes flow.', symbol:'◌', duration:22, camera:[449,373,145,148], description:'Meshing gears draw oil from the reservoir. Oil travels around the outside of the gears in pockets between the teeth and housing, then exits toward the valve.', label:'PUMP FLOW', formula:'Q ≈ displacement × rpm', detail:'A pump moves oil. Pressure rises when the load resists that flow. The meshing teeth prevent oil from taking a shortcut through the center.', note:'Follow the oil around the outside of the two gears.' },
  { name:'Control valve', kicker:'04 / CHOOSE THE PATH', title:'One valve.<br>Three decisions.', symbol:'⇄', duration:24, camera:[553,287,207,202], description:'Raise connects pump port P to cylinder port A. Hold blocks A, trapping oil under the piston while the pump circulates oil back to tank through T.', label:'RAISE · HOLD · LOWER', formula:'P → A   /   A blocked   /   A → T', detail:'Lower meters oil from A to T. Gravity moves the piston down. The separate pressure-relief valve limits pump pressure if flow is blocked.', note:'Watch the spool change position and redirect the oil.' },
  { name:'Cylinder', kicker:'05 / CREATE LINEAR FORCE', title:'Pressure<br>pushes upward.', symbol:'↑', duration:18, camera:[690,175,230,415], description:'Oil enters below the piston in the single-acting lift cylinder. Pressure acts over the piston area, pushing the rod and its chain sheave upward.', label:'FROM PRESSURE TO FORCE', formula:'F = pressure × piston area', detail:'Flow determines how fast the piston moves: v = Q / A. The rising oil volume extends the rod; the oil itself barely compresses.', note:'The oil chamber grows as the piston and rod rise.' },
  { name:'Chains', kicker:'06 / TRANSFER THE MOVEMENT', title:'A small stroke.<br>Twice the travel.', symbol:'⇈', duration:18, camera:[705,184,277,404], description:'One end of the chain is fixed to the mast. The chain runs over a moving sheave on the piston rod; the other end is attached to the fork carriage.', label:'ILLUSTRATED 2:1 REEVING', formula:'Fork travel = 2 × piston travel', detail:'The cylinder must provide approximately twice the lifted weight force. Extra travel comes at the cost of extra cylinder force, not free energy.', note:'The sheave rises once. The carriage rises twice as far.' },
  { name:'Lift', kicker:'07 / DO THE WORK', title:'And the pallet<br>leaves the floor.', symbol:'↗', duration:18, camera:[100,110,980,565], description:'The carriage carries the forks and pallet up the mast. The full system is now connected: combustion, rotation, oil flow, piston force, and chain movement.', label:'THE WORK BEING DONE', formula:'Energy → load × gravity × height', detail:'A heavier load needs more pressure. More pump flow makes the same load rise faster. The counterweight helps balance the forward load.', note:'Zooming out: every component is working together.' },
  { name:'Hold & lower', kicker:'08 / COMPLETE THE CYCLE', title:'Hold steady.<br>Lower smoothly.', symbol:'↓', duration:22, camera:[462,229,550,365], description:'In hold, the cylinder port closes and oil supports the raised load. For lowering, the valve opens a metered return path. The load pushes oil back to the reservoir.', label:'GRAVITY DOES THE RETURN WORK', formula:'Cylinder → valve → reservoir', detail:'The pump keeps circulating through the open-center path; it does not pull the piston down. The filter cleans return oil before the next cycle.', note:'Trapped oil holds the pallet. Metered return flow lowers it.' },
];
let totalDuration = 0;
const narration = [
 'Start with the whole forklift. Follow the energy from LPG fuel, through the engine and hydraulic system, to the lifting forks.',
 'LPG becomes vapor and mixes with air. The piston draws the mixture in, then compresses it. A spark ignites the mixture. Expanding gas drives the piston down, and the connecting rod turns the crankshaft. Finally, the exhaust valve opens. This four-stroke cycle repeats as we pull back to follow the power.',
 'The engine keeps turning. A mechanical power take-off carries torque through gears and a shaft to the hydraulic pump. The pump can run while the forklift remains stationary.',
 'Inside the pump, two gears turn in opposite directions. Oil from the reservoir travels around the outside of the gears, between the teeth and housing. It exits toward the valve. The pump creates flow; resistance from the load creates pressure.',
 'The control valve chooses the oil path. Raise connects the pump to the cylinder. Hold blocks the cylinder port, trapping oil beneath the piston, while pump flow returns to tank. Lower opens a metered path from the cylinder back to the reservoir. A separate relief valve limits excess pressure.',
 'Oil enters below the piston. Pressure acts across the piston area to produce upward force. As more oil flows in, the piston and rod extend. Pressure determines available force; flow determines how quickly the piston moves.',
 'One chain end is fixed to the mast. The chain passes over the moving sheave and down to the carriage. When the sheave rises, the forks travel twice as far. The cylinder must supply twice the load force.',
 'Now watch the whole system work together. Combustion becomes rotation. The rotating pump moves oil. Oil pressure pushes the piston, and the chain raises the pallet. A heavier load needs more pressure. More flow makes the lift faster.',
 'First, the valve holds the load by trapping oil under the piston. Then the return path opens. Gravity lowers the pallet, pushing oil through the valve and filter to the reservoir. The pump keeps circulating; it does not pull the piston down. The cycle is complete.',
];
chapters.forEach((c) => { c.start = totalDuration; totalDuration += c.duration; });
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { time:0, playing:false, speed:1, chapter:0, phase:0, manual:false, valve:'hold', extension:0, load:750, rpm:1200, narration:false, labels:true, camera:[...chapters[0].camera], targetCamera:[...chapters[0].camera], previous:0, voiceKey:'', overview:false };
const camera = (values) => values.join(' ');
const gear = (cx, cy, radius, teeth, id, fill='#b4c0b8') => {
  const points=[];
  for(let i=0;i<teeth*4;i++){const a=(i/(teeth*4))*Math.PI*2, r=(i%4===1||i%4===2)?radius:radius*.8;points.push(`${(Math.cos(a)*r).toFixed(2)},${(Math.sin(a)*r).toFixed(2)}`);}
  return `<g transform="translate(${cx} ${cy})"><g id="${id}"><polygon points="${points.join(' ')}" fill="${fill}" stroke="#e6e3bb" stroke-width=".7"/><circle r="${radius*.47}" fill="#344b52" stroke="#ced4c0" stroke-width="1"/><path d="M-${radius*.4} 0h${radius*.8}M0 -${radius*.4}v${radius*.8}" stroke="#70837f" stroke-width="2"/><circle r="${radius*.17}" fill="#e5dcae"/></g></g>`;
};
const wheel = (x,y,r) => `<g transform="translate(${x} ${y})"><ellipse cx="7" cy="4" rx="${r}" ry="${r*1.02}" fill="#080f13"/><circle r="${r}" fill="url(#tire)" stroke="#405158" stroke-width="1.5"/><circle r="${r*.77}" fill="none" stroke="#35444b" stroke-width="3" stroke-dasharray="3 6"/><circle r="${r*.48}" fill="url(#metal)" stroke="#152127" stroke-width="4"/><circle r="${r*.25}" fill="#354a54" stroke="#94a2a7" stroke-width="2"/>${Array.from({length:6},(_,i)=>`<circle cx="${Math.cos(i*Math.PI/3)*r*.34}" cy="${Math.sin(i*Math.PI/3)*r*.34}" r="2" fill="#d6dfe0"/>`).join('')}</g>`;
const svg = $('machine');
svg.innerHTML += `<defs>
  <linearGradient id="yellow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffbc64"/><stop offset=".52" stop-color="#e69234"/><stop offset="1" stop-color="#b76720"/></linearGradient>
  <linearGradient id="yellowSide" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bf6b22"/><stop offset="1" stop-color="#885020"/></linearGradient>
  <linearGradient id="metal"><stop stop-color="#526975"/><stop offset=".4" stop-color="#c5d3d8"/><stop offset=".55" stop-color="#879ba4"/><stop offset="1" stop-color="#435965"/></linearGradient>
  <linearGradient id="rod"><stop stop-color="#6c8290"/><stop offset=".45" stop-color="#eff5f4"/><stop offset=".6" stop-color="#bed4dd"/><stop offset="1" stop-color="#5f7e8c"/></linearGradient>
  <linearGradient id="oil" x1="0" x2="1"><stop stop-color="#db694b" stop-opacity=".55"/><stop offset=".55" stop-color="#ff9670" stop-opacity=".8"/><stop offset="1" stop-color="#c65340" stop-opacity=".6"/></linearGradient>
  <linearGradient id="lpg"><stop stop-color="#acbec4"/><stop offset=".4" stop-color="#e3ece9"/><stop offset="1" stop-color="#6f868e"/></linearGradient>
  <radialGradient id="tire"><stop offset=".48" stop-color="#26353b"/><stop offset=".6" stop-color="#151f25"/><stop offset=".9" stop-color="#111b21"/><stop offset="1" stop-color="#263840"/></radialGradient>
  <radialGradient id="shadow"><stop stop-color="#02080d" stop-opacity=".65"/><stop offset="1" stop-color="#02080d" stop-opacity="0"/></radialGradient>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.2"/></filter>
  <pattern id="floor-grid" width="65" height="38" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)"><path d="M65 0H0V38" stroke="#54717c" stroke-opacity=".13" fill="none"/></pattern>
  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 6L6 0M5 7L7 5" stroke="#b5d5dd" stroke-width=".6" stroke-opacity=".18"/></pattern>
  <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="#ff8065"/></marker>
</defs>
<g id="world">
 <g id="chassis-context">
  <path d="M80 573L796 430L1120 588L450 750Z" fill="url(#floor-grid)"/>
  <ellipse cx="582" cy="582" rx="420" ry="51" fill="url(#shadow)"/>
  <path d="M224 499L295 455L706 455L754 500L688 546L260 546Z" fill="#172329" stroke="#43575e"/>
  ${wheel(675,515,56)}${wheel(270,525,47)}
  <path d="M207 377Q206 358 227 352L381 345L438 393L458 508L221 508Q193 490 194 458Z" fill="url(#yellowSide)" stroke="#dc974d" stroke-width="1"/>
  <path d="M192 390L217 367L393 367L445 416L425 520L215 520Q192 502 191 477Z" fill="url(#yellow)"/>
  <path d="M194 459H275L280 506H213Q195 487 194 459Z" fill="#d48735"/>
  <path d="M404 415L622 411L703 478L681 527L411 527Z" fill="#d08b3b" stroke="#ffc379" stroke-width="1"/>
  <path d="M439 423H615L657 480H463Z" fill="#172931" stroke="#a4a087"/>
  <path d="M624 411L685 383L747 444L702 478Z" fill="#725733"/>
  <path d="M609 495H648M608 503H649M607 511H650" stroke="#212f32" stroke-width="3"/>
  <path d="M221 361L228 183L556 180L679 238L682 400" fill="none" stroke="#0d171c" stroke-width="14" stroke-linejoin="round"/>
  <path d="M245 354L250 206H557L628 240L630 405" fill="none" stroke="#4f6873" stroke-width="8" stroke-linejoin="round"/>
  <path d="M229 182L281 154L594 154L680 196L679 221L556 182Z" fill="#51636a" stroke="#71818a" stroke-width="1.5"/>
  <path d="M252 171L566 171M310 158L364 182M384 158L438 182M460 158L514 182M537 158L592 195" stroke="#0f1c22" stroke-width="7"/>
  <path d="M560 190L550 340" stroke="#314852" stroke-width="7"/>
  <path d="M393 316L432 329L433 378L470 389L472 405L418 405L396 383Z" fill="#121b1f" stroke="#58717d" stroke-width="1.5"/>
  <path d="M402 320L419 327L420 377" fill="none" stroke="#344953" stroke-width="4"/>
  <path d="M552 401L569 327" stroke="#59717a" stroke-width="7"/><ellipse cx="572" cy="319" rx="27" ry="8" transform="rotate(-22 572 319)" fill="#112129" stroke="#84979e" stroke-width="4"/>
  <path d="M597 387L604 348M611 391L620 352" stroke="#96a6a8" stroke-width="3"/><circle cx="604" cy="345" r="5" fill="#18292f" stroke="#79919c"/><circle cx="620" cy="349" r="5" fill="#18292f" stroke="#79919c"/>
  <path d="M264 267V232Q264 224 274 224H282" fill="none" stroke="#273a43" stroke-width="9"/>
  <path d="M214 431H233M212 441H234M213 451H235" stroke="#5e492e" stroke-width="3"/>
  <path d="M701 189L726 171L751 550L722 562Z" fill="#1b303b" stroke="#526b76" stroke-width="2"/>
  <path d="M736 176H752L785 550H764Z" fill="#2f4651" stroke="#647e8a" stroke-width="2"/>
  <path d="M737 192L779 192M748 299L788 299M758 422L799 422M769 538L810 538" stroke="#597380" stroke-width="8"/>
  ${wheel(292,538,49)}${wheel(640,542,64)}
  <path d="M212 476h29" stroke="#f8c384" stroke-width="3"/><text x="222" y="407" font-size="10" font-family="monospace" fill="#593d24" letter-spacing="2">LPG</text>
 </g>
 <g id="fuel-assembly" class="component-hotspot" data-chapter="1" tabindex="0" role="button" aria-label="Explore LPG combustion engine">
  <rect class="focus-ring" x="235" y="278" width="179" height="208" rx="15"/>
  <g transform="translate(248 280) rotate(-3)"><rect x="0" y="0" width="115" height="48" rx="22" fill="url(#lpg)" stroke="#d5e3e3" stroke-width="1.1"/><ellipse cx="107" cy="24" rx="8" ry="18" fill="#536b75" stroke="#bcd0d4"/><path d="M23 1V47M84 1V47" stroke="#354e59" stroke-width="6"/><rect x="114" y="16" width="11" height="16" rx="2" fill="#c6b17d"/><path d="M119 13v-5m-6 0h12" stroke="#a88156" stroke-width="3"/><text x="44" y="29" font-size="10" fill="#3f555e" font-family="monospace" letter-spacing="1">LPG</text></g>
  <path id="fuel-line" d="M372 299H384V340H266V350H290" class="flow-track" stroke="#cdb080" stroke-width="3"/>
  <rect x="373" y="321" width="22" height="19" rx="4" fill="#839096" stroke="#c8dddf"/><path d="M376 327h16m-16 7h16" stroke="#485c68"/>
 </g>
 <g id="engine-assembly" class="component-hotspot" data-chapter="1">
  <path d="M277 350L351 350L371 367V475H272V365Z" fill="#30444a" stroke="#b59e79" stroke-width="1.8"/>
  <rect x="289" y="344" width="59" height="82" fill="#102129" stroke="#b9c9c7" stroke-width="3"/>
  <rect id="engine-gas" x="292" y="347" width="53" height="30" fill="#7bc5df" opacity=".32"/>
  <path d="M279 352H286M279 361H286M279 370H286M279 379H286M279 388H286M354 352H364M354 361H364M354 370H364M354 379H364M354 388H364" stroke="#90a3a4" stroke-width="2"/>
  <rect x="286" y="334" width="66" height="13" rx="2" fill="url(#metal)" stroke="#d3d6bd" stroke-width=".8"/>
  <g id="intake-valve"><path d="M301 330v18m-5 0h10" stroke="#acd9d8" stroke-width="2"/></g><g id="exhaust-valve"><path d="M337 330v18m-5 0h10" stroke="#bdc7bc" stroke-width="2"/></g>
  <path d="M317 329v-10" stroke="#e3d9c1" stroke-width="5"/><path d="M317 328v7" stroke="#c4b26b" stroke-width="2"/>
  <path id="spark" d="M318 340L314 346L321 344L317 352M312 340L309 337M323 340L327 338" stroke="#ffdd8c" fill="none" stroke-width="1.7"/>
  <path id="intake-dots" d="M275 347H301V357" stroke="#a9e5ed" stroke-width="1.7" stroke-dasharray="2 4" fill="none"/>
  <path id="exhaust-dots" d="M337 357V345H365V329" stroke="#bdd1d5" stroke-width="1.7" stroke-dasharray="2 4" fill="none"/>
  <rect x="279" y="426" width="83" height="44" rx="8" fill="#172a33" stroke="#6e878a"/>
  <circle cx="318" cy="456" r="22" fill="#354d52" stroke="#6c8485" stroke-width="1"/>
  <path id="crank-arm" d="M318 456L318 438" stroke="#ead5a5" stroke-width="9" stroke-linecap="round"/>
  <path id="connecting-rod" d="M318 438L318 378" stroke="#b8c9ca" stroke-width="5" stroke-linecap="round"/>
  <circle id="crank-pin" cx="318" cy="438" r="4" fill="#506972" stroke="#efe2b8"/>
  <g id="engine-piston"><rect x="292" y="364" width="53" height="21" rx="1" fill="url(#metal)" stroke="#e3e8d9" stroke-width=".7"/><path d="M292 369H345M292 372H345" stroke="#132b33" stroke-width="1.4"/><circle cx="318" cy="378" r="3" fill="#354d58"/></g>
  <circle cx="318" cy="456" r="5" fill="#e0cd9d" stroke="#f7eacc"/>
  <path d="M319 470H371L388 489H280L273 470" fill="#354d55" stroke="#97aaab"/><path d="M290 477H370M288 482H374" stroke="#1a3039" stroke-width="2"/>
 </g>
 <g id="drive-assembly" class="component-hotspot" data-chapter="2" tabindex="0" role="button" aria-label="Explore the mechanical power transmission">
  <rect class="focus-ring" x="366" y="426" width="121" height="64" rx="6"/>
  <path d="M340 456H425" stroke="#14242c" stroke-width="14"/>
  <path d="M340 456H425" stroke="url(#rod)" stroke-width="9"/>
  <path d="M389 450v12M394 450v12M399 450v12" stroke="#dec691" stroke-width="2"/>
  <path d="M412 437L447 412L479 434L451 479L415 478Z" fill="#263b44" stroke="#657d80"/>
  ${gear(430,454,23,14,'drive-gear-a','#c4b781')}${gear(458,425,19,12,'drive-gear-b','#bca972')}
  <path d="M458 425L473 425L498 466H518" stroke="#263b41" stroke-width="12" fill="none" stroke-linejoin="round"/><path d="M458 425L473 425L498 466H518" stroke="url(#rod)" stroke-width="7" fill="none" stroke-linejoin="round"/>
  <g id="shaft-marks"><path d="M478 436l5-3M482 443l5-3M486 450l5-3" stroke="#ecce91" stroke-width="2"/><circle cx="473" cy="425" r="4.3" fill="#a9b9ae" stroke="#e6d3a1"/><circle cx="498" cy="466" r="4.3" fill="#a9b9ae" stroke="#e6d3a1"/></g>
 </g>
 <g id="hydraulic-lines">
  <path id="suction-path" d="M495 536H478V447H489" class="flow-track" stroke="#63b4d0" stroke-width="5"/>
  <path id="pressure-path" d="M549 447H575V366H615" class="flow-track" stroke="#ff8065" stroke-width="4"/>
  <path id="cylinder-path" d="M654 353V316H723V547H775V531" class="flow-track" stroke="#ff8065" stroke-width="4"/>
  <path id="return-path" d="M647 387V516H555V536H542" class="flow-track" stroke="#63b4d0" stroke-width="4"/>
  <path id="relief-path" d="M575 478H608V516H555" class="flow-track" stroke="#668e9e" stroke-width="2.5"/>
  <path d="M575 447V478" stroke="#ff8065" stroke-width="3"/>
  <rect x="594" y="464" width="26" height="25" rx="2" fill="#2b414d" stroke="#7e989f"/>
  <path d="M598 483L608 471L614 481M599 468L602 465L605 468L608 465L611 468L614 465" fill="none" stroke="#e2cbaa" stroke-width="1"/>
  <path d="M576 367V344" stroke="#86a0a9" stroke-width="2"/><circle cx="576" cy="334" r="12" fill="#182b35" stroke="#a9b4ae" stroke-width="1.5"/><path d="M568 338A9 9 0 0 1 584 338" stroke="#607f88" fill="none" stroke-width="1.5"/><path id="gauge-needle" d="M576 334L570 336" stroke="#ff9674" stroke-width="1.3"/>
 </g>
 <g id="pump-assembly" class="component-hotspot" data-chapter="3" tabindex="0" role="button" aria-label="Explore the hydraulic gear pump">
  <rect class="focus-ring" x="479" y="392" width="80" height="108" rx="12"/>
  <path d="M489 421Q490 399 518 399Q547 399 549 421V471Q547 492 518 492Q490 492 489 471Z" fill="#3c5660" stroke="#94abb0" stroke-width="2"/>
  <path d="M494 421Q496 405 518 405Q542 405 544 421V471Q542 486 518 486Q496 486 494 471Z" fill="#172c37" stroke="#617f8d" stroke-width="1"/>
  <path id="pump-upper-path" d="M488 447C491 443 491 408 517 405C541 406 544 440 549 447" fill="none" stroke="#6cb7d0" stroke-opacity=".28" stroke-width="5"/>
  <path id="pump-lower-path" d="M488 447C491 451 491 484 517 486C541 485 544 454 549 447" fill="none" stroke="#6cb7d0" stroke-opacity=".28" stroke-width="5"/>
  ${gear(518,425,22,14,'pump-gear-a','#9eaba8')}${gear(518,466,22,14,'pump-gear-b','#9eaba8')}
  <circle cx="493" cy="401" r="2" fill="#cbd7d8"/><circle cx="543" cy="401" r="2" fill="#cbd7d8"/><circle cx="493" cy="490" r="2" fill="#cbd7d8"/><circle cx="543" cy="490" r="2" fill="#cbd7d8"/>
 </g>
 <g id="tank-assembly">
  <rect x="495" y="511" width="47" height="42" rx="4" fill="#223f4d" stroke="#9ab4bc" stroke-width="1.4"/><path d="M498 526Q509 523 520 526Q530 529 539 526V550H498Z" fill="#66b5d4" opacity=".35"/><path d="M498 526Q509 523 520 526Q530 529 539 526" fill="none" stroke="#91d6e5" stroke-width="1"/><rect x="513" y="506" width="12" height="5" rx="1" fill="#9cb6bd"/>
  <path d="M551 531L541 521L551 511L561 521Z" fill="#1e3440" stroke="#98bcc8"/><path d="M545 526L555 516" stroke="#a9cbd5" stroke-width="1.5" stroke-dasharray="1 1"/>
 </g>
 <g id="valve-assembly" class="component-hotspot" data-chapter="4" tabindex="0" role="button" aria-label="Explore the control valve">
  <rect class="focus-ring" x="608" y="335" width="83" height="66" rx="8"/>
  <rect x="613" y="352" width="78" height="39" rx="4" fill="#687c7e" stroke="#afc3c4" stroke-width="1.5"/><rect x="617" y="356" width="70" height="29" rx="2" fill="#203944" stroke="#abc1ba" stroke-width=".7"/>
  <rect x="643" y="349" width="9" height="11" fill="#7f999c"/><rect x="624" y="382" width="9" height="12" fill="#7f999c"/>
  <g id="valve-spool"><path d="M608 370H691" stroke="#c1c9b9" stroke-width="3"/><rect x="622" y="357" width="9" height="26" rx="1" fill="url(#metal)"/><rect x="659" y="357" width="9" height="26" rx="1" fill="url(#metal)"/></g>
  <path id="valve-flow" d="M615 366H637V379H647V387" fill="none" stroke="#69c2e4" stroke-width="2.5"/>
  <path id="valve-hold-cap" d="M648 361H660" stroke="#ffac64" stroke-width="2"/>
  <path d="M689 372H705L711 346" fill="none" stroke="#bfd1cd" stroke-width="2"/><circle cx="711" cy="342" r="4" fill="#edc084"/>
  <text x="609" y="350" class="detail-label">P</text><text x="651" y="345" class="detail-label">A</text><text x="648" y="401" class="detail-label">T</text>
 </g>
 <g id="cylinder-assembly" class="component-hotspot" data-chapter="5" tabindex="0" role="button" aria-label="Explore the lift cylinder">
  <rect class="focus-ring" x="753" y="296" width="66" height="254" rx="7"/>
  <rect x="761" y="398" width="42" height="146" rx="4" fill="#2d4d5c" stroke="#aec4c7" stroke-width="2"/>
  <rect x="766" y="404" width="32" height="131" fill="#152c39" stroke="#7695a3" stroke-width=".6"/>
  <rect id="cylinder-oil" x="767" y="521" width="30" height="13" fill="url(#oil)"/>
  <g id="cylinder-rod"><rect x="777" y="295" width="12" height="225" fill="url(#rod)" stroke="#b2c8d0" stroke-width=".7"/><rect x="766" y="516" width="32" height="12" rx="1" fill="url(#metal)" stroke="#e2e5ce"/><path d="M766 520H798M766 524H798" stroke="#1a3038" stroke-width="1.5"/></g>
  <rect x="759" y="396" width="46" height="9" rx="1" fill="url(#metal)" stroke="#bcced2"/>
  <path d="M763 545H801" stroke="#b2c7c9" stroke-width="5"/><circle cx="782" cy="548" r="6" fill="#3c5967" stroke="#adc1c7"/>
  <path id="force-arrow" d="M819 452V413" stroke="#ffb476" stroke-width="2" marker-end="url(#arrow-red)" opacity="0"/>
 </g>
 <g id="chain-assembly" class="component-hotspot" data-chapter="6" tabindex="0" role="button" aria-label="Explore chains and the moving sheave">
  <rect class="focus-ring" x="744" y="210" width="98" height="324" rx="5"/>
  <g id="sheave"><circle cx="785" cy="295" r="26" fill="#243c49" stroke="#bfc3a6" stroke-width="3"/><circle cx="785" cy="295" r="19" fill="#405967" stroke="#829498"/><g id="sheave-spokes"><path d="M766 295H804M785 276V314M772 282L798 308M772 308L798 282" stroke="#a2b3b1" stroke-width="3"/></g><circle cx="785" cy="295" r="6" fill="#dec68c" stroke="#f1e4bd"/></g>
  <path id="chain-back" d="M759 531V295A26 26 0 0 1 811 295V527" fill="none" stroke="#243c44" stroke-width="5"/>
  <path id="chain" d="M759 531V295A26 26 0 0 1 811 295V527" fill="none" stroke="#e1cda1" stroke-width="2.7" stroke-dasharray="3 2"/>
  <path d="M751 531H767M751 535H767" stroke="#c1bba0" stroke-width="3"/><circle cx="759" cy="531" r="3" fill="#f3e1b5"/>
 </g>
 <g id="fork-carriage" class="component-hotspot" data-chapter="7" tabindex="0" role="button" aria-label="Explore the forks and pallet">
  <rect class="focus-ring" x="805" y="453" width="215" height="127" rx="5"/>
  <path d="M807 458L829 451V555L805 566Z" fill="#64818d" stroke="#b1c2c7" stroke-width="1.5"/>
  <path d="M827 453L867 437V530L827 552Z" fill="#314e5d" stroke="#829fae" stroke-width="2"/><path d="M835 454V543M846 450V537M857 445V532M829 468L866 452M829 486L866 470M829 504L866 488M829 522L866 506" stroke="#849ca3" stroke-width="2"/>
  <path d="M807 529V566H953L968 557H823V527Z" fill="url(#metal)" stroke="#b8cbd0"/>
  <path d="M848 511V548H993L1008 539H864V509Z" fill="#8da5b1" stroke="#bfd0d3"/>
  <g id="pallet"><path d="M829 537L874 516L1004 516L960 538Z" fill="#b39169"/><path d="M829 538H961V550H829Z" fill="#876540"/><path d="M961 538L1004 516V529L961 550Z" fill="#674d37"/><path d="M842 539V548M898 539V548M949 539V548" stroke="#d2b68d" stroke-width="12"/><path d="M830 536L874 514H1004" fill="none" stroke="#d4b690" stroke-width="3"/>
  <path d="M839 474H954V533H839Z" fill="#bea286" stroke="#d8bfa0"/><path d="M839 474L885 452H999L954 474Z" fill="#dac5a5" stroke="#e3cfad"/><path d="M954 474L999 452V511L954 533Z" fill="#94775d" stroke="#b89b7d"/>
  <path d="M891 474H903V533H891Z" fill="#ddc9a3"/><path d="M891 474L936 452H949L903 474Z" fill="#f0dfba"/><path d="M860 517v-15m-5 6l5-6 5 6m8 9v-15m-5 6l5-6 5 6" fill="none" stroke="#6a5847" stroke-width="1.5"/>
  <rect x="919" y="487" width="26" height="19" fill="#e9ddc1"/><path d="M923 491h17m-17 3h10m-10 7h17" stroke="#6a756e" stroke-width="1"/><text id="box-load" x="976" y="494" fill="#e5d4b8" font-size="8" transform="rotate(-26 976 494)" text-anchor="middle" font-family="monospace">750 kg</text>
  </g>
 </g>
 <g id="particles"></g>
 <g id="overview-labels">
  <g class="component-hotspot" data-chapter="1"><path class="leader" d="M317 280V253H188"/><circle cx="317" cy="280" r="2.3" fill="#ffae64"/><text class="diagram-label" x="174" y="240">LPG FUEL</text><text class="diagram-sub" x="174" y="254">Stored chemical energy</text></g>
  <g class="component-hotspot" data-chapter="1"><path class="leader" d="M318 490L349 600H240"/><circle cx="318" cy="490" r="2.3" fill="#ffae64"/><text class="diagram-label" x="195" y="617">COMBUSTION ENGINE</text></g>
  <g class="component-hotspot" data-chapter="3"><path class="leader" d="M520 484L546 606"/><circle cx="520" cy="484" r="2.3" fill="#f5dda6"/><text class="diagram-label" x="473" y="627">HYDRAULIC PUMP</text></g>
  <g class="component-hotspot" data-chapter="4"><path class="leader" d="M654 353L654 281H578"/><circle cx="654" cy="353" r="2.3" fill="#ff8065"/><text class="diagram-label" x="555" y="267">CONTROL VALVE</text></g>
  <g class="component-hotspot" data-chapter="6"><path class="leader" d="M785 269V217H954"/><circle cx="785" cy="269" r="2.3" fill="#f5dda6"/><text class="diagram-label" x="824" y="203">CHAIN + SHEAVE</text><text class="diagram-sub" x="824" y="219">Transferring the lift</text></g>
  <g class="component-hotspot" data-chapter="5"><path class="leader" d="M803 432H883V402H958"/><circle cx="803" cy="432" r="2.3" fill="#ff8065"/><text class="diagram-label" x="889" y="388">LIFT CYLINDER</text></g>
  <g class="component-hotspot" data-chapter="7"><path class="leader" d="M986 546V592H966"/><circle cx="986" cy="546" r="2.3" fill="#a9d9b6"/><text class="diagram-label" x="846" y="613">FORKS + PALLET</text></g>
 </g>
 <g id="detail-labels"></g>
</g>`;

const particleSpecs = [
 ['fuel-line',6,'#ffd395','fuel'],['suction-path',9,'#96e1ff','pump'],['pump-upper-path',6,'#b1e9ff','pump'],['pump-lower-path',6,'#b1e9ff','pump'],['pressure-path',9,'#ffb295','pump'],['cylinder-path',14,'#ffc6ad','cylinder'],['return-path',10,'#b0e8ff','return'],['relief-path',5,'#ffd7a2','relief'],
];
const flows = particleSpecs.map(([id,count,color,kind])=>{const path=$(id);const length=path.getTotalLength();const particles=[];for(let i=0;i<count;i++){const dot=document.createElementNS(NS,'circle');dot.setAttribute('r',kind==='fuel'?'1.15':'1.5');dot.setAttribute('fill',color);$('particles').append(dot);particles.push(dot);}return {path,length,particles,kind};});

function detailMarkup(index){
 const text=(x,y,label,route)=>`<path class="detail-line" d="${route}"/><text class="detail-label" x="${x}" y="${y}">${label}</text>`;
 if(index===1)return text(398,322,'Vaporizer','M396 328H399')+text(355,307,'Spark plug','M353 309L318 320')+text(368,365,'Fuel + air','M364 366H345')+text(364,397,'Piston','M361 398H345')+text(367,433,'Connecting rod','M364 430L326 417')+text(369,470,'Crankshaft','M366 467L337 456');
 if(index===2)return text(384,413,'Power take-off gears','M430 416V402H382')+text(368,496,'Rotating shaft','M387 493V461')+text(492,383,'Hydraulic pump','M518 395V388H492');
 if(index===3)return text(460,419,'IN','M478 422V445H485')+text(554,470,'OUT','M558 464V449H550')+text(487,391,'Oil follows the housing','M492 393L505 407')+text(491,511,'Teeth seal the center','M513 504L517 447');
 if(index===4)return text(607,331,'To lift cylinder','M654 332V317')+text(576,423,'P = pump','M588 414V369')+text(630,435,'T = tank','M647 426V389')+text(674,320,'Control lever','M700 324L710 338')+text(594,449,'Relief valve','M615 452V466');
 if(index===5)return text(827,330,'Piston rod','M824 332H789')+text(827,418,'Sealed piston','M823 420L798 461')+text(823,505,'Oil under pressure','M819 507H798')+text(727,570,'Oil enters below the piston','M775 563V545');
 if(index===6)return text(830,228,'Moving sheave','M827 230L801 258')+text(691,562,'Fixed chain end','M727 555L759 531')+text(839,583,'Carriage end','M838 574L812 500');
 if(index===8)return text(485,578,'Reservoir','M519 569V554')+text(572,552,'Return filter','M569 548L552 528');
 return '';
}

$('chapters').innerHTML=chapters.map((c,i)=>`<button class="chapter-button ${i===0?'active':''}" data-chapter="${i}" ${i===0?'aria-current="step"':''}><span class="number">${String(i+1).padStart(2,'0')}</span><span class="name">${c.name}</span></button>`).join('');
$('timeline').max=totalDuration;$('duration').textContent=formatTime(totalDuration);
function formatTime(time){return `${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,'0')}`;}
function setPlaying(playing){state.playing=playing;$('play-button').innerHTML=playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm7 0h4v14h-4z" fill="currentColor"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l11 7-11 7z" fill="currentColor"/></svg>';$('play-button').setAttribute('aria-label',playing?'Pause walkthrough':'Play walkthrough');if(!playing){window.speechSynthesis?.cancel();state.voiceKey='';}else speak();}
function selectChapter(index,seek=true){
 state.chapter=Math.max(0,Math.min(chapters.length-1,index));const c=chapters[state.chapter];state.overview=false;state.targetCamera=[...c.camera];
 if(seek){state.manual=false;state.time=c.start;state.extension=guidedExtension(state.chapter,0);state.phase=0;state.voiceKey='';}
 $('view-label').textContent=`${String(state.chapter+1).padStart(2,'0')} — ${state.chapter===0?'THE WHOLE MACHINE':c.name.toUpperCase()}`;
 $('chapter-kicker').textContent=c.kicker;$('chapter-count').textContent=`${String(state.chapter+1).padStart(2,'0')} / 09`;
 $('chapter-symbol').textContent=c.symbol;$('chapter-title').innerHTML=c.title;$('chapter-description').textContent=c.description;$('principle-label').textContent=c.label;$('principle-value').textContent=c.formula;$('detail-note').textContent=c.detail;$('scene-note').textContent=c.note;
 $('chapter-hint').textContent=state.chapter===8?'THE CYCLE IS COMPLETE · REPLAY ↺':`UP NEXT / ${chapters[state.chapter+1].name.toUpperCase()}`;
 $('next-button').setAttribute('aria-label',state.chapter===8?'Replay walkthrough':'Next chapter');
 $('detail-labels').innerHTML=detailMarkup(state.chapter);
 document.querySelectorAll('.chapter-button').forEach((b,i)=>{b.classList.toggle('active',i===state.chapter);if(i===state.chapter)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 $('mode-label').textContent='GUIDED MODE';$('explore-button').innerHTML='Try the hydraulics <span>↗</span>';
 if(reducedMotion)state.camera=[...state.targetCamera];
 state.voiceKey='';if(state.playing)speak();
}
function speak(){if(!state.narration||!state.playing||state.manual||!('speechSynthesis'in window))return;const key=String(state.chapter);if(state.voiceKey===key)return;state.voiceKey=key;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(narration[state.chapter]);utterance.lang='en-US';utterance.rate=Math.min(2,1.07*state.speed);window.speechSynthesis.speak(utterance);}
function guidedExtension(index,local){
 if(index<4)return 0;
 if(index===4)return local<8?local/8*.13:local<14?.13:Math.max(0,.13-(local-14)/10*.13);
 if(index===5)return local/18*.32;
 if(index===6)return .32+local/18*.22;
 if(index===7)return Math.min(.75,.54+local/18*.21);
 return local<6?.75:Math.max(0,.75-(local-6)/16*.75);
}
function guidedValve(index,local){if(index===4)return local<8?'raise':local<14?'hold':'lower';if(index>=5&&index<=7)return 'raise';if(index===8)return local<6?'hold':'lower';return 'hold';}
function enterManual(valve='hold'){
 state.manual=true;state.valve=valve;state.overview=true;state.targetCamera=[...chapters[0].camera];window.speechSynthesis?.cancel();setPlaying(true);
 $('mode-label').textContent='YOU ARE IN CONTROL';$('view-label').textContent='LIVE — EXPLORE THE HYDRAULICS';$('explore-button').innerHTML='Back to walkthrough <span>↗</span>';$('chapter-hint').textContent='USE RAISE / HOLD / LOWER BELOW';
 $('chapter-kicker').textContent='YOUR HYDRAULIC LAB';$('chapter-title').innerHTML='Take the<br>controls.';$('chapter-description').textContent='Use the lift valve to raise, hold and lower the pallet. Change the load to see its effect on pressure, or engine speed to change pump flow.';$('principle-label').textContent='WATCH THE RELATIONSHIP';$('principle-value').textContent='Load → pressure · rpm → flow';$('detail-note').textContent='The moving sheave doubles fork travel. At full height, excess pump flow passes through the 120 bar relief valve. Motion is slowed for visibility.';$('scene-note').textContent='Try holding the load: pressure remains, even with no cylinder flow.';
}
document.querySelectorAll('[data-chapter]').forEach(el=>{el.addEventListener('click',()=>selectChapter(Number(el.dataset.chapter)));el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&el.tagName.toLowerCase()!=='button'){e.preventDefault();selectChapter(Number(el.dataset.chapter));}});});
$('play-button').addEventListener('click',()=>{if(state.time>=totalDuration&&!state.manual)selectChapter(0);setPlaying(!state.playing);});
$('restart-button').addEventListener('click',()=>{selectChapter(0);setPlaying(true);});
$('next-button').addEventListener('click',()=>selectChapter(state.chapter===8?0:state.chapter+1));
$('home-view').addEventListener('click',()=>{state.overview=!state.overview;state.targetCamera=[...(state.overview?chapters[0].camera:chapters[state.chapter].camera)];});
$('labels-button').addEventListener('click',()=>{state.labels=!state.labels;$('labels-button').setAttribute('aria-pressed',state.labels);$('labels-button').classList.toggle('active',state.labels);});
$('timeline').addEventListener('input',e=>{state.time=Number(e.target.value);state.manual=false;const index=chapters.findIndex(c=>state.time<c.start+c.duration);selectChapter(index<0?8:index,false);state.extension=guidedExtension(state.chapter,state.time-chapters[state.chapter].start);});
$('speed').addEventListener('change',e=>{state.speed=Number(e.target.value);state.voiceKey='';speak();});
$('voice-button').addEventListener('click',()=>{state.narration=!state.narration;$('voice-button').setAttribute('aria-pressed',state.narration);$('voice-button').querySelector('span').textContent=state.narration?'Narration on':'Narration off';if(state.narration){state.voiceKey='';speak();}else window.speechSynthesis?.cancel();});
if(!('speechSynthesis'in window)){$('voice-button').disabled=true;$('voice-button').title='Narration is not supported in this browser';}
$('fullscreen-button').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').requestFullscreen();}catch{$('fullscreen-button').title='Fullscreen is unavailable in this browser';}});
$('explore-button').addEventListener('click',()=>{if(state.manual){selectChapter(0);setPlaying(false);}else enterManual();});
document.querySelectorAll('[data-valve]').forEach(b=>b.addEventListener('click',()=>{if(!state.manual)enterManual(b.dataset.valve);else{state.valve=b.dataset.valve;setPlaying(true);}}));
$('load').addEventListener('input',e=>{state.load=Number(e.target.value);$('load-value').textContent=`${state.load.toLocaleString()} kg`;$('box-load').textContent=`${state.load} kg`;if(!state.manual)enterManual();});
$('rpm').addEventListener('input',e=>{state.rpm=Number(e.target.value);$('rpm-value').textContent=`${state.rpm.toLocaleString()} rpm`;if(!state.manual)enterManual();});
const dialog=$('about-dialog');for(const id of ['about-button','sources-button'])$(id).addEventListener('click',()=>dialog.showModal());$('close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.addEventListener('keydown',e=>{if(dialog.open||e.target.closest('input,select,button,a'))return;if(e.code==='Space'){e.preventDefault();setPlaying(!state.playing);}if(e.code==='ArrowRight'){e.preventDefault();selectChapter(state.chapter+1);}if(e.code==='ArrowLeft'){e.preventDefault();selectChapter(state.chapter-1);}});
document.addEventListener('visibilitychange',()=>{state.previous=0;if(document.hidden)window.speechSynthesis?.cancel();else{state.voiceKey='';speak();}});
window.addEventListener('pagehide',()=>window.speechSynthesis?.cancel());

let lastTelemetry=-1;
function render(timestamp){
 const delta=state.previous?Math.min((timestamp-state.previous)/1000,.08):0;state.previous=timestamp;const dt=state.playing?delta*state.speed:0;
 if(state.playing&&!state.manual){state.time=Math.min(totalDuration,state.time+dt);let index=chapters.findIndex(c=>state.time<c.start+c.duration);if(index<0)index=8;if(index!==state.chapter)selectChapter(index,false);if(state.time===totalDuration)setPlaying(false);}
 const c=chapters[state.chapter],local=state.time-c.start;
 if(!state.manual){state.valve=guidedValve(state.chapter,local);state.extension=guidedExtension(state.chapter,local);}
 let hydraulic=hydraulics(state.load,state.rpm,state.valve,state.extension);
 if(state.manual&&dt){state.extension=stepLift(state.extension,dt,hydraulic);hydraulic=hydraulics(state.load,state.rpm,state.valve,state.extension);}
 state.phase+=dt*(state.rpm/1200)*Math.PI*.72;
 const phase=state.phase%(Math.PI*4),stroke=Math.floor(phase/Math.PI),crank=crankPosition(phase);
 const pinY=456+crank.pistonY,crankX=318+crank.x,crankY=456+crank.y;
 $('engine-piston').setAttribute('transform',`translate(0 ${pinY-378})`);$('engine-gas').setAttribute('height',Math.max(4,pinY-14-347));
 const colors=['#7bc5df','#ddb776','#ff8f4d','#b3c2c5'];$('engine-gas').setAttribute('fill',colors[stroke]);$('engine-gas').setAttribute('opacity',stroke===2?.68:.32);
 $('connecting-rod').setAttribute('d',`M${crankX} ${crankY}L318 ${pinY}`);$('crank-arm').setAttribute('d',`M318 456L${crankX} ${crankY}`);$('crank-pin').setAttribute('cx',crankX);$('crank-pin').setAttribute('cy',crankY);
 $('spark').setAttribute('opacity',phase>Math.PI*1.95&&phase<Math.PI*2.15?1:0);$('intake-valve').setAttribute('transform',`translate(0 ${stroke===0?3:0})`);$('exhaust-valve').setAttribute('transform',`translate(0 ${stroke===3?3:0})`);
 $('intake-dots').setAttribute('opacity',stroke===0?1:0);$('exhaust-dots').setAttribute('opacity',stroke===3?1:0);$('intake-dots').setAttribute('stroke-dashoffset',-state.phase*8);$('exhaust-dots').setAttribute('stroke-dashoffset',-state.phase*8);
 const degrees=state.phase*180/Math.PI;$('drive-gear-a').setAttribute('transform',`rotate(${degrees})`);$('drive-gear-b').setAttribute('transform',`rotate(${-degrees*14/12+8})`);$('pump-gear-a').setAttribute('transform',`rotate(${degrees*14/12})`);$('pump-gear-b').setAttribute('transform',`rotate(${-degrees*14/12+13})`);
 const extensionPixels=state.extension/MODEL.stroke*82,chain=chainGeometry(extensionPixels);
 $('cylinder-rod').setAttribute('transform',`translate(0 ${-extensionPixels})`);$('cylinder-oil').setAttribute('y',528-extensionPixels);$('cylinder-oil').setAttribute('height',6+extensionPixels);$('sheave').setAttribute('transform',`translate(0 ${-extensionPixels})`);$('sheave-spokes').setAttribute('transform',`rotate(${-extensionPixels/26*180/Math.PI} 785 295)`);
 const chainPath=`M759 ${chain.anchorY}V${chain.sheaveY}A26 26 0 0 1 811 ${chain.sheaveY}V${chain.carriageY}`;$('chain').setAttribute('d',chainPath);$('chain-back').setAttribute('d',chainPath);$('fork-carriage').setAttribute('transform',`translate(0 ${-extensionPixels*2})`);$('force-arrow').setAttribute('opacity',state.valve==='raise'?.8:0);
 if(state.chapter===5){const labels=$('detail-labels').children;labels[2]?.setAttribute('d',`M823 ${521-extensionPixels}H798`);labels[3]?.setAttribute('y',519-extensionPixels);}
 if(state.chapter===6){const labels=$('detail-labels').children;labels[0]?.setAttribute('d',`M827 ${chain.sheaveY-17}L803 ${chain.sheaveY-10}`);labels[1]?.setAttribute('y',chain.sheaveY-19);labels[4]?.setAttribute('d',`M835 ${chain.carriageY+15}L811 ${chain.carriageY}`);labels[5]?.setAttribute('y',chain.carriageY+22);}
 const spoolX=state.valve==='raise'?-7:state.valve==='lower'?8:0;$('valve-spool').setAttribute('transform',`translate(${spoolX} 0)`);$('valve-flow').setAttribute('d',state.valve==='raise'?'M615 366H654V353':state.valve==='lower'?'M654 353V376H647V387M615 366H634V379H647V387':'M615 366H637V379H647V387');$('valve-flow').setAttribute('stroke',state.valve==='raise'?'#ffac8b':'#69c2e4');$('valve-hold-cap').setAttribute('opacity',state.valve==='hold'?1:0);
 const pressureColor=hydraulic.pumpPressure>10?'#ff8065':'#63b4d0';$('pressure-path').setAttribute('stroke',pressureColor);$('cylinder-path').setAttribute('stroke',hydraulic.cylinderPressure>1?'#ff8065':'#6d9bad');$('relief-path').setAttribute('stroke',hydraulic.reliefOpen?'#ffac64':'#668e9e');$('gauge-needle').setAttribute('transform',`rotate(${hydraulic.pumpPressure/MODEL.reliefBar*245} 576 334)`);
 for(const flow of flows){let moving=true,reverse=false;if(flow.kind==='cylinder'){moving=hydraulic.cylinderFlow!==0;reverse=state.valve==='lower';}if(flow.kind==='return')moving=state.valve!=='raise'||hydraulic.reliefOpen;if(flow.kind==='relief')moving=hydraulic.reliefOpen;for(let i=0;i<flow.particles.length;i++){const p=flow.particles[i];p.style.opacity=moving?'1':'0';if(!moving)continue;const distance=((i/flow.particles.length+(state.phase*.027)*(reverse?-1:1))%1+1)%1*flow.length;const point=flow.path.getPointAtLength(distance);p.setAttribute('cx',point.x);p.setAttribute('cy',point.y);}}
 // The camera gently pulls back from the running engine before following the shaft.
 if(state.chapter===1&&!state.overview&&!state.manual){const pull=Math.max(0,(local-20)/6);state.targetCamera=chapters[1].camera.map((v,i)=>v+(chapters[2].camera[i]-v)*pull);}
 const blend=reducedMotion?1:1-Math.exp(-delta*3.7);state.camera=state.camera.map((v,i)=>v+(state.targetCamera[i]-v)*blend);svg.setAttribute('viewBox',camera(state.camera));
 const wide=state.chapter===0||state.chapter===7||state.overview||state.manual;
 $('overview-labels').style.opacity=state.labels&&wide?'1':'0';$('overview-labels').style.pointerEvents=state.labels&&wide?'auto':'none';$('detail-labels').style.opacity=state.labels&&!wide?'1':'0';
 $('chassis-context').style.opacity=wide?'1':state.chapter===1||state.chapter===2?'.14':'.07';
 const focuses={1:['engine-assembly','fuel-assembly'],2:['engine-assembly','drive-assembly','pump-assembly'],3:['pump-assembly','tank-assembly','hydraulic-lines'],4:['valve-assembly','hydraulic-lines'],5:['cylinder-assembly','chain-assembly','hydraulic-lines'],6:['cylinder-assembly','chain-assembly','fork-carriage'],8:['valve-assembly','hydraulic-lines','cylinder-assembly','chain-assembly','fork-carriage','tank-assembly']};
 for(const id of ['engine-assembly','fuel-assembly','drive-assembly','pump-assembly','valve-assembly','cylinder-assembly','chain-assembly','fork-carriage','hydraulic-lines','tank-assembly'])$(id).style.opacity=wide||(focuses[state.chapter]||[]).includes(id)?'1':'.16';
 $('engine-strokes').hidden=state.chapter!==1||wide;[...$('engine-strokes').children].forEach((el,i)=>el.classList.toggle('active',i===stroke));
 if(timestamp-lastTelemetry>90){lastTelemetry=timestamp;$('pressure-value').textContent=hydraulic.cylinderPressure.toFixed(1);$('pressure-meter').style.width=`${Math.min(100,hydraulic.cylinderPressure/MODEL.reliefBar*100)}%`;$('flow-value').textContent=hydraulic.pumpFlow.toFixed(1);$('height-value').textContent=hydraulic.forkHeight.toFixed(2);$('travel-note').textContent=`Piston travel: ${state.extension.toFixed(2)} m`;$('flow-note').textContent=hydraulic.reliefOpen?'Relief open · 120 bar':state.valve==='raise'?'Flow entering the cylinder':state.valve==='lower'?'Pump to tank · gravity lowering':'Circulating back to tank';$('timeline').value=state.time;$('elapsed').textContent=formatTime(state.time);document.querySelectorAll('[data-valve]').forEach(b=>{b.classList.toggle('selected',b.dataset.valve===state.valve);b.setAttribute('aria-pressed',b.dataset.valve===state.valve);});if(state.chapter===4&&!state.manual)$('scene-note').textContent=state.valve==='raise'?'RAISE · P connects to A. Oil enters the cylinder.':state.valve==='hold'?'HOLD · A is blocked. Oil supports the stationary load.':'LOWER · A returns to T. Gravity brings the load down.';if(state.manual)$('scene-note').textContent=hydraulic.reliefOpen?'At full height: the relief valve sends excess flow back to tank.':state.valve==='raise'?'RAISE · Pump flow extends the piston and raises the forks.':state.valve==='lower'?'LOWER · Gravity pushes oil through the metered return path.':'HOLD · The cylinder port is blocked. Trapped oil supports the load.';}
 requestAnimationFrame(render);
}
selectChapter(0);requestAnimationFrame(render);
// Read-only inspection surface for automated checks and accessible state debugging.
window.forkliftModel={getState:()=>({...state,hydraulic:hydraulics(state.load,state.rpm,state.valve,state.extension)}),chapters,MODEL};
