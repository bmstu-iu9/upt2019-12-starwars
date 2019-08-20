var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

let canvasSize = 800;
let shotWidth = 6, shotHeight = 1; //размеры текстуры летящей торпеды
let rotationAngle = Math.PI/50; //угол поворота кораблей при вращении
let centerState = 0; //переменная-индикатор мерцания звезды в центре
let keys = [], shots = []; //массивы для отслеживания клавиш и торпед
let shotMaximumLifeTime = 4000, shotMaximumExlposionPause = 30; // ↵
//основыные переменные жизненного цикла выпущенной торпеды: период полёта и период взрыва
let shotSpeed = 1, rechargeTime = 500; //базовая скорость торпеды и минимальный промежуток времени до запуска следующей
let nitroPower = 0.02; //мощность двигателя кораблей
let deltaTime = 1, M = 140, m = 8; //скорость, масса звезды, масса корабля без топлива
let k = canvasSize/2; //координаты (x == k && y == k) точки притяжения на поле (== центра звезды)
let stars1 = [], stars2 = [], stars3 = [], stars4 = []; //массивы звезд разных величин
let stepX = 0.1, stepY = 0.001; //шаг прокрутки фона по осям
let color1 = 230, color2 = 50, colorStep1 = -1, colorStep2 = 1; //интенсивность мерцания звезд 1 и 3 величины и 2 и 4

//объекты, описывающие корабли
let wedge = {width: 47, height: 23,
             //уникальные поля для Wedge, сзязанные с тем, что центр системы координат при прорисовки корабля
             //расположен не в левом верхнем углу текстуры и с тем, что координаты контрольных точек зацикливания поля,
             //в отличие от Needle не хранятся в массиве с точками для отрисовки
             originDeltaX: 20, originDeltaY: 4, loopControlPoints: [],
             angle: Math.PI/2, x: 200, y: 210,
             //массив основных элементов прорисовки (41 стр. -- дуг),
             //координат кончика пламени из сопла на разных этапах работы двигателя и поле-индикатор этих этапов
             d: [], nitro: [], nitroState: 0,
             double: false, doubleSide: [], //поля для зацикливания поля
             alive: true, fuelLevel: 3000, shotsNumber: 33, lastShotPause: rechargeTime,
             weight: m + 10, Fx: 0, Fy: 0, R: 0, ax: 0, ay: 0,
             speedX: 0, speedY: 0},
    needle = {width: 47, height: 18,
              angle: 3 * Math.PI/2, x: 600, y: 590,
              d: [], nitro: [], nitroState: 0,
              double: false, doubleSide: [],
              alive: true, fuelLevel: 3000, shotsNumber: 33, lastShotPause: rechargeTime,
              weight: m + 10, Fx: 0, Fy: 0, R: 0, ax: 0, ay: 0,
              speedX: 0, speedY: 0};

//координаты ключевых элементов (в основном точек) кораблей: для прорисовки, отслеживания попадания и зацикливания поля
function shipsInit() {
    wedge.d.push({x: 12, y: -19, r: 19, a1: Math.acos(1/Math.sqrt(10)), a2: Math.acos(-14/Math.sqrt(365))});
    wedge.d.push({x: 4, y: 12, r: 19, a1: -Math.acos(-1/Math.sqrt(10)), a2: -Math.acos(14/Math.sqrt(365))});
    wedge.d.push({x: 4, y: -4, r: 19, a1: Math.acos(14/Math.sqrt(365)), a2: Math.acos(-1/Math.sqrt(10))});
    wedge.d.push({x: 12, y: 27, r: 19, a1: -Math.acos(-14/Math.sqrt(365)), a2: -Math.acos(1/Math.sqrt(10))});
    wedge.d.push({x: 20, y: 35, r: 40, a1: -Math.acos(-4/Math.sqrt(65)), a2: -Math.acos(25/Math.sqrt(1586))});
    wedge.d.push({x: 20, y: -27, r: 40, a1: Math.acos(25/Math.sqrt(1586)), a2: Math.acos(-4/Math.sqrt(65))});
    wedge.nitro.push({x: -8, y: 4});
    wedge.nitro.push({x: -12, y: 4});
    wedge.nitro.push({x: -15, y: 4});
    wedge.nitro.push({x: -18, y: 4});
    wedge.nitro.push({x: -22, y: 4});
    wedge.loopControlPoints.push({x: 50, y: 0});
    wedge.loopControlPoints.push({x: -2, y: -7});
    wedge.loopControlPoints.push({x: -2, y: -14});
    needle.d.push({x: 0, y: 0});
    needle.d.push({x: 13, y: 0});
    needle.d.push({x: 20, y: 6});
    needle.d.push({x: 41, y: 6});
    needle.d.push({x: 47, y: 9});
    needle.d.push({x: 41, y: 12});
    needle.d.push({x: 20, y: 12});
    needle.d.push({x: 13, y: 18});
    needle.d.push({x: 0, y: 18});
    needle.d.push({x: 0, y: 6});
    needle.d.push({x: 0, y: 12});
    needle.nitro.push({x: -8, y: 9});
    needle.nitro.push({x: -12, y: 9});
    needle.nitro.push({x: -15, y: 9});
    needle.nitro.push({x: -18, y: 9});
    needle.nitro.push({x: -22, y: 9});
}

//мины на звезде
shots.push({owner: 2, x: 400, y: 390,
            lifeTime: 1,
            killer: false, victim: -1,
            exploded: false, explosionPause: 0, e: []});
shots.push({owner: 2, x: 410, y: 400,
            lifeTime: 1,
            killer: false, victim: -1,
            exploded: false, explosionPause: 0, e: []});
