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

var movementEveryNLoops = 30;

const LOOP_DELAY = 5;
const SOUND_LENGTH_MS = movementEveryNLoops * LOOP_DELAY / 1000 * 4;

//snake coordinates, where x[0], y[0] is the snake's head position
var x = [];
var y = [];

//canvas and canvas context
var canvas, ctx;

var score = 0; //increases with caught food, advanced rounds and passed time, with a multiplier for snake length
var round = 1;
var foodToCatchIncrement = 5;
var foodToCatch = foodToCatchIncrement;

var shxEl, shyEl, fx, fy;
function init(){
    initCanvas();

    loadImages();
    if(round < 2){
        initSnake();
    }
    replaceFood();

    initEventHandlers();
    initInfoTable();
    initDebugTable();
}

function initDebugTable(){
    shxEl = document.getElementById('shx'); //snake head x
    shyEl = document.getElementById('shy'); //snake head y
    fx = document.getElementById('fx'); //food x
    fy = document.getElementById('fy'); //food y
}

function initNewRound(){
    round++;
    foodToCatchIncrement++;
    foodToCatch = foodToCatchIncrement;
    movementEveryNLoops--;
    synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'E6'], SOUND_LENGTH_MS);
    //setTimeout(init, 5000);
    init();
}

function initInfoTable(){
    updateScore();
    updateRounds();
    updateFoodToCatch();
}

function initCanvas(){
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = AREA_WIDTH_PX;
    canvas.height = AREA_HEIGHT_PX;

    paintGrid();
}

function paintGrid(){
    let bg = new Image();
    bg.src = 'img/hintergrund.svg';    

    var ptrn = ctx.createPattern(bg, 'repeat'); // Create a pattern with this image, and set it to "repeat".
    ctx.fillStyle = ptrn;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);

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
    score = 0;
    round = 1;
    foodToCatchIncrement = 1;
    foodToCatch = foodToCatchIncrement;

    if(!toneInitialized){
        await Tone.start();
        toneInitialized = true;
    }
    round = 1;
    snakeAlive = true;
    gameState = GameStates.STARTED;
    init();
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
        playApproximationTone(y[0], food_y);
    }
    if(food_y === y[0] && food_x !== x[0] && x[0] % 40 === 0){
        playApproximationTone(x[0], food_x);
    }

    if(food_y === y[0] && food_x === x[0]){
        //food found
        synthSpecial.volume.value = 0;
        synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'B5'], SOUND_LENGTH_MS);
    }
}

function playApproximationTone(axisSnakeCoordinate, axisFoodCoordinate, ){
    let foodDistance = Math.abs(axisSnakeCoordinate - axisFoodCoordinate);
    console.log('x: ' + x[0] + ', foodDistance: ' + foodDistance);
    synthSpecial.volume.value = -foodDistance / (AREA_WIDTH_PX / 32);
    console.log('synthSpecial.volume.value: ' + synthSpecial.volume.value);
    synthSpecial.triggerAttackRelease('C3', SOUND_LENGTH_MS * 2);
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

        if(++loopCounter % movementEveryNLoops === 0){
            console.log(loopCounter++);
            //decoupling movement from key detection guarantees better responsivness
            moveSnake();
            printLoopDebugInfo();
            playTones();
        }
        drawCanvas();
        score = Math.floor((score + loopCounter) / 100);
        updateScore();
        setTimeout(mainGameLoop, LOOP_DELAY);
    }else if(snakeAlive && gameState === GameStates.PAUSED){
        setTimeout(mainGameLoop, 200);
    }
}

function updateRounds(){
    document.getElementById('round').textContent = round;
}

function updateFoodToCatch(){
    document.getElementById('ftc').textContent = foodToCatch;
}

function updateScore(){
    document.getElementById('score').textContent = score;
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
    shxEl.textContent = x[0];
    shyEl.textContent = y[0];
    fx.textContent = food_x;
    fy.textContent = food_y;
}

//graphical elements
var snaketail = [];
var snakehead = [];
var snakebody = [];
var snakefood = [];

