var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");
var canvasSize = 800;

//IMAGES
//  size

var wedgeWidth = 47, wedgeHeight = 23;
var wedgeOriginDeltaX = 20, wedgeOriginDeltaY = 4;
var needleWidth = 47, needleHeight = 18;
var shotWidth = 6, shotHeight = 1;
var centerWidth = 25, centerHeight = 25;

//  sources

var wedge = [], wedgeNitro = [];
var needle = [], needleNitro = [];


wedge.push({x: 12, y: -19, r: 19, a1: Math.acos(1/Math.sqrt(10)), a2: Math.acos(-14/Math.sqrt(365))});
wedge.push({x: 4, y: 12, r: 19, a1: -Math.acos(-1/Math.sqrt(10)), a2: -Math.acos(14/Math.sqrt(365))});
wedge.push({x: 4, y: -4, r: 19, a1: Math.acos(14/Math.sqrt(365)), a2: Math.acos(-1/Math.sqrt(10))});
wedge.push({x: 12, y: 27, r: 19, a1: -Math.acos(-14/Math.sqrt(365)), a2: -Math.acos(1/Math.sqrt(10))});
wedge.push({x: 20, y: 35, r: 40, a1: -Math.acos(-4/Math.sqrt(65)), a2: -Math.acos(25/Math.sqrt(1586))});
wedge.push({x: 20, y: -27, r: 40, a1: Math.acos(25/Math.sqrt(1586)), a2: Math.acos(-4/Math.sqrt(65))});
wedgeNitro.push({x: -8, y: 4});
wedgeNitro.push({x: -12, y: 4});
wedgeNitro.push({x: -15, y: 4});
wedgeNitro.push({x: -18, y: 4});
wedgeNitro.push({x: -22, y: 4});

needle.push({x: 0, y: 0});
needle.push({x: 13, y: 0});
needle.push({x: 20, y: 6});
needle.push({x: 41, y: 6});
needle.push({x: 47, y: 9});
needle.push({x: 41, y: 12});
needle.push({x: 20, y: 12});
needle.push({x: 13, y: 18});
needle.push({x: 0, y: 18});
needle.push({x: 0, y: 6});
needle.push({x: 0, y: 12});
needleNitro.push({x: -8, y: 9});
needleNitro.push({x: -12, y: 9});
needleNitro.push({x: -15, y: 9});
needleNitro.push({x: -18, y: 9});
needleNitro.push({x: -22, y: 9});

//SERVICE
var rotationAngle = Math.PI/50; //шаг вращения кораблей
var centerState = 0, wedgeNitroState = 0, needleNitroState = 0;
var keys = [], shots = [];
shots.push({owner: 2,
            x: 400,
            y: 390,
            lifeTime: 71,
            killer: false,
            victim: -1,
            exploded: false,
            explosionPause: 0,
            e: []});
shots.push({owner: 2,
            x: 410,
            y: 400,
            lifeTime: 71,
            killer: false,
            victim: -1,
            exploded: false,
            explosionPause: 0,
            e: []});
shots.push({owner: 2,
            x: 400,
            y: 410,
            lifeTime: 71,
            killer: false,
            victim: -1,
            exploded: false,
            explosionPause: 0,
            e: []});
shots.push({owner: 2,
            x: 390,
            y: 400,
            lifeTime: 71,
            killer: false,
            victim: -1,
            exploded: false,
            explosionPause: 0,
            e: []});
var shotMaximumLifeTime = 4000, shotMaximumExlposionPause = 30, shotSpeed = 1, rechargeTime = 500;
var wedgeAlive = true, needleAlive = true;
var wedgeFuelLevel = 3000, needleFuelLevel = 3000, wedgeShotsNumber = 33, wedgeLastShotTime = rechargeTime, needleShotsNumber = 33, needleLastShotTime = rechargeTime;
let nitroPower = 0.02; //МОЩНОСТЬ НИТРО: чем больше, тем сильнее тяга
    //loop helpers
let loopStep = 30; // 28 <= loopStep <= 70
    //gravity helpers
