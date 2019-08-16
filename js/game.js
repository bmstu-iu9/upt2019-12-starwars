var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");
var canvasSize = 800;

//IMAGES
//  size

var shipWidth = 70, shipHeight = 28;
var shotWidth = 6, shotHeight = 1;
var centerWidth = 25, centerHeight = 25;

//  sources

var bg = [];
var wedge = [], wedgeNitro = [];
var needle = [], needleNitro = [];
var center = new Image();

for (let i = 0; i < 5; i++) {
    bg[i] = new Image();
}

bg[0].src = "img/ep/bg1.png";
bg[1].src = "img/ep/bg2.png";
bg[2].src = "img/ep/bg3.png";
bg[3].src = "img/ep/bg4.png";
bg[4].src = "img/ep/bg5.png";
center.src = "img/center.png";

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

needle.push({x: 13, y: 0});
needle.push({x: 20, y: 6});
needle.push({x: 0, y: 6});
needle.push({x: 41, y: 6});
needle.push({x: 47, y: 9});
needle.push({x: 41, y: 12});
needle.push({x: 0, y: 12});
needle.push({x: 20, y: 12});
needle.push({x: 13, y: 18});
needle.push({x: 0, y: 18});
needle.push({x: 0, y: 0});
needleNitro.push({x: -8, y: 9});
needleNitro.push({x: -12, y: 9});
needleNitro.push({x: -15, y: 9});
needleNitro.push({x: -18, y: 9});
needleNitro.push({x: -22, y: 9});

//SERVICE
var rotationAngle = Math.PI/50; //шаг вращения кораблей
var centerState = 0, wedgeNitroState = 0, needleNitroState = 0;
var keys = [], shots = [];
var shotMaximumLifeTime = 4000, shotSpeed = 1, rechargeTime = 500;
var wedgeFuelLevel = 30000, needleFuelLevel = 30000, wedgeShotsNumber = 33, wedgeLastShotTime = rechargeTime, needleShotsNumber = 33, needleLastShotTime = rechargeTime;
let nitroPower = 0.05; //МОЩНОСТЬ НИТРО: чем больше, тем сильнее тяга
    //loop helpers
let loopStep = 40; // 28 <= loopStep <= 70
    //gravity helpers
let dt = 1, M = 100, m = 10; //Дельта время, масса звезды, масса корабля
let nFx = 0, nFy = 0, nR;
let nAx, nAy, nVx = nVy = 0;
let wFx = 0, wFy = 0, wR;
let wAx, wAy, wVx = wVy = 0;


//CONTROLS

function keysControl() {
    // Wedge
        // KeyA down - left
    if (keys[65]) {
        wA -= rotationAngle;
        while (wA < 0) wA += 2*Math.PI;
    }
        // KeyD down - right
    if (keys[68]) {
        wA += rotationAngle;
        while (wA > 2*Math.PI) wA -= 2*Math.PI;
    }
        // KeyW down - shot
    if (keys[87] && wedgeShotsNumber > 0 && wedgeLastShotTime >= rechargeTime) {
        shots.push({angle: wA,
                    x: wX + shipWidth/2 + (shipWidth/2 * Math.cos(wA)) - (shotWidth * Math.cos(wA)),
                    y: wY + shipHeight/2 + (shipWidth/2 * Math.sin(wA)) - (shotWidth * Math.sin(wA)),
                    lifeTime: 0});
        wedgeShotsNumber--;
        wedgeLastShotTime = 0;
    }
        // KeyS down - nitro
    if (keys[83] && wedgeFuelLevel > 0) {
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
        wedgeFuelLevel -= 10;
        if (wedgeFuelLevel <= 0) keys[83] = false;
    }
        // KeyS up - nitro off
    if (!keys[83]) wedgeNitroState = 0;

    // Needle
    // KeyJ down - left
    if (keys[74]) {
        nA -= rotationAngle;
        while (nA < 0) nA += 2 * Math.PI;
    }
    // KeyL down - right
    if (keys[76]) {
        nA += rotationAngle;
        while (nA > 2*Math.PI) nA -= 2 * Math.PI;
    }
    // KeyI down - shot
    if (keys[73] && needleShotsNumber > 0 && needleLastShotTime >= rechargeTime) {
        shots.push({angle: nA,
                    x: nX + shipWidth/2 + (shipWidth/2 * Math.cos(nA)) - (shotWidth * Math.cos(nA)),
                    y: nY + shipHeight/2 + (shipWidth/2 * Math.sin(nA)) - (shotWidth * Math.sin(nA)),
                    lifeTime: 0});
        needleShotsNumber--;
        needleLastShotTime = 0;
    }
    // KeyK down - nitro
    if (keys[75] && needleFuelLevel > 0) {
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
        needleFuelLevel -= 10;
        if (needleFuelLevel <= 0) keys[75] = false;
    }
    // KeyK up - nitro off
    if (!keys[75]) needleNitroState = 0;
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
        shots[i].lifeTime += 10;
        if (shots[i].lifeTime < shotMaximumLifeTime)
        {
            shots[i].x += shotSpeed * Math.cos(shots[i].angle);
            shots[i].y += shotSpeed * Math.sin(shots[i].angle);
        } else {
            shots.splice(i, 1);
            i--;
            l--;
        }
    }
    setTimeout(shotsControl, 10);
}