shots.push({owner: 2, x: 400, y: 410,
            lifeTime: 1,
            killer: false, victim: -1,
            exploded: false, explosionPause: 0, e: []});
shots.push({owner: 2, x: 390, y: 400,
            lifeTime: 1,
            killer: false, victim: -1,
            exploded: false, explosionPause: 0, e: []});

document.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});

document.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

//Отслеживание нажатия и отжатия клавиш
function keysControl() {
    //A ▼ -- поворот Wedge по часовой стрелке
    if (keys[65] && wedge.alive) {
        wedge.angle -= rotationAngle;
        while (wedge.angle < 0) wedge.angle += 2 * Math.PI;
    }
    //D ▼ -- поворот Wedge против часовой стрелки
    if (keys[68] && wedge.alive) {
        wedge.angle += rotationAngle;
        while (wedge.angle > 2 * Math.PI) wedge.angle -= 2 * Math.PI;
    }
    //W ▼ -- выстрел Wedge
    if (keys[87] && wedge.shotsNumber > 0 && wedge.lastShotPause >= rechargeTime && wedge.alive) {
        let sx = wedge.speedX - (wedge.ax * deltaTime);
        let sy = wedge.speedY - (wedge.ay * deltaTime);
        shots.push({owner: 0, angle: wedge.angle + Math.PI,
                    x: wedge.x + (wedge.width/2 * Math.cos(wedge.angle)) + (4 * Math.cos(wedge.angle)),
                    y: wedge.y + (wedge.width/2 * Math.sin(wedge.angle)) + (shotWidth * Math.sin(wedge.angle)),
                    //тут происходит расчёт внешней баллистики. Торпеды ведут себя странно, зато физически верно!
                    speedX: (shotSpeed + sx * Math.cos(wedge.angle - Math.acos(sx / Math.sqrt(sx * sx + sy * sy)))) * Math.cos(wedge.angle),
                    speedY: (shotSpeed + sy * Math.cos(wedge.angle - Math.acos(sx / Math.sqrt(sx * sx + sy * sy)))) * Math.sin(wedge.angle),
                    lifeTime: 0,
                    killer: false, victim: -1,
                    exploded: false, explosionPause: 0, e: []});
        wedge.shotsNumber--;
        wedge.lastShotPause = 0;
    }
    //S ▼ -- включение тяги Wedge
    if (keys[83] && wedge.fuelLevel > 0 && wedge.alive) {
        if (0 <= wedge.angle && wedge.angle <= Math.PI) {
            wedge.Fy += Math.abs(Math.tan(wedge.angle) * Math.sqrt(10 / (1 + Math.tan(wedge.angle) * Math.tan(wedge.angle)))) * nitroPower;
        } else {
            wedge.Fy -= Math.abs(Math.tan(wedge.angle) * Math.sqrt(10 / (1 + Math.tan(wedge.angle) * Math.tan(wedge.angle)))) * nitroPower;
        }
        if (Math.PI/2 <= wedge.angle && wedge.angle <= 3 * Math.PI/2) {
            wedge.Fx -= Math.sqrt(10 / (1 + Math.tan(wedge.angle) * Math.tan(wedge.angle))) * nitroPower;
        } else {
            wedge.Fx += Math.sqrt(10 / (1 + Math.tan(wedge.angle) * Math.tan(wedge.angle))) * nitroPower;
        }
        if (wedge.nitroState == 0) wedge.nitroState = 1;
        wedge.fuelLevel -= 1;
        wedge.weight = m +  wedge.fuelLevel / 300; //пересчёт массы при уменьшении количества топлива
        if (wedge.fuelLevel <= 0) keys[83] = false; //автоматическое отключение двигателя после сгорания всего топлива
    }
    //S ▲ -- выключение тяги Wedge
    if (!keys[83] && wedge.alive) wedge.nitroState = 0;
    //L ▼ -- поворот Needle по часовой стрелке
    if (keys[74] && needle.alive) {
        needle.angle -= rotationAngle;
        while (needle.angle < 0) needle.angle += 2 * Math.PI;
    }
    //J ▼ -- поворот Needle против часовой стрелки
    if (keys[76] && needle.alive) {
        needle.angle += rotationAngle;
        while (needle.angle > 2 * Math.PI) needle.angle -= 2 * Math.PI;
    }
    //I ▼ -- выстрел Needle
    if (keys[73] && needle.shotsNumber > 0 && needle.lastShotPause >= rechargeTime && needle.alive) {
        let sx = needle.speedX - (needle.ax * deltaTime);
        let sy = needle.speedY - (needle.ay * deltaTime);
        shots.push({owner: 1, angle: needle.angle + Math.PI,
                    x: needle.x + (needle.width/2 * Math.cos(needle.angle)) + (5 * Math.cos(needle.angle)),
                    y: needle.y + (needle.width/2 * Math.sin(needle.angle)) + (shotWidth * Math.sin(needle.angle)),
                    //тут происходит расчёт внешней баллистики. Торпеды ведут себя странно, зато физически верно!
                    speedX: (shotSpeed + sx * Math.cos(needle.angle - Math.acos(sx / Math.sqrt(sx * sx + sy * sy)))) * Math.cos(needle.angle),
                    speedY: (shotSpeed + sy * Math.cos(needle.angle - Math.acos(sx / Math.sqrt(sx * sx + sy * sy)))) * Math.sin(needle.angle),
                    lifeTime: 0,
                    killer: false, victim: -1,
                    exploded: false, explosionPause: 0, e: []});
        needle.shotsNumber--;
        needle.lastShotPause = 0;
    }
    //K ▼ -- включение тяги Needle
    if (keys[75] && needle.fuelLevel > 0 && needle.alive) {
        if (0 <= needle.angle && needle.angle <= Math.PI) {
            needle.Fy += Math.abs(Math.tan(needle.angle) * Math.sqrt(10 / (1 + Math.tan(needle.angle) * Math.tan(needle.angle)))) * nitroPower;
        } else {
            needle.Fy -= Math.abs(Math.tan(needle.angle) * Math.sqrt(10 / (1 + Math.tan(needle.angle) * Math.tan(needle.angle)))) * nitroPower;
        }
        if (Math.PI/2 <= needle.angle && needle.angle <= 3 * Math.PI/2) {
            needle.Fx -= Math.sqrt(10 / (1 + Math.tan(needle.angle) * Math.tan(needle.angle))) * nitroPower;
        } else {
            needle.Fx += Math.sqrt(10 / (1 + Math.tan(needle.angle) * Math.tan(needle.angle))) * nitroPower;
        }
        if (needle.nitroState == 0) needle.nitroState = 1;
        needle.fuelLevel -= 1;
        needle.weight = m +  needle.fuelLevel / 300; //пересчёт массы при уменьшении количества топлива
        if (needle.fuelLevel <= 0) keys[75] = false; //автоматическое отключение двигателя после сгорания всего топлива
    }
    //K ▲ -- выключение тяги Needle
    if (!keys[75] && needle.alive) needle.nitroState = 0;
    wedge.lastShotPause += 10;
    needle.lastShotPause += 10;
    setTimeout(keysControl, 10);
}