let dt = 1, M = 140, m = 8 ; //Дельта время, масса звезды, масса корабля
let needleMass = m + 10, wedgeMass = m + 10;
let nFx = 0, nFy = 0, nR;
let nAx, nAy, nVx = nVy = 0;
let wFx = 0, wFy = 0, wR;
let wAx, wAy, wVx = wVy = 0;


//CONTROLS

function keysControl() {
    // Wedge
        // KeyA down - left
    if (keys[65] && wedgeAlive) {
        wA -= rotationAngle;
        while (wA < 0) wA += 2*Math.PI;
    }
        // KeyD down - right
    if (keys[68] && wedgeAlive) {
        wA += rotationAngle;
        while (wA > 2*Math.PI) wA -= 2*Math.PI;
    }
        // KeyW down - shot
    if (keys[87] && wedgeShotsNumber > 0 && wedgeLastShotTime >= rechargeTime && wedgeAlive) {
        shots.push({owner: 0,
                    angle: wA + Math.PI,
                    x: wX + (wedgeWidth/2 * Math.cos(wA)) + (4 * Math.cos(wA)),
                    y: wY + (wedgeWidth/2 * Math.sin(wA)) + (shotWidth * Math.sin(wA)),
                    speedX: (shotSpeed + (wVx - (wAx * dt)) * Math.cos(wA - Math.acos((wVx - (wAx * dt)) / Math.sqrt((wVx - (wAx * dt)) * (wVx - (wAx * dt)) + (wVy - (wAy * dt)) * (wVy - (wAy * dt)))))) * Math.cos(wA),
                    speedY: (shotSpeed + (wVy - (wAy * dt)) * Math.cos(wA - Math.acos((wVx - (wAx * dt)) / Math.sqrt((wVx - (wAx * dt)) * (wVx - (wAx * dt)) + (wVy - (wAy * dt)) * (wVy - (wAy * dt)))))) * Math.sin(wA),
                    lifeTime: 0,
                    killer: false,
                    victim: -1,
                    exploded: false,
                    explosionPause: 0,
                    e: []});
        wedgeShotsNumber--;
        wedgeLastShotTime = 0;
    }
        // KeyS down - nitro
    if (keys[83] && wedgeFuelLevel > 0 && wedgeAlive) {
        if (0 <= wA && wA <= Math.PI) {
            wFy += Math.abs(Math.tan(wA)*Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA)))) * nitroPower;
        } else {
            wFy -= Math.abs(Math.tan(wA)*Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA)))) * nitroPower;
        }
        if (Math.PI/2 <= wA && wA <=3*Math.PI/2) {
            wFx -= Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA))) * nitroPower;
        } else {
            wFx += Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA))) * nitroPower;
            }
        if (wedgeNitroState == 0) wedgeNitroState = 1;
        wedgeFuelLevel -= 1;
        wedgeMass = m +  wedgeFuelLevel / 300;
        if (wedgeFuelLevel <= 0) keys[83] = false;
    }
        // KeyS up - nitro off
    if (!keys[83] && wedgeAlive) wedgeNitroState = 0;

    // Needle
    // KeyJ down - left
    if (keys[74] && needleAlive) {
        nA -= rotationAngle;
        while (nA < 0) nA += 2 * Math.PI;
    }
    // KeyL down - right
    if (keys[76] && needleAlive) {
        nA += rotationAngle;
        while (nA > 2*Math.PI) nA -= 2 * Math.PI;
    }
    // KeyI down - shot
    if (keys[73] && needleShotsNumber > 0 && needleLastShotTime >= rechargeTime && needleAlive) {
        shots.push({owner: 1,
                    angle: nA + Math.PI,
                    x: nX + (needleWidth/2 * Math.cos(nA)) + (5 * Math.cos(nA)),
                    y: nY + (needleWidth/2 * Math.sin(nA)) + (shotWidth * Math.sin(nA)),
                    speedX: (shotSpeed + (nVx - (nAx * dt)) * Math.cos(nA - Math.acos((nVx - (nAx * dt)) / Math.sqrt((nVx - (nAx * dt)) * (nVx - (nAx * dt)) + (nVy - (nAy * dt)) * (nVy - (nAy * dt)))))) * Math.cos(nA),
                    speedY: (shotSpeed + (nVy - (nAy * dt)) * Math.cos(nA - Math.acos((nVx - (nAx * dt)) / Math.sqrt((nVx - (nAx * dt)) * (nVx - (nAx * dt)) + (nVy - (nAy * dt)) * (nVy - (nAy * dt)))))) * Math.sin(nA),
                    lifeTime: 0,
                    killer: false,
                    victim: -1,
                    exploded: false,
                    explosionPause: 0,
                    e: []});
        needleShotsNumber--;
        needleLastShotTime = 0;
    }
    // KeyK down - nitro
    if (keys[75] && needleFuelLevel > 0 && needleAlive) {
        nFx = nFy = 0;
        if (0 <= nA && nA <= Math.PI) {
            nFy += Math.abs(Math.tan(nA) * Math.sqrt(10 / (1 + Math.tan(nA) * Math.tan(nA)))) * nitroPower;
        } else {
            nFy -= Math.abs(Math.tan(nA) * Math.sqrt(10 / (1 + Math.tan(nA) * Math.tan(nA)))) * nitroPower;
        }
        if (Math.PI/2 <= nA && nA <= 3*Math.PI/2) {
            nFx -= Math.sqrt(10 / (1 + Math.tan(nA) * Math.tan(nA))) * nitroPower;
        } else {
            nFx += Math.sqrt(10 / (1 + Math.tan(nA) * Math.tan(nA))) * nitroPower;
        }
        if (needleNitroState == 0) needleNitroState = 1;
        needleFuelLevel -= 1;
        needleMass = m +  needleFuelLevel / 300;
        if (needleFuelLevel <= 0) keys[75] = false;
    }
    // KeyK up - nitro off
    if (!keys[75] && needleAlive) needleNitroState = 0;
    wedgeLastShotTime += 10;
    needleLastShotTime += 10;
    setTimeout(keysControl, 10);
}

