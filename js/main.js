const AREA_WIDTH = 50;
const AREA_HEIGHT = 50;

const POINT_SIZE = 10;

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

//snake coordinates, where x[0], y[0] is the snake's head position
var x = new Array(POINT_AMOUNT); 
var y = new Array(POINT_AMOUNT);

//canvas and canvas context
var canvas, ctx;

var shxEl, shyEl, fx, fy;
function init(){
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = AREA_WIDTH_PX;
    canvas.height = AREA_HEIGHT_PX;

    loadImages();
    initSnake();
    replaceFood();

    initEventHandlers();

    shxEl = document.getElementById('shx');
    shyEl = document.getElementById('shy');
    fx = document.getElementById('fx');
    fy = document.getElementById('fy');
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
}

//const synth = new Tone.Synth().toMaster();
const synth = new Tone.PolySynth(Tone.Synth).toDestination();
var previousNoteX = null;
function playTones(){
    var mc = getMusicCoordinates();
    console.log('mc: ' + mc.toString());

    playTone(mc.x, 4);
    playTone(mc.y, 2);
}

function playTone(noteNumber, startOctave){
    var noteX = ToneMapper.map(noteNumber, startOctave);
    if(previousNoteX == noteX){
        return;
    }
    previousNoteX = noteX;
    console.log('noteX: ' + noteX);
    synth.triggerAttackRelease(noteX, '8n');
}

var snakeAlive = true;
var loopCounter = 0;
function mainGameLoop(){
    if(snakeAlive && gameState === GameStates.STARTED){
        checkFoodFound();
        checkCollision();
        
        if(++loopCounter % 20 === 0){
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

    snakeAlive = x[0] > 0 && x[0] < AREA_WIDTH_PX && y[0] > 0 && y[0] < AREA_HEIGHT_PX; 
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
    
    if (snakeAlive) {
        ctx.drawImage(snakefood, food_x, food_y);

        for (var i = 0; i < snakeLength; i++) {
            if (i == 0) {
                ctx.drawImage(snakehead, x[i], y[i]);
            } else {
                ctx.drawImage(snakebody, x[i], y[i]);
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
}