//Отслеживание впущенных торпед (а также взрывов и мин)
function shotsControl() {
    let l = shots.length;
    for (let i = 0; i < l; i++) {
        if (shots[i].owner != 2) shots[i].lifeTime += 10;
        if (shots[i].lifeTime < shotMaximumLifeTime && !shots[i].killer) {
            if (shots[i].owner != 2) {
                shots[i].x += shots[i].speedX;
                shots[i].y += shots[i].speedY;
            }
            //проверка на попадание в Wedge
            if (wedge.alive) {
                let n = wedge.d.length;
                for (let o = 0; o < n; o += 2) {
                    //здесь и далее встречаются такие пересчёты координат. Связаны они с тем, что в целях экономии времени на постоянный пересчёт
                    //координат ключевых элементов кораблей при отрисовке они хранятся в относительной системе координат,
                    //которая задаётся ctx.translate() и ctx.rotate() в функции draw();
                    let wrx1 = (wedge.d[o].x - wedge.originDeltaX) * Math.cos(wedge.angle) - (wedge.d[o].y - wedge.originDeltaY) * Math.sin(wedge.angle) + wedge.x;
                    let wry1 = (wedge.d[o].x - wedge.originDeltaX) * Math.sin(wedge.angle) + (wedge.d[o].y - wedge.originDeltaY) * Math.cos(wedge.angle) + wedge.y;
                    let wrx2 = (wedge.d[o+1].x - wedge.originDeltaX) * Math.cos(wedge.angle) - (wedge.d[o+1].y - wedge.originDeltaY) * Math.sin(wedge.angle) + wedge.x;
                    let wry2 = (wedge.d[o+1].x - wedge.originDeltaX) * Math.sin(wedge.angle) + (wedge.d[o+1].y - wedge.originDeltaY) * Math.cos(wedge.angle) + wedge.y;
                    if ((shots[i].x - wrx1) * (shots[i].x - wrx1) + (shots[i].y - wry1) * (shots[i].y - wry1) <= wedge.d[o].r * wedge.d[o].r &&
                        (shots[i].x - wrx2) * (shots[i].x - wrx2) + (shots[i].y - wry2) * (shots[i].y - wry2) <= wedge.d[o+1].r * wedge.d[o+1].r) {
                        shots[i].killer = true;
                        shots[i].victim = 0;
                        wedge.alive = false;
                        break;
                    }
                }
            }
            //проверка на попадание в Needle (трассировка горизонтального луча)
            if (needle.alive) {
                let n = needle.d.length - 2, c = false, j = n - 1;
                for (let o = 0; o < n; o++) {
                    let nrxo = (needle.d[o].x - needle.width/2) * Math.cos(needle.angle) - (needle.d[o].y - needle.height/2) * Math.sin(needle.angle) + needle.x;
                    let nryo = (needle.d[o].x - needle.width/2) * Math.sin(needle.angle) + (needle.d[o].y - needle.height/2) * Math.cos(needle.angle) + needle.y;
                    let nrxj = (needle.d[j].x - needle.width/2) * Math.cos(needle.angle) - (needle.d[j].y - needle.height/2) * Math.sin(needle.angle) + needle.x;
                    let nryj = (needle.d[j].x - needle.width/2) * Math.sin(needle.angle) + (needle.d[j].y - needle.height/2) * Math.cos(needle.angle) + needle.y;
                    if ((((nryo <= shots[i].y) && (shots[i].y < nryj)) || ((nryj <= shots[i].y) && (shots[i].y < nryo))) &&
                        (shots[i].x > (nrxj - nrxo) * (shots[i].y - nryo) / (nryj - nryo) + nrxo))
                        c = !c;
                    j = o;
                }
                if (c) {
                    shots[i].killer = true;
                    shots[i].victim = 1;
                    needle.alive = false;
                }
            }
        //удаление отживших (пролетевших и взорвавшихся) выстрелов
        } else if (shots[i].explosionPause >= shotMaximumExlposionPause) {
            shots.splice(i, 1);
            i--;
            l--;
        }
    }
    //проверка пересечения контуров кораблей (== столкновения)
    if (wedge.alive && needle.alive) {
        l = needle.d.length;
        let n = wedge.d.length;
        for (let i = 0; i < l; i++) {
            let nrx = (needle.d[i].x - needle.width/2) * Math.cos(needle.angle) - (needle.d[i].y - needle.height/2) * Math.sin(needle.angle) + needle.x;
            let nry = (needle.d[i].x - needle.width/2) * Math.sin(needle.angle) + (needle.d[i].y - needle.height/2) * Math.cos(needle.angle) + needle.y;
            for (let o = 0; o < n; o += 2) {
                let wrx1 = (wedge.d[o].x - wedge.originDeltaX) * Math.cos(wedge.angle) - (wedge.d[o].y - wedge.originDeltaY) * Math.sin(wedge.angle) + wedge.x;
                let wry1 = (wedge.d[o].x - wedge.originDeltaX) * Math.sin(wedge.angle) + (wedge.d[o].y - wedge.originDeltaY) * Math.cos(wedge.angle) + wedge.y;
                let wrx2 = (wedge.d[o+1].x - wedge.originDeltaX) * Math.cos(wedge.angle) - (wedge.d[o+1].y - wedge.originDeltaY) * Math.sin(wedge.angle) + wedge.x;
                let wry2 = (wedge.d[o+1].x - wedge.originDeltaX) * Math.sin(wedge.angle) + (wedge.d[o+1].y - wedge.originDeltaY) * Math.cos(wedge.angle) + wedge.y;
                if ((nrx - wrx1) * (nrx - wrx1) + (nry - wry1) * (nry - wry1) <= wedge.d[o].r * wedge.d[o].r &&
                    (nrx - wrx2) * (nrx - wrx2) + (nry - wry2) * (nry - wry2) <= wedge.d[o+1].r * wedge.d[o+1].r) {
                    wedge.alive = false;
                    needle.alive = false;
                    shots.push({x: nrx, y: nry,
                                killer: true, victim: 2,
                                exploded: false, explosionPause: 0, e: []});
                }
            }
        }
    }
    setTimeout(shotsControl, 10);
}