document.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});

document.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

function shotsControl() {
    let l = shots.length;
    for (let i = 0; i < l; i++) {
        if (shots[i].owner != 2) shots[i].lifeTime += 10;
        if (shots[i].lifeTime < shotMaximumLifeTime && !shots[i].killer) {
            if (shots[i].owner != 2) {
                shots[i].x += shots[i].speedX;
                shots[i].y += shots[i].speedY;
            }
            if (wedgeAlive) {
                let n = wedge.length;
                for (let o = 0; o < n; o += 2)
                    if ((shots[i].x - ((wedge[o].x - wedgeOriginDeltaX) * Math.cos(wA) - (wedge[o].y - wedgeOriginDeltaY) * Math.sin(wA) + wX)) *
                        (shots[i].x - ((wedge[o].x - wedgeOriginDeltaX) * Math.cos(wA) - (wedge[o].y - wedgeOriginDeltaY) * Math.sin(wA) + wX)) +
                        (shots[i].y - ((wedge[o].x - wedgeOriginDeltaX) * Math.sin(wA) + (wedge[o].y - wedgeOriginDeltaY) * Math.cos(wA) + wY)) *
                        (shots[i].y - ((wedge[o].x - wedgeOriginDeltaX) * Math.sin(wA) + (wedge[o].y - wedgeOriginDeltaY) * Math.cos(wA) + wY)) <=
                        wedge[o].r * wedge[o].r &&
                        (shots[i].x - ((wedge[o+1].x - wedgeOriginDeltaX) * Math.cos(wA) - (wedge[o+1].y - wedgeOriginDeltaY) * Math.sin(wA) + wX)) *
                        (shots[i].x - ((wedge[o+1].x - wedgeOriginDeltaX) * Math.cos(wA) - (wedge[o+1].y - wedgeOriginDeltaY) * Math.sin(wA) + wX)) +
                        (shots[i].y - ((wedge[o+1].x - wedgeOriginDeltaX) * Math.sin(wA) + (wedge[o+1].y - wedgeOriginDeltaY) * Math.cos(wA) + wY)) *
                        (shots[i].y - ((wedge[o+1].x - wedgeOriginDeltaX) * Math.sin(wA) + (wedge[o+1].y - wedgeOriginDeltaY) * Math.cos(wA) + wY)) <=
                        wedge[o+1].r * wedge[o+1].r &&
                        (o != 4 || shots[i].x > wX - wedgeOriginDeltaX)) {
                        shots[i].killer = true;
                        shots[i].victim = 0;
                        wedgeAlive = false;
                    }
            }
            if (needleAlive) {
                let n = needle.length - 2, c = false, j = n - 1;
                for (let o = 0; o < n; o++) {
                    if ((((((needle[o].x - needleWidth/2) * Math.sin(nA) + (needle[o].y - needleHeight/2) * Math.cos(nA) + nY) <= shots[i].y) &&
                        (shots[i].y < ((needle[j].x - needleWidth/2) * Math.sin(nA) + (needle[j].y - needleHeight/2) * Math.cos(nA) + nY))) ||
                        ((((needle[j].x - needleWidth/2) * Math.sin(nA) + (needle[j].y - needleHeight/2) * Math.cos(nA) + nY) <= shots[i].y) &&
                        (shots[i].y < ((needle[o].x - needleWidth/2) * Math.sin(nA) + (needle[o].y - needleHeight/2) * Math.cos(nA) + nY)))) &&
                        (shots[i].x > (((needle[j].x - needleWidth/2) * Math.cos(nA) - (needle[j].y - needleHeight/2) * Math.sin(nA) + nX) -
                        ((needle[o].x - needleWidth/2) * Math.cos(nA) - (needle[o].y - needleHeight/2) * Math.sin(nA) + nX)) *
                        (shots[i].y - ((needle[o].x - needleWidth/2) * Math.sin(nA) + (needle[o].y - needleHeight/2) * Math.cos(nA) + nY)) /
                        (((needle[j].x - needleWidth/2) * Math.sin(nA) + (needle[j].y - needleHeight/2) * Math.cos(nA) + nY) -
                        ((needle[o].x - needleWidth/2) * Math.sin(nA) + (needle[o].y - needleHeight/2) * Math.cos(nA) + nY)) +
                        ((needle[o].x - needleWidth/2) * Math.cos(nA) - (needle[o].y - needleHeight/2) * Math.sin(nA) + nX)))
                        c = !c;
                        j = o;
                    }
                if (c) {
                    shots[i].killer = true;
                    shots[i].victim = 1;
                    needleAlive = false;
                }
            }
        } else if (shots[i].explosionPause >= shotMaximumExlposionPause) {
            shots.splice(i, 1);
            i--;
            l--;
        }
    }
    setTimeout(shotsControl, 10);
}

