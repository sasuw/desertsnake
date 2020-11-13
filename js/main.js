const BASE_POINT_SIZE = 10;
const POINT_SIZE = 20;

const AREA_WIDTH = 32;
const AREA_HEIGHT = 32;

const AREA_WIDTH_PX = AREA_WIDTH * POINT_SIZE;
const AREA_HEIGHT_PX = AREA_HEIGHT * POINT_SIZE;

const POINT_AMOUNT = AREA_WIDTH * AREA_HEIGHT;

const GameStates = {
    STARTED: 0, 
    STOPPED: 1,
    PAUSED: 2
};
var gameState = GameStates.STOPPED;

const LOOP_DELAY = 10;
const MOVEMENT_EVERY_N_LOOPS = 15;
const SOUND_LENGTH_MS = MOVEMENT_EVERY_N_LOOPS * LOOP_DELAY / 1000 * 4;

//snake coordinates, where x[0], y[0] is the snake's head position
var x = new Array(POINT_AMOUNT); 
var y = new Array(POINT_AMOUNT);

//canvas and canvas context
var canvas, ctx;

var shxEl, shyEl, fx, fy;
function init(){
    initCanvas();

    loadImages();
    initSnake();
    replaceFood();

    initEventHandlers();

    shxEl = document.getElementById('shx');
    shyEl = document.getElementById('shy');
    fx = document.getElementById('fx');
    fy = document.getElementById('fy');
}

function initCanvas(){
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = AREA_WIDTH_PX;
    canvas.height = AREA_HEIGHT_PX;

    paintGrid();
}

function paintGrid(){
    ctx.beginPath();

    let i;
    for(i = 1; i < 9; i++){
        let lineX = AREA_WIDTH_PX / 8 * i;
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, AREA_HEIGHT_PX);
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
    }

    for(i = 1; i < 9; i++){
        let lineY = AREA_HEIGHT_PX / 8 * i;
        ctx.moveTo(0, lineY);
        ctx.lineTo(AREA_WIDTH_PX, lineY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
    }
}

function initEventHandlers(){
    var playBtn = document.getElementById("playBtn");
    playBtn.addEventListener("click", async function() {
        startGame();
    });
}

var toneInitialized = false;
async function startGame(){
    if(!toneInitialized){
        await Tone.start();
        toneInitialized = true;
    }
    gameState = GameStates.STARTED;
    mainGameLoop();
}

function pauseGame(){
    gameState = GameStates.PAUSED;
    synthX.triggerRelease();
    synthY.triggerRelease();
}

//const synth = new Tone.Synth().toMaster();
//const synth = new Tone.PolySynth(Tone.Synth).toDestination();
const synthX = new Tone.AMSynth().toDestination();
const synthY = new Tone.AMSynth().toDestination();
const synthSpecial = new Tone.MetalSynth().toDestination();
const synthSpecialPoly = new Tone.PolySynth(Tone.Synth).toDestination();

var ToneType = {
    x: 'x',
    y: 'y'
}
function playTones(){
    var mc = getMusicCoordinates();
    console.log('mc: ' + mc.toString());

    playTone(mc.x, 5, ToneType.x, 4);
    playTone(9 - mc.y, 3, ToneType.y, 1);

    if(food_x === x[0] && food_y !== y[0] && y[0] % 40 === 0){
        let foodDistance = Math.abs(x[0] - food_x);
        console.log('x: ' + x[0] + ', foodDistance: ' + foodDistance);
        synthSpecial.volume.value = -foodDistance / (AREA_WIDTH_PX / 16); //-16 dB is the lowest usable volume
        console.log('synthSpecial.volume.value: ' + synthSpecial.volume.value);
        synthSpecial.triggerAttackRelease('C3', SOUND_LENGTH_MS * 2);
    }
    if(food_y === y[0] && food_x !== x[0] && x[0] % 40 === 0){
        let foodDistance = Math.abs(x[0] - food_x);
        console.log('y: ' + y[0] + ', foodDistance: ' + foodDistance);  
        synthSpecial.volume.value = -foodDistance / (AREA_WIDTH_PX / 16); //-16 dB is the lowest usable volume
        console.log('synthSpecial.volume.value: ' + synthSpecial.volume.value);
        synthSpecial.triggerAttackRelease('C5', SOUND_LENGTH_MS * 2);
    }

    if(food_y === y[0] && food_x === x[0]){
        synthSpecial.volume.value = 0;
        synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'B5'], SOUND_LENGTH_MS);
    }
}

var previousNote = {};
function playTone(noteNumber, startOctave, toneType, length){
    console.log('playTone started with noteNumber ' +  noteNumber + ', startOctave ' + startOctave + ', toneType ' + toneType + ', length ' + length);
    var note = ToneMapper.map(noteNumber, startOctave);
    if(previousNote[toneType] == note){
        return;
    }
    previousNote[toneType] = note;
    console.log('note.' + toneType + ': ' + note);

    let synth = synthX;
    if(toneType = ToneType.y){
        synth = synthY;
    }
    //synth.triggerAttackRelease(note, length + 'n');
    synth.triggerAttackRelease(note, SOUND_LENGTH_MS);
}