//Сброс игры в случае смерти хотя бы одного из кораблей
function automaticUpdate() {
    let e = true;
    //проверка отсутсвия анимируемых сейчас взрывов
    for (let s of shots)
        if (s.explosionPause > 0 && s.explosionPause < shotMaximumExlposionPause)
            e = false;
    //переопределение ключевых изменяющих значение переменных
    if ((!wedge.alive || !needle.alive) && e) {
        wedge.nitroState = 0;
        needle.nitroState = 0;
        shots.length = 0;
        shots.push({owner: 2, x: 400, y: 390,
                    lifeTime: 1,
                    killer: false, victim: -1,
                    exploded: false, explosionPause: 0, e: []});
        shots.push({owner: 2, x: 410, y: 400,
                    lifeTime: 1,
                    killer: false, victim: -1,
                    exploded: false, explosionPause: 0, e: []});
        shots.push({owner: 2, x: 400, y: 410,
                    lifeTime: 1,
                    killer: false, victim: -1,
                    exploded: false, explosionPause: 0, e: []});
        shots.push({owner: 2, x: 390, y: 400,
                    lifeTime: 1,
                    killer: false, victim: -1,
                    exploded: false, explosionPause: 0, e: []});
        wedge.x = 200;
        wedge.y = 210;
        wedge.angle = Math.PI/2;
        needle.x = 600;
        needle.y = 590;
        needle.angle = 3 * Math.PI/2;
        wedge.speedX = wedge.speedY = 0;
        needle.speedX = needle.speedY = 0;
        wedge.weight = needle.weight = m + 10;
        wedge.fuelLevel = needle.fuelLevel = 3000;
        wedge.shotsNumber = needle.shotsNumber = 33;
        wedge.lastShotPause = needle.lastShotPause = rechargeTime;
        wedge.alive = needle.alive = true;
    }
    setTimeout(automaticUpdate, 2000);
}

//Гравитационное влияние звезды на корабли
function gravityStep() {
    wedge.R = Math.sqrt((wedge.x - k) * (wedge.x - k) + (wedge.y - k) * (wedge.y - k)); //расстояние между Wedge и звездой
    if (wedge.R > 4) {
        wedge.Fx += -(wedge.x - k) / Math.sqrt(wedge.R) * M / (wedge.R * wedge.R); // Fx′ = −(x−x′)/√r × M/r²,
        wedge.Fy += -(wedge.y - k) / Math.sqrt(wedge.R) * M / (wedge.R * wedge.R); // Fy′ = −(y−y′)/√r × M/r²
        wedge.ax = wedge.Fx / wedge.weight; //ax = Fx/m
        wedge.ay = wedge.Fy / wedge.weight; //ay = Fy/m
        wedge.speedX += wedge.ax * deltaTime; //vx* = vx + ax·Δt
        wedge.speedY += wedge.ay * deltaTime; //vy* = vy + ay·Δt
        wedge.x += wedge.speedX * deltaTime + wedge.ax * deltaTime * deltaTime / 2; //x* = x + vx·Δt + ax·Δt²/2
        wedge.y += wedge.speedY * deltaTime + wedge.ay * deltaTime * deltaTime / 2; //y* = y = vy·Δt + ay·Δt²/2
        wedge.Fx =  wedge.Fy = 0;
    }
    needle.R = Math.sqrt((needle.x - k) * (needle.x - k) + (needle.y - k) * (needle.y - k)); //расстояние между Needle и звездой
    if (needle.R > 4) {
        needle.Fx += -(needle.x - k) / Math.sqrt(needle.R) * M / (needle.R * needle.R); // Fx′ = −(x−x′)/√r × M/r²,
        needle.Fy += -(needle.y - k) / Math.sqrt(needle.R) * M / (needle.R * needle.R); // Fy′ = −(y−y′)/√r × M/r²
        needle.ax = needle.Fx / needle.weight; //ax = Fx/m
        needle.ay = needle.Fy / needle.weight; //ay = Fy/m
        needle.speedX += needle.ax * deltaTime; //vx* = vx + ax·Δt
        needle.speedY += needle.ay * deltaTime; //vy* = vy + ay·Δt
        needle.x += needle.speedX * deltaTime + needle.ax * deltaTime * deltaTime / 2; //x* = x + vx·Δt + ax·Δt²/2
        needle.y += needle.speedY * deltaTime + needle.ay * deltaTime * deltaTime / 2; //y* = y = vy·Δt + ay·Δt²/2
        needle.Fx =  needle.Fy = 0;
    }
}