function automaticUpdate() {
    let e = true;
    for (let s of shots)
        if (s.explosionPause > 0 && s.explosionPause < shotMaximumExlposionPause)
            e = false;
    if ((!wedgeAlive || !needleAlive) && e) {
        wedgeNitroState = 0;
        needleNitroState = 0;
        shots.length = 0;
        shots.push({owner: 2,
                    x: 400,
                    y: 390,
                    lifeTime: 71,
                    killer: false,
                    victim: -1,
                    exploded: false,
                    explosionPause: 0,
                    e: []});
        shots.push({owner: 2,
                    x: 410,
                    y: 400,
                    lifeTime: 71,
                    killer: false,
                    victim: -1,
                    exploded: false,
                    explosionPause: 0,
                    e: []});
        shots.push({owner: 2,
                    x: 400,
                    y: 410,
                    lifeTime: 71,
                    killer: false,
                    victim: -1,
                    exploded: false,
                    explosionPause: 0,
                    e: []});
        shots.push({owner: 2,
                    x: 390,
                    y: 400,
                    lifeTime: 71,
                    killer: false,
                    victim: -1,
                    exploded: false,
                    explosionPause: 0,
                    e: []});
        wX = 200;
        wY = 210;
        wA = Math.PI/2;
        nX = canvasSize - wX;
        nY = canvasSize - wY;
        nA = 3*Math.PI/2;
        wVx = wVy = 0;
        nVx = nVy = 0;
        wedgeMass = 18;
        needleMass = 18;
        wedgeFuelLevel = 3000;
        needleFuelLevel = 3000;
        wedgeShotsNumber = 33;
        wedgeLastShotTime = rechargeTime;
        needleShotsNumber = 33;
        needleLastShotTime = rechargeTime;
        wedgeAlive = true;
        needleAlive = true;
    }
    setTimeout(automaticUpdate, 2000);
}