var wX = 15, wY = 36, wA = Math.PI/2; // Х, У и угол наклона Wedge
var nX = canvasSize - shipWidth - wX, nY = canvasSize - shipHeight - wY, nA = 3*Math.PI/2; // Х, У и угол наклона Needle
var cX = canvasSize/2 - centerWidth/2 , cY = canvasSize/2 - centerWidth/2; //X, Y центра
let k = canvasSize/2 - 1.5* centerWidth;

//GRAVITY

function gravityStep(){

    nR =  Math.sqrt((nX - k)  * (nX - k) + (nY - k) * (nY - k));
    if (Math.abs(nR) > 4) {
          nFx += -(nX - k) / Math.sqrt(nR) * M / (nR * nR); // Fx′ = −(x−x′)/√r × M/r²,
          nFy += -(nY - k) / Math.sqrt(nR) * M / (nR * nR); // Fy′ = −(y−y′)/√r × M/r²

          nAx = nFx / m; //ax = Fx/m
          nAy = nFy / m; //ay = Fy/m
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

          wAx = wFx / m; //ax = Fx/ma
          wAy = wFy / m; //ay = Fy/m
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

}

//DRAWINGS
let bgX = 0, cond = 0, step = 5; //координата фона, текущее состояние и скорость мерцания
function draw() {

    //backgrownd
    ctx.drawImage(bg[Math.floor(cond / 100)], bgX, 0);
    cond += step;
    if (cond == 400 || cond  == 0) step *= -1;
    bgX -= 0.1; // скорость прокрутки фона по горизонтали
    if (bgX == -4096) bgX = 0;
    ctx.save();

    //shots
    ctx.fillStyle = "white";
    for (let s of shots) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.fillRect(0, 0, shotWidth, shotHeight);
        ctx.restore();
    }

    //ships' rotation
        //wedge
    ctx.translate(wX + shipWidth/2, wY + shipHeight/2);
    ctx.rotate(wA);
    ctx.translate(- shipWidth/2, - shipHeight/2);
    if (wedgeNitroState > 0 && wedgeNitroState <= 20) wedgeNitroState++;
    drawWedge();
    ctx.restore();
    ctx.save();
        //needle
    ctx.translate(nX + shipWidth/2, nY + shipHeight/2);
    ctx.rotate(nA);
    ctx.translate(- shipWidth/2, - shipHeight/2);
    if (needleNitroState > 0 && needleNitroState <= 20) needleNitroState++;
    drawNeedle();
    ctx.restore();

    //center's rotation
    if (centerState < 20 || centerState == 40) {
        ctx.save();
        ctx.translate(canvasSize/2, canvasSize/2);
        ctx.rotate(Math.PI/4);
        ctx.drawImage(center, -centerWidth/2, -centerHeight/2);
        ctx.restore();
        if (centerState < 20) centerState++;
        else centerState = 1;
    } else {
        ctx.drawImage(center, cX, cY);
        centerState++;
    }

    //gravity effect
    gravityStep();
    isLoop();
    requestAnimationFrame(draw);
}

function drawWedge() {
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

function drawNeedle() {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    let n = needle.length;
    for (let i = 0; i < n; i++) {
        ctx.lineTo(needle[i].x, needle[i].y);
        if (i == 1) ctx.moveTo(needle[i+1].x, needle[++i].y);
        if (i == 6) ctx.moveTo(needle[i+1].x, needle[++i].y);
    }
    ctx.moveTo(0, 0);
    ctx.closePath();
    ctx.fill();
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

center.onload = draw;
keysControl();
shotsControl();
