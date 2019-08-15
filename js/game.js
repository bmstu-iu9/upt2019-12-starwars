var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");
var canvasSize = 800;

//IMAGES
//  size

var shipWidth = 70, shipHeight = 28;
var centerWidth = 25, centerHeight = 25;

//  sources

var bg = [];
var wedge = [];
var needle = [];
var center = new Image();

for (let i = 0; i < 5; i++) {
    bg[i] = new Image();
}

bg[0].src = "img/ep/bg1.png";
bg[1].src = "img/ep/bg2.png";
bg[2].src = "img/ep/bg3.png";
bg[3].src = "img/ep/bg4.png";
bg[4].src = "img/ep/bg5.png";

for (let i = 0; i < 6; i++) {
    wedge[i] = new Image();
    needle[i] =  new Image();
}

wedge[0].src = "img/wedge/wedge_neutral.png";
wedge[1].src = "img/wedge/wedge_nitro1.png";
wedge[2].src = "img/wedge/wedge_nitro2.png";
wedge[3].src = "img/wedge/wedge_nitro3.png";
wedge[4].src = "img/wedge/wedge_nitro4.png";
wedge[5].src = "img/wedge/wedge_nitro5.png";
needle[0].src = "img/needle/needle_neutral.png";
needle[1].src = "img/needle/needle_nitro1.png";
needle[2].src = "img/needle/needle_nitro2.png";
needle[3].src = "img/needle/needle_nitro3.png";
needle[4].src = "img/needle/needle_nitro4.png";
needle[5].src = "img/needle/needle_nitro5.png";
center.src = "img/center.png";

//SERVICE
var rotationAngle = Math.PI/50; //шаг вращения кораблей
var centerState = 0, wedgeNitroState = 0, needleNitroState = 0;
var keys = [];
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
    //if (keys[87]) {}
        // KeyS down - nitro
    if (keys[83]) {
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
    //if (keys[73]) {}
    // KeyK down - nitro
    if (keys[75]) {
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
    }
    // KeyK up - nitro off
    if (!keys[75]) needleNitroState = 0;
    setTimeout(keysControl, 10);
}

document.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});

document.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

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

    //ships' rotation
        //wedge
    ctx.translate(wX + shipWidth/2, wY + shipHeight/2);
    ctx.rotate(wA);
    ctx.translate(- shipWidth/2, - shipHeight/2);
    if (wedgeNitroState > 0 && wedgeNitroState <= 20) wedgeNitroState++;
    ctx.drawImage(wedge[Math.floor(wedgeNitroState/5)], 0, 0);
    ctx.restore();
    ctx.save();
        //needle
    ctx.translate(nX + shipWidth/2, nY + shipHeight/2);
    ctx.rotate(nA);
    ctx.translate(- shipWidth/2, - shipHeight/2);
    if (needleNitroState > 0 && needleNitroState <= 20) needleNitroState++;
    ctx.drawImage(needle[Math.floor(needleNitroState/5)], 0, 0);
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

center.onload = draw;
keysControl();