//Зацикливание движения кораблей и выстрелов при вылете за пределы игрового поля
function isLoop() {
    wedge.doubleSide.length = 0;
    //проверка координат контрольных точек Wedge
    for (let wlcp of wedge.loopControlPoints) {
        let wlcpx = (wlcp.x - wedge.originDeltaX) * Math.cos(wedge.angle) - (wlcp.y - wedge.originDeltaY) * Math.sin(wedge.angle) + wedge.x;
        let wlcpy = (wlcp.x - wedge.originDeltaX) * Math.sin(wedge.angle) + (wlcp.y - wedge.originDeltaY) * Math.cos(wedge.angle) + wedge.y;
        if (wlcpx > canvasSize) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(0) == -1) wedge.doubleSide.push(0);
        }
        if (wlcpx < 0) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(1) == -1) wedge.doubleSide.push(1);
        }
        if (wlcpy > canvasSize) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(2) == -1) wedge.doubleSide.push(2);
        }
        if (wlcpy < 0) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(3) == -1) wedge.doubleSide.push(3);
        }
    }
    //отдельая проверка координат кончика языка пламени из сопла как отдельной, не всегда активной, контрольной точки для Wedge
    if (wedge.nitroState > 0) {
        let i = Math.floor(wedge.nitroState/5);
        let wnrx = (wedge.nitro[i].x - wedge.originDeltaX) * Math.cos(wedge.angle) - (wedge.nitro[i].y - wedge.originDeltaY) * Math.sin(wedge.angle) + wedge.x;
        let wnry = (wedge.nitro[i].x - wedge.originDeltaX) * Math.sin(wedge.angle) + (wedge.nitro[i].y - wedge.originDeltaY) * Math.cos(wedge.angle) + wedge.y;
        if (wnrx > canvasSize) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(0) == -1) wedge.doubleSide.push(0);
        }
        if (wnrx < 0) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(1) == -1) wedge.doubleSide.push(1);
        }
        if (wnry > canvasSize) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(2) == -1) wedge.doubleSide.push(2);
        }
        if (wnry < 0) {
            wedge.double = true;
            if (wedge.doubleSide.indexOf(3) == -1) wedge.doubleSide.push(3);
        }
    }
    //сброс периода в координатах Wedge
    if (wedge.x > canvasSize) {
        wedge.x -= canvasSize;
        wedge.doubleSide[wedge.doubleSide.indexOf(0)] = 1;
    }
    if (wedge.x < 0) {
        wedge.x += canvasSize;
        wedge.doubleSide[wedge.doubleSide.indexOf(1)] = 0;
    }
    if (wedge.y > canvasSize) {
        wedge.y -= canvasSize;
        wedge.doubleSide[wedge.doubleSide.indexOf(2)] = 3;
    }
    if (wedge.y < 0) {
        wedge.y += canvasSize;
        wedge.doubleSide[wedge.doubleSide.indexOf(3)] = 2;
    }
    //проверка координат контрольных точек Needle
    let n = needle.d.length;
    needle.doubleSide.length = 0;
    for (let i = 0; i < n; i += 4) {
        let nrx = (needle.d[i].x - needle.width/2) * Math.cos(needle.angle) - (needle.d[i].y - needle.height/2) * Math.sin(needle.angle) + needle.x;
        let nry = (needle.d[i].x - needle.width/2) * Math.sin(needle.angle) + (needle.d[i].y - needle.height/2) * Math.cos(needle.angle) + needle.y;
        if (nrx > canvasSize) {
            needle.double = true;
            if (needle.doubleSide.indexOf(0) == -1) needle.doubleSide.push(0);
        }
        if (nrx < 0) {
            needle.double = true;
            if (needle.doubleSide.indexOf(1) == -1) needle.doubleSide.push(1);
        }
        if (nry > canvasSize) {
            needle.double = true;
            if (needle.doubleSide.indexOf(2) == -1) needle.doubleSide.push(2);
        }
        if (nry < 0) {
            needle.double = true;
            if (needle.doubleSide.indexOf(3) == -1) needle.doubleSide.push(3);
        }
    }
    //отдельая проверка координат кончика языка пламени из сопла как отдельной, не всегда активной, контрольной точки для Needle
    if (needle.nitroState > 0) {
        let i = Math.floor(needle.nitroState/5);
        let nnrx = (needle.nitro[i].x - needle.width/2) * Math.cos(needle.angle) - (needle.nitro[i].y - needle.height/2) * Math.sin(needle.angle) + needle.x;
        let nnry = (needle.nitro[i].x - needle.width/2) * Math.sin(needle.angle) + (needle.nitro[i].y - needle.height/2) * Math.cos(needle.angle) + needle.y;
        if (nnrx > canvasSize) {
            needle.double = true;
            if (needle.doubleSide.indexOf(0) == -1) needle.doubleSide.push(0);
        }
        if (nnrx < 0) {
            needle.double = true;
            if (needle.doubleSide.indexOf(1) == -1) needle.doubleSide.push(1);
        }
        if (nnry > canvasSize) {
            needle.double = true;
            if (needle.doubleSide.indexOf(2) == -1) needle.doubleSide.push(2);
        }
        if (nnry < 0) {
            needle.double = true;
            if (needle.doubleSide.indexOf(3) == -1) needle.doubleSide.push(3);
        }
    }
    //сброс периода в координатах Needle
    if (needle.x > canvasSize) {
        needle.x -= canvasSize;
        needle.doubleSide[needle.doubleSide.indexOf(0)] = 1;
    }
    if (needle.x < 0) {
        needle.x += canvasSize;
        needle.doubleSide[needle.doubleSide.indexOf(1)] = 0;
    }
    if (needle.y > canvasSize) {
        needle.y -= canvasSize;
        needle.doubleSide[needle.doubleSide.indexOf(2)] = 3;
    }
    if (needle.y < 0) {
        needle.y += canvasSize;
        needle.doubleSide[needle.doubleSide.indexOf(3)] = 2;
    }
    //зацикливание выстрелов
    for (let s of shots) {
        if (s.x >= canvasSize + shotWidth) s.x = 0;
        if (s.x <= -shotWidth) s.x = canvasSize;
        if (s.y >= canvasSize + shotWidth) s.y = 0;
        if (s.y <= -shotWidth) s.y = canvasSize;
    }
}