function loadImages(){
    //Snake tail
    snaketail[Direction.UP] = new Image();
    snaketail[Direction.UP].src = 'img/schwanz-oben.svg';    

    snaketail[Direction.RIGHT] = new Image();
    snaketail[Direction.RIGHT].src = 'img/schwanz-rechts.svg';
    
    snaketail[Direction.DOWN] = new Image();
    snaketail[Direction.DOWN].src = 'img/schwanz-unten.svg';    

    snaketail[Direction.LEFT] = new Image();
    snaketail[Direction.LEFT].src = 'img/schwanz-links.svg';

    //Snake head
    snakehead[Direction.UP] = new Image();
    snakehead[Direction.UP].src = 'img/kopf-oben.svg';    

    snakehead[Direction.RIGHT] = new Image();
    snakehead[Direction.RIGHT].src = 'img/kopf-rechts.svg';
    
    snakehead[Direction.DOWN] = new Image();
    snakehead[Direction.DOWN].src = 'img/kopf-unten.svg';    

    snakehead[Direction.LEFT] = new Image();
    snakehead[Direction.LEFT].src = 'img/kopf-links.svg';

    //Snake body
    snakebody[Direction.UP] = new Image();
    snakebody[Direction.UP].src = 'img/koerper-vertikal.svg';    

    snakebody[Direction.RIGHT] = new Image();
    snakebody[Direction.RIGHT].src = 'img/koerper-horizontal.svg';

    snakebody[Direction.DOWN] = new Image();
    snakebody[Direction.DOWN].src = 'img/koerper-vertikal.svg';    

    snakebody[Direction.LEFT] = new Image();
    snakebody[Direction.LEFT].src = 'img/koerper-horizontal.svg';

    //Snake corner part
    snakebody[Direction.CORNER_NW] = new Image();
    snakebody[Direction.UP].src = 'img/eckstueck-nw.svg';    

    snakebody[Direction.CORNER_NE] = new Image();
    snakebody[Direction.RIGHT].src = 'img/eckstueck-no.svg';

    snakebody[Direction.CORNER_SE] = new Image();
    snakebody[Direction.DOWN].src = 'img/eckstueck-so.svg';    

    snakebody[Direction.CORNER_SW] = new Image();
    snakebody[Direction.LEFT].src = 'img/eckstueck-sw.svg';
    
    //Snake food
    snakefood = new Image();
    snakefood.src = 'img/wurst.svg';
}

var snakeLength = 5;
function initSnake(){
    x = [];
    y = [];
    x[0] = AREA_WIDTH_PX / 2;
    y[0] = AREA_HEIGHT_PX / 2;
}

var food_x;
var food_y;
function checkFoodFound(){
    if(food_x === x[0] && food_y === y[0]){
        snakeLength++;
        replaceFood();
        foodToCatch--;
        score = score + 3 * Math.ceil(round / 5);
        updateFoodToCatch();
        updateScore();
        if(foodToCatch == 0){
            initNewRound();
        }
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
    DOWN: 4,
    HORIZONTAL: 5,
    VERTICAL: 6,
    UNKNOWN: 7,
    CORNER_NW: 8,
    CORNER_NE: 9,
    CORNER_SE: 10,
    CORNER_SW: 11
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
            let cd = getCoordinateDirection();
            if (i === 0) {
                ctx.drawImage(snakehead[currentDirection], x[i], y[i], scaledImageSize, scaledImageSize);
            } else if (i === (snakeLength -1)) {
                ctx.drawImage(snaketail[cd], x[i], y[i], scaledImageSize, scaledImageSize);
            } else {
                if (cd > Direction.UNKNOWN){
                    //corner case (literally)
                    ctx.drawImage(snakebody[cd], x[i], y[i], scaledImageSize, scaledImageSize);
                }else if(cd === Direction.UP || cd === Direction.DOWN){
                    ctx.drawImage(snakebody[Direction.UP], x[i], y[i], scaledImageSize, scaledImageSize);
                }else{
                    ctx.drawImage(snakebody[Direction.RIGHT], x[i], y[i], scaledImageSize, scaledImageSize);
                }
            }
        }    
    } else {
        gameOver();
    }    
}

/**
 * When given the x/y array index, this function returns either
 * Direction.VERTICAL
 * or
 * Direction.HORIZONTAL
 * depending on the orientation of the given coordinate.
 * 
 * @param {*} index 
 */
function getCoordinateDirection(index){
    if(index == 0){
        if(x[1] === x[0]){
            if(y[1] > y[0]){
                return Direction.DOWN;
            }else{
                return Direction.UP;
            }
        }else{
            if(x[1] > x[0]){
                return Direction.RIGHT;
            }else{
                return Direction.LEFT;
            }
        }
    }
    if(x[index] === x[index - 1]){
        if(y[index] > y[index - 1]){
            return Direction.DOWN;
        }else{
            return Direction.UP;
        }
    }else if(y[index] === y[index - 1]){
        if(x[index] > x[index - 1]){
            return Direction.RIGHT;
        }else{
            return Direction.LEFT;
        }
    }else if(x[index] > x[index - 1]){
        if(y[index] > y[index - 1]){
            return Direction.CORNER_NW;
        }else{
            return Direction.CORNER_NE;
        }
    }else{
        if(x[index] > x[index - 1]){
            return Direction.CORNER_SW;
        }else{
            return Direction.CORNER_SE;
        }
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