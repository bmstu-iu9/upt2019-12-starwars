var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

var bg = [];
var wedge = [];
var needle = [];
var center = new Image();

//IMAGE SIZES
var canvasSize = 800;
var shipWidth = 70, shipHeight = 28;
var centerWidth = 25, centerHeight = 25;

//sources

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

var rotationAngle = Math.PI/50;
var centerState = 0, wedgeNitroState = 0, needleNitroState = 0;
var keys = [];

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
    // KeyW down - bang
    //if (keys[87]) {}
    // KeyS down - nitro
    if (keys[83]) {
        if (0 <= wA && wA <= Math.PI) {
            wY += Math.abs(Math.tan(wA)*Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA))));
        } else {
            wY -= Math.abs(Math.tan(wA)*Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA))));
        }
        if (Math.PI/2 <= wA && wA <=3*Math.PI/2) {
            wX -= Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA)));
        } else {
              wX += Math.sqrt(10/(1+Math.tan(wA)*Math.tan(wA)));
            }
        if (wedgeNitroState == 0) wedgeNitroState = 1;
    }
    // KeyS up - nitro off
    if (!keys[83]) wedgeNitroState = 0;
    // Needle
    // KeyJ down - left
    if (keys[74]) {
        nA -= rotationAngle;
        while (nA < 0) nA += 2*Math.PI;
    }
    // KeyL down - right
    if (keys[76]) {
        nA += rotationAngle;
        while (nA > 2*Math.PI) nA -= 2*Math.PI;
    }
    // KeyI down - bang
    //if (keys[73]) {}
    // KeyK down - nitro
    if (keys[75]) {
        if (0 <= nA && nA <= Math.PI) {
            nY += Math.abs(Math.tan(nA)*Math.sqrt(10/(1+Math.tan(nA)*Math.tan(nA))));
        } else {
            nY -= Math.abs(Math.tan(nA)*Math.sqrt(10/(1+Math.tan(nA)*Math.tan(nA))));
        }
        if (Math.PI/2 <= nA && nA <= 3*Math.PI/2) {
            nX -= Math.sqrt(10/(1+Math.tan(nA)*Math.tan(nA)));
        } else {
            nX += Math.sqrt(10/(1+Math.tan(nA)*Math.tan(nA)));
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
var dif = 0.001; //расстояние от корабля до центра
var gravity =  40000; //от гравитации зависит ускорение при приближении к центру,  чем больше - тем быстрее

function gravityStep(){
    dif =(wX - cX) * (wX - cX) + (wY - cY) * (wY - cY);
    if (Math.abs(cX - wX) < centerWidth/2 && Math.abs(cY - wY) < centerHeight/2 ) {
        alert("Wedge died =(");
        location.reload();
    }
    if (cX > wX) wX += (gravity/dif);
    else if (cX != wX) wX-=(gravity/dif);
    if (cY > wY) wY += (gravity/dif);
    else if (cY != wY) wY -= (gravity/dif);
    dif = (nX - cX) * (nX - cX) + (nY - cY) * (nY - cY);
    if (Math.abs(cX - nX) < centerWidth/2 && Math.abs(cY - nY) < centerHeight/2 ) {
        alert("Needle died =(");
        location.reload();
    }
    if (cX > nX) nX += (gravity/dif);
    else if (cX != nX) nX -= (gravity/dif);
    if (cY > nY) nY += (gravity/dif);
    else if (cY != nY) nY -= (gravity/dif);
}

let bgX = 0, cond = 0, step = 5;

function draw() {
    ctx.drawImage(bg[Math.floor(cond / 100)], bgX, 0);
    cond += step;
    if (cond == 400 || cond  == 0) step *= -1;
    bgX -= 0.1;
    if (bgX == -4096) bgX = 0;
    ctx.save();
    ctx.translate(wX + shipWidth/2, wY + shipHeight/2);
    ctx.rotate(wA);
    ctx.translate(- shipWidth/2, - shipHeight/2);
    if (wedgeNitroState > 0 && wedgeNitroState <= 20) wedgeNitroState++;
    ctx.drawImage(wedge[Math.floor(wedgeNitroState/5)], 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(nX + shipWidth/2, nY + shipHeight/2);
    ctx.rotate(nA);
    ctx.translate(- shipWidth/2, - shipHeight/2);
    if (needleNitroState > 0 && needleNitroState <= 20) needleNitroState++;
    ctx.drawImage(needle[Math.floor(needleNitroState/5)], 0, 0);
    ctx.restore();
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
    gravityStep();
    requestAnimationFrame(draw);
}

center.onload = draw;
keysControl();