//Случайная генерация массивов звездного неба
function starsGeneration() {
    for (let i = 0; i < 15; i++)
        stars1.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
    for (let i = 0; i < 15; i++)
        stars2.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
    for (let i = 0; i < 50; i++)
        stars2.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
    for (let i = 0; i < 70; i++)
        stars3.push({x: Math.floor(Math.random() * 1000 ) + 1, y: Math.floor(Math.random() * 1000) + 1});
}

//Рисование объектов на холсте
function draw() {
    expensivePlanetarium();
    drawShots();
    //основная прорисовка Wedge
    if (wedge.alive) {
        ctx.save();
        ctx.translate(wedge.x, wedge.y);
        ctx.rotate(wedge.angle);
        ctx.translate(-wedge.originDeltaX, -wedge.originDeltaY);
        if (wedge.nitroState > 0 && wedge.nitroState <= 24) wedge.nitroState++;
        if (wedge.nitroState == 25) wedge.nitroState = 16;  //мерцание нитро
        drawWedge();
        ctx.restore();
        //дублирующия прорисовка в случае частичного выхода за границы поля для Wedge
        if (wedge.double) {
            for (let ds of wedge.doubleSide) {
                ctx.save();
                if (ds == 0) ctx.translate(wedge.x - canvasSize, wedge.y);
                if (ds == 1) ctx.translate(wedge.x + canvasSize, wedge.y);
                if (ds == 2) ctx.translate(wedge.x, wedge.y - canvasSize);
                if (ds == 3) ctx.translate(wedge.x, wedge.y + canvasSize);
                ctx.rotate(wedge.angle);
                ctx.translate(-wedge.originDeltaX, -wedge.originDeltaY);
                drawWedge();
                ctx.restore();
            }
            wedge.double = false;
        }
    }
    //основная прорисовка Needle
    if (needle.alive) {
        ctx.save();
        ctx.translate(needle.x, needle.y);
        ctx.rotate(needle.angle);
        ctx.translate(-needle.width/2, -needle.height/2);
        if (needle.nitroState > 0 && needle.nitroState <= 24) needle.nitroState++;
        if (needle.nitroState == 25) needle.nitroState = 16; //мерцание нитро
        drawNeedle();
        ctx.restore();
        //дублирующия прорисовка в случае частичного выхода за границы поля для Needle
        if (needle.double) {
            for (let ds of needle.doubleSide) {
                ctx.save();
                if (ds == 0) ctx.translate(needle.x - canvasSize, needle.y);
                if (ds == 1) ctx.translate(needle.x + canvasSize, needle.y);
                if (ds == 2) ctx.translate(needle.x, needle.y - canvasSize);
                if (ds == 3) ctx.translate(needle.x, needle.y + canvasSize);
                ctx.rotate(needle.angle);
                ctx.translate(-needle.width/2, -needle.height/2);
                drawNeedle();
                ctx.restore();
            }
            needle.double = false;
        }
    }
    //прорисовка звезды
    ctx.save();
    ctx.translate(canvasSize/2, canvasSize/2);
    ctx.rotate(Math.PI/4);
    ctx.translate(-canvasSize/2 + 1 , -canvasSize/2 - 1);
    if (centerState < 20 || centerState == 40) {
        drawSun(6,2);
        ctx.restore();
        drawSun(10,2);//звезда наслаивается на другую звезду, чтобы создать восьмиконечную звездву
        if (centerState < 20) centerState++;
        else centerState = 1;
    } else { //отрисовка повернутой звезды, чтобы создать эффект вращения/мерцания
        drawSun(10,2);
        ctx.restore();
        drawSun(6,2);
        centerState++;
    }
    gravityStep();
    isLoop();
    requestAnimationFrame(draw);
}