var wX = 200, wY = 210, wA = Math.PI/2; // Х, У и угол наклона Wedge
var nX = canvasSize - wX, nY = canvasSize - wY, nA = 3*Math.PI/2; // Х, У и угол наклона Needle
let k = canvasSize/2;

//GRAVITY

function gravityStep(){

    nR =  Math.sqrt((nX - k)  * (nX - k) + (nY - k) * (nY - k));
    if (Math.abs(nR) > 4) {
          nFx += -(nX - k) / Math.sqrt(nR) * M / (nR * nR); // Fx′ = −(x−x′)/√r × M/r²,
          nFy += -(nY - k) / Math.sqrt(nR) * M / (nR * nR); // Fy′ = −(y−y′)/√r × M/r²

          nAx = nFx / needleMass; //ax = Fx/m
          nAy = nFy / needleMass; //ay = Fy/m
          nVx += nAx * dt; //vx* = vx + ax·Δt
          nVy += nAy * dt; //vy* = vy + ay·Δt
          nX += nVx * dt + nAx * dt * dt / 2; //x* = x + vx·Δt + ax·Δt²/2
          nY += nVy * dt + nAy * dt * dt / 2; //y* = y = vy·Δt + ay·Δt²/2
          nFx = nFy = 0;
          }

          wR =  Math.sqrt((wX - k)  * (wX - k) + (wY - k) * (wY - k));
          if (wR > 4) {
          wFx += -(wX - k) / Math.sqrt(wR) * M / (wR * wR); // Fx′ = −(x−x′)/√r × M/r²,
          wFy += -(wY - k) / Math.sqrt(wR) * M / (wR * wR); // Fy′ = −(y−y′)/√r × M/r²

          wAx = wFx / wedgeMass; //ax = Fx/ma
          wAy = wFy / wedgeMass; //ay = Fy/m
          wVx += wAx * dt; //vx* = vx + ax·Δt
          wVy += wAy * dt; //vy* = vy + ay·Δt
          wX += wVx * dt + wAx * dt * dt / 2; //x* = x + vx·Δt + ax·Δt²/2
          wY += wVy * dt + wAy * dt * dt / 2; //y* = y = vy·Δt + ay·Δt²/2
          wFx =  wFy = 0;
    }
}



function isLoop(){ //Зацикливание кораблей, шаг см. в SERVICE

  //wedge
  if (wX > canvasSize + loopStep) wX = -loopStep;
  if (wX < -loopStep) wX = canvasSize + loopStep;
  if (wY > canvasSize + loopStep) wY = -loopStep;
  if (wY < -loopStep) wY = canvasSize + loopStep;

  //needle
  if (nX > canvasSize + loopStep) nX = -loopStep;
  if (nX < -loopStep) nX = canvasSize + loopStep;
  if (nY > canvasSize + loopStep) nY = -loopStep;
  if (nY < -loopStep) nY = canvasSize + loopStep;

  //shots
  for (let s of shots) {
      if (s.x >= canvasSize + 6) s.x = 0;
      if (s.x <= -6) s.x = canvasSize;
      if (s.y >= canvasSize + 6) s.y = 0;
      if (s.y <= -6) s.y = canvasSize;
  }
}


//Stars Generation
let stars1 = [];
let stars2 = [];
let stars3 = [];
let stars4 = [];

