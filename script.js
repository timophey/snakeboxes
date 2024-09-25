let elPG;
let w = 20, h = 25;
let hero = [

];
let heroDefaultLength = 3;
let apple = [4,4];
let field = []; // field[y][x]
let dir = 3;
let keyBind = [
    37,38,39,40,
    65,87,68,83,
];
let swiped = false;
let timerId = 0;
let delay = 500;
let delayDefault = 500;
let delayIncrease = 0.99;

let tx = null, ty = null, td = 32;
function boot(){
    let elInp;
    elPG = document.querySelector('.plaground');
    field[0] = [document.querySelector('input')];

    ajustGeometry();
    rebuildPlayground();
    // // run
    respawnHero();
    respawnApple();
    render();
    // window.focus();
}
function rebuildPlayground(){
    [...elPG.children].forEach(el => el.remove()); field = [];
    for(let i =0; i < h; i++){
        let elRow = document.createElement('div');
        let arInp = []; field.push(arInp);
        elRow.className = 'plaground_row';
        elPG.append(elRow);
        for(let j = 0; j < w; j++){
            let elInp = document.createElement('input');
            elInp.type = 'checkbox';
            elInp.addEventListener('click', e => e.preventDefault());
            elRow.append(elInp);
            arInp.push(elInp);
        }
    }  
}

function render(){
    field.forEach(arRow => arRow.forEach(elInp => {
        elInp.type = 'checkbox';
        elInp.checked = false;
        elInp.indeterminate = false;
        elInp.className = '';
    }));
    // hero
      for(let i in hero){
          let [x,y] = hero[i];
          let elInp = field[y][x];
          if(i > 0) elInp.checked = true;
          if(i == 0){
            elInp.indeterminate = true;
            if(timerId == 0) elInp.classList.add('blink_me');
          }
      }
    // apple
    let [ax, ay] = apple;
    let elInpApple = field[ay][ax];
    // console.log('elInpApple',elInpApple,ax,ay);
    elInpApple.type = 'radio';
    elInpApple.checked = true;
}

function move(){
    let [x,y] = hero.at(0);
    let [ax, ay] = apple;
    switch(dir){
        case 0: x--; break;
        case 1: y--; break;
        case 2: x++; break;
        case 3: y++; break;
    }
    if(x >= w) x=0; if(x <0) x=w-1;
    if(y >= h) y=0; if(y <0) y=h-1;
    hero.unshift([x,y]);
    
    let feed = (x == ax && y == ay);
    if(feed){
        delay *= delayIncrease;
        respawnApple();
    }else{
        hero.pop();
    }

    if(shouldDie()){
        stopTimer();
        alert('die');
        respawnHero();
        respawnApple();
    }

    render();
}

function keyHandler(e){
    let {keyCode} = e;
    keyToMove(keyCode);
    if(keyCode == 32){
        // space
        return (timerId) ? stopTimer() : startTimer();
    }
    if(keyCode == 27){
      if(confirm('Restart?')){
        stopTimer();
        respawnHero();
        respawnApple();
      }
    }
    // console.log(keyCode)
}

function keyToMove(keyCode){
    if(!keyBind.includes(keyCode)) return;
    let newDir = keyBind.indexOf(keyCode) % 4;
    if(newDir != dir && (newDir % 2) == (dir % 2)) return;
    dir = newDir;
    // console.log(e.keyCode, newDir);
    stopTimer();
    move();
    startTimer();
}

function findFreePixel(){
    let x, y, n = 0, isBody = true;
    while(isBody){
        n++;
        x = getRandomInt(0, w-1);
        y = getRandomInt(0, h-1);
        let intersect = false;
        hero.forEach(([hx, hy]) => (hx == x && hy == y) && (intersect = true));
        if(intersect == false) isBody = false;
    }
  return [x, y];
}
function respawnApple(){
    apple = findFreePixel();
}
function respawnHero(){
    let l = Math.min(heroDefaultLength, Math.floor(h / 2));
    let x = Math.floor(w / 2);
    let y = Math.floor((h - l) / 2);
    hero = []; dir = 3;
    for(let i = 0; i < l; i++){
        hero.unshift([x, y + i]);
    }
    delay = delayDefault;
    render();
}

function shouldDie(){
    let hx, hy;
    for(let i in hero){
        if(i == 0){
            [hx, hy] = hero[i];
        }else{
            let [x, y] = hero[i];
            if(hx == x && hy == y) return true;
        }
    }
    return false;
}

function startTimer(){
    timerId = setInterval(move, delay);
}

function stopTimer(){
    clearInterval(timerId); timerId = 0;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function ajustGeometry(){
  let px = field[0][0];
  // let curW = px.parentElement.children.length;
  // let curH = px.parentElement.parentElement.children.length;
  let pgStype = getComputedStyle(elPG);
  let pgPad = parseInt(pgStype.padding);
  // let pgRect = elPG.getBoundingClientRect();
  let pxRect = px.getBoundingClientRect();
  let {innerHeight, innerWidth} = window;
  let newWH = {
    W: (w = Math.floor((innerWidth - pgPad*2) / pxRect.width)),
    H: (h = Math.floor((innerHeight - pgPad*2) / pxRect.width)),
  };
  
  // console.log('ajustGeometry',{pgPad, pgRect, pxRect, newWH, curW, curH});
}

document.addEventListener('DOMContentLoaded',boot);
document.addEventListener('keydown',keyHandler);

document.addEventListener('touchstart',(e) => {
    let touch = e.touches[0];
    let {clientX, clientY} = touch;
    [tx, ty, swiped] = [clientX, clientY, false];
    // console.log('touchstart', touch);
});
document.addEventListener('touchmove',(e) => {
    if(!tx || !ty) return;
    let touch = e.touches[0]
    let {clientX, clientY} = touch;
    let dx = clientX - tx, mdx = Math.abs(dx);
    let dy = clientY - ty, mdy = Math.abs(dy);

    // console.log('m', Math.abs(dx), Math.abs(dy), (dx > dy))
    if( (mdx > mdy) ? (mdx > td) : (mdy > td) ){
        let dd = (mdx > mdy) ? (dx < 0 ? 0 : 2) : (dy < 0 ? 1 : 3);
        if(dd != dir && (dd % 2) == (dir % 2)) return;
        [tx, ty, dir, swiped] = [clientX, clientY, dd, true];
        stopTimer();
        move();
        // if(!timerId) startTimer();

        // console.log('move!!!!!', dd)
    }
    // if(dx > dy){
    //     if(Math.abs(dx) > td)
    // }else{
    //     if(Math.abs(dy) > td)
    // }
    // console.log('touchmove', touch, dx, dy);
});
document.addEventListener('touchend',(e) => {
    if(!!swiped && !timerId) startTimer();
    if(!swiped) (timerId) ? stopTimer() : startTimer();
    [tx, ty] = [null, null];
});

window.addEventListener('resize',(e)=>{
      let tempSize = [w,h];
      ajustGeometry();
      if(w != tempSize[0] || h != tempSize[1] ){
        rebuildPlayground();
        respawnApple();
        render();       
      }
});