//Мигание звездного неба, сначала загораются звезды 1 и 3 величины, потом 2 и 4. Рисование неба
function expensivePlanetarium() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 800);
    ctx.strokeStyle = "rgb(" + color1 + "," + color1 + "," + color1 + ")";
    ctx.fillStyle = ctx.strokeStyle ;
    stars1.forEach(function(elem) {
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, 1, 0, 2*Math.PI, false);
        elem.x -= stepX;
        elem.y -= stepY;
        if (elem.x <= 0) elem.x = 1000;
        if (elem.y <= 0) elem.y = 1000;
        ctx.fill();
        ctx.stroke();
    });
    ctx.strokeStyle = "rgb(" + color2 + "," + color2 + "," + color2 + ")";
    ctx.fillStyle = ctx.strokeStyle;
    stars2.forEach(function(elem) {
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, 0.6, 0, 2*Math.PI, false);
        elem.x -= stepX;
        elem.y -= stepY;
        if (elem.x <= 0) elem.x = 1000;
        if (elem.y <= 0) elem.y = 1000;
        ctx.fill();
        ctx.stroke();
    });
    ctx.strokeStyle = "rgb(" + color1 + "," + color1 + "," + color1 + ")";
    ctx.fillStyle = ctx.strokeStyle;
    stars3.forEach(function(elem) {
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, 0.3, 0, 2*Math.PI, false);
        elem.x -= stepX;
        elem.y -= stepY;
        if (elem.x <= 0) elem.x = 1000;
        if (elem.y <= 0) elem.y = 1000;
        ctx.fill();
        ctx.stroke();
    });
    ctx.strokeStyle = "rgb(" + color2 + "," + color2 + "," + color2 + ")";
    ctx.fillStyle = ctx.strokeStyle;
    stars4.forEach(function(elem) {
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, 0.2, 0, 2*Math.PI, false);
        elem.x -= stepX;
        elem.y -= stepY;
        if (elem.x <= 0) elem.x = 1000;
        if (elem.y <= 0) elem.y = 1000;
        ctx.fill();
        ctx.stroke();
    });
    color1 += colorStep1;
    color2 += colorStep2;
    if (color1 < 50 || color1 > 230) colorStep1 *= -1;
    if (color2 < 50 || color2 > 230) colorStep2 *= -1;
}