for (let i = 0; i < 15; i++){
    stars1.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
}
for (let i = 0; i < 15; i++){
    stars2.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
}
for (let i = 0; i < 50; i++){
    stars2.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
}
for (let i = 0; i < 70; i++){
    stars3.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
}

//DRAWINGS
let  stepX = 0.1, stepY = 0.001; //скорость прокручивания фона

let color1 = 230, color2 = 50, colorStep1 = -1, colorStep2 = 1; //скорость мерцания звезд на фоне
function ExpensivePlanetarium(){

  ctx.fillStyle = "black";
  ctx.fillRect(0,0,800,800);


  ctx.strokeStyle = 'rgb(' + color1 + ',' + color1 + ',' + color1 + ')';
  ctx.fillStyle = ctx.strokeStyle ;

  stars1.forEach(function(elem){
    ctx.beginPath();
    ctx.arc(elem.x, elem.y, 1, 0, 2*Math.PI, false);
    elem.x-=stepX;
    elem.y-=stepY;
    if (elem.x <= 0) elem.x = 1000;
    if (elem.y <= 0) elem.y = 1000;
    ctx.fill();
    ctx.stroke();

  });
  ctx.strokeStyle = 'rgb(' + color2 + ',' + color2 + ',' + color2 + ')';
  ctx.fillStyle = ctx.strokeStyle ;
  stars2.forEach(function(elem){
    ctx.beginPath();
    ctx.arc(elem.x, elem.y, 0.6, 0, 2*Math.PI, false);
    elem.x-=stepX;
    elem.y-=stepY;
    if (elem.x <= 0) elem.x = 1000;
    if (elem.y <= 0) elem.y = 1000;
    ctx.fill();
    ctx.stroke();

  });
  ctx.strokeStyle = 'rgb(' + color1 + ',' + color1 + ',' + color1 + ')';
  ctx.fillStyle = ctx.strokeStyle ;

  stars3.forEach(function(elem){
    ctx.beginPath();
    ctx.arc(elem.x, elem.y, 0.3, 0, 2*Math.PI, false);
    elem.x-=stepX;
    elem.y-=stepY;
    if (elem.x <= 0) elem.x = 1000;
    if (elem.y <= 0) elem.y = 1000;
    ctx.fill();
    ctx.stroke();

  });
  ctx.strokeStyle = 'rgb(' + color2 + ',' + color2 + ',' + color2 + ')';
  ctx.fillStyle = ctx.strokeStyle ;
  stars4.forEach(function(elem){
    ctx.beginPath();
    ctx.arc(elem.x, elem.y, 0.2, 0, 2*Math.PI, false);
    elem.x-=stepX;
    elem.y-=stepY;
    if (elem.x <= 0) elem.x = 1000;
    if (elem.y <= 0) elem.y = 1000;
    ctx.fill();
    ctx.stroke();
  });

  color1 += colorStep1;
  color2 += colorStep2;

  if (color1 < 50 || color1 > 230) colorStep1*=-1;
  if (color2 < 50 || color2 > 230) colorStep2*=-1;

}
function draw() {

    ExpensivePlanetarium();

    //shots
    ctx.fillStyle = "white";
    for (let s of shots) {
        if (s.killer) {
            if (!s.exploded) {
                let n = 100;
                if (s.victim == 0) n = 50 + (50 * wedgeFuelLevel / 3000);
                else if (s.victim == 1) n = 50 + (50 * needleFuelLevel / 3000);
                for (let i = 0; i < n; i++) {
                    let x = 0, y = 0;
                    while ((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) > 1250) {
                        x = Math.floor(Math.floor(Math.random() * ((s.x + 50 * Math.sqrt(2) / 2) - (s.x - 50 * Math.sqrt(2) / 2))) + (s.x - 50 * Math.sqrt(2) / 2));
                        y = Math.floor(Math.floor(Math.random() * ((s.y + 50 * Math.sqrt(2) / 2) - (s.y - 50 * Math.sqrt(2) / 2))) + (s.y - 50 * Math.sqrt(2) / 2));
                    }
                    if (x >= canvasSize) x -= canvasSize;
                    if (x <= 0) x += canvasSize;
                    if (y >= canvasSize) y -= canvasSize;
                    if (y <= 0) y += canvasSize;
                    s.e.push({x: x, y: y});
                }
                s.exploded = true;
            }
            if (s.explosionPause >= 10 && s.explosionPause < 20) {
                if (s.explosionPause == 10) {
                    s.e.length = 0;
                    let n = 75;
                    if (s.victim == 0) n = 38 + (37 * wedgeFuelLevel / 3000);
                    else if (s.victim == 1) n = 38 + (37 * needleFuelLevel / 3000);
                    for (let i = 0; i < n; i++) {
                        let x = 0, y = 0;
                        while ((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) > 1250) {
                            x = Math.floor(Math.floor(Math.random() * ((s.x + 50 * Math.sqrt(2) / 2) - (s.x - 50 * Math.sqrt(2) / 2))) + (s.x - 50 * Math.sqrt(2) / 2));
                            y = Math.floor(Math.floor(Math.random() * ((s.y + 50 * Math.sqrt(2) / 2) - (s.y - 50 * Math.sqrt(2) / 2))) + (s.y - 50 * Math.sqrt(2) / 2));
                        }
                        if (x >= canvasSize) x -= canvasSize;
                        if (x <= 0) x += canvasSize;
                        if (y >= canvasSize) y -= canvasSize;
                        if (y <= 0) y += canvasSize;
                        s.e.push({x: x, y: y});
                    }
                }
                ctx.fillStyle = "silver";
            }
            if (s.explosionPause >= 20) {
                if (s.explosionPause == 20) {
                    s.e.length = 0;
                    let n = 50;
                    if (s.victim == 0) n = 25 + (25 * wedgeFuelLevel / 3000);
                    else if (s.victim == 1) n = 25 + (25 * needleFuelLevel / 3000);
                    for (let i = 0; i < n; i++) {
                        let x = 0, y = 0;
                        while ((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) > 1250) {
                            x = Math.floor(Math.floor(Math.random() * ((s.x + 50 * Math.sqrt(2) / 2) - (s.x - 50 * Math.sqrt(2) / 2))) + (s.x - 50 * Math.sqrt(2) / 2));
                            y = Math.floor(Math.floor(Math.random() * ((s.y + 50 * Math.sqrt(2) / 2) - (s.y - 50 * Math.sqrt(2) / 2))) + (s.y - 50 * Math.sqrt(2) / 2));
                        }
                        if (x >= canvasSize) x -= canvasSize;
                        if (x <= 0) x += canvasSize;
                        if (y >= canvasSize) y -= canvasSize;
                        if (y <= 0) y += canvasSize;
                        s.e.push({x: x, y: y});
                    }
                }
                ctx.fillStyle = "grey";
            }
            let n = s.e.length;
            for (let i = 0; i < n; i++) ctx.fillRect(s.e[i].x, s.e[i].y, 2, 2);
            ctx.fillStyle = "white";
            s.explosionPause++;
        } else if (s.lifeTime < shotMaximumLifeTime && s.owner != 2) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle);
            ctx.fillRect(0, 0, shotWidth, shotHeight);
            ctx.restore();
        } else if (s.owner != 2) {
            if (!s.exploded) {
                for (let i = 0; i < 3; i++) {
                    s.e.push({x: Math.floor(Math.floor(Math.random() * ((s.x + 10) - (s.x - 10))) + (s.x - 10)),
                              y: Math.floor(Math.floor(Math.random() * ((s.y + 10) - (s.y - 10))) + (s.y - 10))});
                    if (s.x >= canvasSize) s.x -= canvasSize;
                    if (s.x <= 0) s.x += canvasSize;
                    if (s.y >= canvasSize) s.y -= canvasSize;
                    if (s.y <= 0) s.y += canvasSize;
                }
                s.exploded = true;
            }
            for (let i = 0; i < 3; i++) ctx.fillRect(s.e[i].x, s.e[i].y, 2, 2);
            s.explosionPause += 3;
        }
    }

    //ships' rotation
        //wedge
    if (wedgeAlive) {
        ctx.save();
        ctx.translate(wX, wY);
        ctx.rotate(wA);
        ctx.translate( - wedgeOriginDeltaX, - wedgeOriginDeltaY);
        if (wedgeNitroState > 0 && wedgeNitroState <= 20) wedgeNitroState++;
        drawWedge();
        ctx.restore();
    }
        //needle
    if (needleAlive) {
        ctx.save();
        ctx.translate(nX, nY);
        ctx.rotate(nA);
        ctx.translate(- needleWidth/2, - needleHeight/2);
        if (needleNitroState > 0 && needleNitroState <= 20) needleNitroState++;
        drawNeedle();
        ctx.restore();
    }

    //center's rotation
   if (centerState < 20 || centerState == 40) {
         ctx.save();
         ctx.translate(canvasSize/2, canvasSize/2);
         ctx.rotate(Math.PI/4);
         ctx.translate(-canvasSize/2 + 1 , -canvasSize/2 - 1  );
         drawSun(6,2);
         ctx.restore();
         drawSun(10,2);
        if (centerState < 20) centerState++;
        else centerState = 1;
    } else {
        ctx.save();
        ctx.translate(canvasSize/2, canvasSize/2);
        ctx.rotate(Math.PI/4);
        ctx.translate(-canvasSize/2 + 1 , -canvasSize/2 - 1  );
        drawSun(10,2);
        ctx.restore();
        drawSun(6,2);
        centerState++;
    }

    //gravity effect
    gravityStep();
    isLoop();
    ctx.closePath();
    requestAnimationFrame(draw);

}