var snakeAlive = true;
var loopCounter = 0;
function mainGameLoop(){
    if(snakeAlive && gameState === GameStates.STARTED){
        checkFoodFound();
        checkCollision();

        if(++loopCounter % MOVEMENT_EVERY_N_LOOPS === 0){
            console.log(loopCounter++);
            //decoupling movement from key detection guarantees better responsivness
            moveSnake();
            printLoopDebugInfo();
            playTones();
        }
        drawCanvas();

        setTimeout(mainGameLoop, LOOP_DELAY);
    }else if(snakeAlive && gameState === GameStates.PAUSED){
        setTimeout(mainGameLoop, 200);
    }
}

function Coordinates(x, y){
    this.x = x;
    this.y = y;
}

Coordinates.prototype.toString = function(){
    return 'x: ' + this.x + ', y: ' + this.y;
}
function getMusicCoordinates(){
    var mcx = Math.floor(x[0] / AREA_WIDTH_PX * 8) + 1;
    var mcy = Math.floor(y[0] / AREA_HEIGHT_PX * 8 + 1);
    return new Coordinates(mcx, mcy);
}

function printLoopDebugInfo(){
    shxEl.innerHTML = x[0];
    shyEl.innerHTML = y[0];
    fx.innerHTML = food_x;
    fy.innerHTML = food_y;
}

//graphical elements
var snakehead, snakebody, snakefood;

function loadImages(){
    snakehead = new Image();
    snakehead.src = 'img/snakehead.png';    
    
    snakebody = new Image();
    snakebody.src = 'img/snakebody.png'; 
    
    snakefood = new Image();
    snakefood.src = 'img/snakefood.png';
}

var snakeLength = 3;
function initSnake(){
    x[0] = AREA_WIDTH_PX / 2;
    y[0] = AREA_HEIGHT_PX / 2;
}

var food_x;
var food_y;
function checkFoodFound(){
    if(food_x === x[0] && food_y === y[0]){
        snakeLength++;
        replaceFood();
    }
}

function replaceFood(){
    food_x = Math.floor(Math.random() * AREA_WIDTH) * POINT_SIZE;
    food_y = Math.floor(Math.random() * AREA_HEIGHT) * POINT_SIZE;
}

const Direction = {
    LEFT: 1,
    UP: 2,
    RIGHT: 3,
    DOWN: 4
}

var currentDirection = Direction.DOWN;
function moveSnake(){
    x.unshift(x[0]);
    y.unshift(y[0]);

    switch(currentDirection){
        case Direction.DOWN:
            y[0] = y[0] + POINT_SIZE;
            break;
        case Direction.UP:
            y[0] = y[0] - POINT_SIZE;
            break;
        case Direction.LEFT:
            x[0] = x[0] - POINT_SIZE;
            break;
        case Direction.RIGHT:
            x[0] = x[0] + POINT_SIZE;
            break;
    }
}

function checkCollision(){
    for(var i = 1; i < snakeLength; i++){
        if(x[i] == x[0] && y[i] == y[0]){
            snakeAlive = false;
            return;
        }
    }

    snakeAlive = x[0] >= 0 && x[0] < AREA_WIDTH_PX && y[0] >= 0 && y[0] < AREA_HEIGHT_PX; 
}

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_ENTER = 13;

onkeydown = function(e) {
    var key = e.keyCode; //for performance reasons the deprecated keyCode is used
    console.log(key);
    
    if (key === KEY_LEFT) {
        currentDirection = currentDirection - 1;
        if(currentDirection === 0){
            currentDirection = 4;
        }
    }

    if (key === KEY_RIGHT) {
        currentDirection = currentDirection + 1;
        if(currentDirection === 5){
            currentDirection = 1;
        }
    }

    if (key === KEY_ENTER) {
        if(gameState === GameStates.STARTED){
            pauseGame();
        }else if(gameState === GameStates.STOPPED){
            startGame();
        }else if(gameState === GameStates.PAUSED){
            gameState = GameStates.STARTED;
        }
    }    
};

function drawCanvas(){
    ctx.clearRect(0, 0, AREA_WIDTH_PX, AREA_HEIGHT_PX);
    paintGrid();

    var scaledImageSize = POINT_SIZE;

    if (snakeAlive) {
        ctx.drawImage(snakefood, food_x, food_y, scaledImageSize, scaledImageSize);

        for (var i = 0; i < snakeLength; i++) {
            if (i == 0) {
                ctx.drawImage(snakehead, x[i], y[i], scaledImageSize, scaledImageSize);
            } else {
                ctx.drawImage(snakebody, x[i], y[i], scaledImageSize, scaledImageSize);
            }
        }    
    } else {
        gameOver();
    }    
}

function gameOver() {
    ctx.fillStyle = 'yellow';
    ctx.textBaseline = 'middle'; 
    ctx.textAlign = 'center'; 
    ctx.font = 'normal bold 2em Verdana';
    
    ctx.fillText('Game over', AREA_WIDTH_PX/2, AREA_HEIGHT_PX/2);

    gameState = GameStates.STOPPED;
    synthX.triggerRelease();
    synthY.triggerRelease();
    synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'C6'], SOUND_LENGTH_MS);
}