//Прорисовка выстрелов и взрывов (но не мин)
function drawShots() {
    ctx.fillStyle = "white";
    for (let s of shots) {
        //трёхэтапная прорисовка выстрелов-убийц (попавших в цель)
        //первый этап -- белый цвет, густой взрыв
        //второй -- серебристый цвет, густота меньше
        //третий -- серый цвет, минимальная густота
        if (s.killer) {
            //расчёт первого этапа
            if (!s.exploded) {
                //расчёт густоты взрыва в зависимости от количества оставшегося топлива
                let n = 100;
                if (s.victim == 0) n = 50 + (50 * wedge.fuelLevel / 3000);
                else if (s.victim == 1) n = 50 + (50 * needle.fuelLevel / 3000);
                else if (s.victim == 2) n = 50 + (50 * wedge.fuelLevel / 3000) + (50 * needle.fuelLevel / 3000);
                //подбор координат осколков в круговой области вокруг точки попадания
                for (let i = 0; i < n; i++) {
                    let x = 0, y = 0;
                    while ((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) > 1250) {
                        x = Math.floor(Math.floor(Math.random() * ((s.x + 50 * Math.sqrt(2) / 2) - (s.x - 50 * Math.sqrt(2) / 2))) + (s.x - 50 * Math.sqrt(2) / 2));
                        y = Math.floor(Math.floor(Math.random() * ((s.y + 50 * Math.sqrt(2) / 2) - (s.y - 50 * Math.sqrt(2) / 2))) + (s.y - 50 * Math.sqrt(2) / 2));
                    }
                    //зацикливание игрового поля для взрыва
                    if (x >= canvasSize) x -= canvasSize;
                    if (x <= 0) x += canvasSize;
                    if (y >= canvasSize) y -= canvasSize;
                    if (y <= 0) y += canvasSize;
                    s.e.push({x: x, y: y});
                }
                s.exploded = true;
            }
            //расчёт второго этапа
            if (s.explosionPause >= 10 && s.explosionPause < 20) {
                if (s.explosionPause == 10) {
                    s.e.length = 0;
                    //расчёт густоты взрыва в зависимости от количества оставшегося топлива
                    let n = 75;
                    if (s.victim == 0) n = 38 + (37 * wedge.fuelLevel / 3000);
                    else if (s.victim == 1) n = 38 + (37 * needle.fuelLevel / 3000);
                    else if (s.victim == 2) n = 38 + (37 * wedge.fuelLevel / 3000) + (37 * needle.fuelLevel / 3000);
                    //подбор координат осколков в круговой области вокруг точки попадания
                    for (let i = 0; i < n; i++) {
                        let x = 0, y = 0;
                        while ((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) > 1250) {
                            x = Math.floor(Math.floor(Math.random() * ((s.x + 50 * Math.sqrt(2) / 2) - (s.x - 50 * Math.sqrt(2) / 2))) + (s.x - 50 * Math.sqrt(2) / 2));
                            y = Math.floor(Math.floor(Math.random() * ((s.y + 50 * Math.sqrt(2) / 2) - (s.y - 50 * Math.sqrt(2) / 2))) + (s.y - 50 * Math.sqrt(2) / 2));
                        }
                        //зацикливание игрового поля для взрыва
                        if (x >= canvasSize) x -= canvasSize;
                        if (x <= 0) x += canvasSize;
                        if (y >= canvasSize) y -= canvasSize;
                        if (y <= 0) y += canvasSize;
                        s.e.push({x: x, y: y});
                    }
                }
                ctx.fillStyle = "silver";
            }
            //рассчёт третьего этапа
            if (s.explosionPause >= 20) {
                if (s.explosionPause == 20) {
                    s.e.length = 0;
                    //расчёт густоты взрыва в зависимости от количества оставшегося топлива
                    let n = 50;
                    if (s.victim == 0) n = 25 + (25 * wedge.fuelLevel / 3000);
                    else if (s.victim == 1) n = 25 + (25 * needle.fuelLevel / 3000);
                    else if (s.victim == 2) n = 25 + (25 * wedge.fuelLevel / 3000) + (25 * needle.fuelLevel / 3000);
                    //подбор координат осколков в круговой области вокруг точки попадания
                    for (let i = 0; i < n; i++) {
                        let x = 0, y = 0;
                        while ((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) > 1250) {
                            x = Math.floor(Math.floor(Math.random() * ((s.x + 50 * Math.sqrt(2) / 2) - (s.x - 50 * Math.sqrt(2) / 2))) + (s.x - 50 * Math.sqrt(2) / 2));
                            y = Math.floor(Math.floor(Math.random() * ((s.y + 50 * Math.sqrt(2) / 2) - (s.y - 50 * Math.sqrt(2) / 2))) + (s.y - 50 * Math.sqrt(2) / 2));
                        }
                        //зацикливание игрового поля для взрыва
                        if (x >= canvasSize) x -= canvasSize;
                        if (x <= 0) x += canvasSize;
                        if (y >= canvasSize) y -= canvasSize;
                        if (y <= 0) y += canvasSize;
                        s.e.push({x: x, y: y});
                    }
                }
                ctx.fillStyle = "grey";
            }
            //прорисовка осколков
            let n = s.e.length;
            for (let i = 0; i < n; i++) ctx.fillRect(s.e[i].x, s.e[i].y, 2, 2);
            ctx.fillStyle = "white";
            s.explosionPause++;
        //прорисовка обычных выстрелов в полёте
        } else if (s.lifeTime < shotMaximumLifeTime && s.owner != 2) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle);
            ctx.fillRect(0, 0, shotWidth, shotHeight);
            ctx.restore();
        //прорисовка мини-взрыва при самодетонации никуда не попавших торпед
        } else if (s.owner != 2) {
            if (!s.exploded) {
                //выбор координат осколков
                for (let i = 0; i < 3; i++) {
                    s.e.push({x: Math.floor(Math.floor(Math.random() * ((s.x + 10) - (s.x - 10))) + (s.x - 10)),
                              y: Math.floor(Math.floor(Math.random() * ((s.y + 10) - (s.y - 10))) + (s.y - 10))});
                    //зацикливание поля
                    if (s.x >= canvasSize) s.x -= canvasSize;
                    if (s.x <= 0) s.x += canvasSize;
                    if (s.y >= canvasSize) s.y -= canvasSize;
                    if (s.y <= 0) s.y += canvasSize;
                }
                s.exploded = true;
            }
            //прорисовка осколков
            for (let i = 0; i < 3; i++) ctx.fillRect(s.e[i].x, s.e[i].y, 2, 2);
            s.explosionPause += 3;
        }
    }
}

//Отрисовка Wedge
function drawWedge() {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.moveTo(0, 0);
    //отрисовка 6 дуг (и одной автоматически добавляющейся линии), из которых состоит Wedge
    let n = wedge.d.length;
    for (let i = 0; i < n; i += 2) {
        ctx.beginPath();
        ctx.arc(wedge.d[i].x, wedge.d[i].y, wedge.d[i].r, wedge.d[i].a1, wedge.d[i].a2, false);
        ctx.arc(wedge.d[i+1].x, wedge.d[i+1].y, wedge.d[i+1].r, wedge.d[i+1].a1, wedge.d[i+1].a2, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    //отрисовка огня из сопла при запущеном двигателе с учётом времени его работы с момента запуска
    if (wedge.nitroState > 0) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(wedge.nitro[Math.floor(wedge.nitroState/5)].x, wedge.nitro[Math.floor(wedge.nitroState/5)].y);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

//Отрисовка Needle
function drawNeedle() {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    //отрисовка контура Needle
    let n = needle.d.length;
    for (let i = 1; i < n - 2; i++) ctx.lineTo(needle.d[i].x, needle.d[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    //добавление внутренних линий
    ctx.beginPath();
    ctx.moveTo(needle.d[n-2].x, needle.d[n-2].y);
    ctx.lineTo(needle.d[2].x, needle.d[2].y);
    ctx.moveTo(needle.d[n-1].x, needle.d[n-1].y);
    ctx.lineTo(needle.d[6].x, needle.d[6].y);
    ctx.moveTo(needle.d[n-2].x, needle.d[n-2].y);
    ctx.closePath();
    ctx.stroke();
    //отрисовка огня из сопла при запущеном двигателе с учётом времени его работы с момента запуска
    if (needle.nitroState > 0) {
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.lineTo(needle.nitro[Math.floor(needle.nitroState/5)].x, needle.nitro[Math.floor(needle.nitroState/5)].y);
        ctx.lineTo(0, 16);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

//Отрисовка четырехконечной звезды
function drawSun(l, r) {
    ctx.fillStyle = "white";
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

//Старт игры
shipsInit();
starsGeneration();
draw();
keysControl();
shotsControl();
automaticUpdate();