function drawSun(l,r){

    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(canvasSize/2 - r, canvasSize/2);
    ctx.lineTo(canvasSize/2, canvasSize/2 - l);

    ctx.lineTo(canvasSize/2 + r, canvasSize/2);
    ctx.lineTo(canvasSize/2 + r + l, canvasSize/2 + r);

    ctx.lineTo(canvasSize/2 + r, canvasSize/2 + 2*r) ;
    ctx.lineTo(canvasSize/2, canvasSize/2 + 2 * r + l);

    ctx.lineTo(canvasSize/2 - r, canvasSize/2 + 2 * r);
    ctx.lineTo(canvasSize/2 - r - l, canvasSize/2 + r);

    ctx.closePath();
    ctx.fill();

}

function drawWedge() {
    if (wX != 400 && wY != 400) {
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        ctx.moveTo(0, 0);
        let n = wedge.length;
        for (let i = 0; i < n; i += 2) {
            ctx.beginPath();
            ctx.arc(wedge[i].x, wedge[i].y, wedge[i].r, wedge[i].a1, wedge[i].a2, false);
            ctx.arc(wedge[i+1].x, wedge[i+1].y, wedge[i+1].r, wedge[i+1].a1, wedge[i+1].a2, false);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        if (wedgeNitroState > 0) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(wedgeNitro[Math.floor(wedgeNitroState/5)].x, wedgeNitro[Math.floor(wedgeNitroState/5)].y);
            ctx.lineTo(0, 8);
            ctx.closePath();
            ctx.fillStyle = "white";
            ctx.fill();
        }
    }
}

function drawNeedle() {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    let n = needle.length;
    for (let i = 1; i < n - 2; i++) ctx.lineTo(needle[i].x, needle[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(needle[n-2].x, needle[n-2].y);
    ctx.lineTo(needle[2].x, needle[2].y);
    ctx.moveTo(needle[n-1].x, needle[n-1].y);
    ctx.lineTo(needle[6].x, needle[6].y);
    ctx.moveTo(needle[n-2].x, needle[n-2].y);
    ctx.closePath();
    ctx.stroke();
    if (needleNitroState > 0) {
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.lineTo(needleNitro[Math.floor(needleNitroState/5)].x, needleNitro[Math.floor(needleNitroState/5)].y);
        ctx.lineTo(0, 16);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

  draw();
  keysControl();
  shotsControl();
  automaticUpdate();