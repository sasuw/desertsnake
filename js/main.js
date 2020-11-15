const BASE_POINT_SIZE = 10;
const POINT_SIZE = 15;

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

var movementEveryNLoops = 24;

const LOOP_DELAY = 5;
const SOUND_LENGTH_MS = movementEveryNLoops * LOOP_DELAY / 1000 * 4;

//snake coordinates, where x[0], y[0] is the snake's head position
var x = new Array(AREA_WIDTH);
var y = new Array(AREA_HEIGHT);

//canvas and canvas context for gameplay
var canvas, ctx;
//canvas and canvas context for background
var canvasBg, ctxBg;

var round = 1;
var foodToCatchIncrement = 1;
var foodToCatch = foodToCatchIncrement;
var goingClockwise = null;

var doPaintGrid = false;

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
    movementEveryNLoops = movementEveryNLoops - 2;
    synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'E6'], SOUND_LENGTH_MS);
    //setTimeout(init, 5000);
    init();
}

function initInfoTable(){
    ScoreHandler.updateScoreDisplay();
    updateRounds();
    updateFoodToCatch();
}

var canvasInitialized = false;
function initCanvas(){
    try{
        if(canvasInitialized){
            return;
        }

        canvas = document.getElementById('gamePlay');
        ctx = canvas.getContext('2d');

        canvas.width = AREA_WIDTH_PX;
        canvas.height = AREA_HEIGHT_PX;

        canvasBg = document.getElementById('background');
        ctxBg = canvasBg.getContext('2d');

        canvasBg.width = AREA_WIDTH_PX;
        canvasBg.height = AREA_HEIGHT_PX;

        paintGrid();
        paintBackground();

        canvasInitialized = true;
    }catch(error){
        console.error('initCanvas error: ' + error);
    }
}

function paintBackground(){
    try{
        let bg = new Image();
        bg.src = 'img/hintergrund.png'; //Safari cannot handle SVG images here    

        bg.onload = function() {
            var ptrn = ctxBg.createPattern(bg, 'repeat'); // Create a pattern with this image, and set it to "repeat".
            ctxBg.fillStyle = ptrn;
            ctxBg.fillRect(0, 0, canvasBg.width, canvasBg.height); // context.fillRect(x, y, width, height);
        }
        bg.onerror = function(error){
            console.error('bg image error: ' + error);
        }
    }catch(error){
        console.log('paintBackground ERROR: ' + error);
    }
}

function paintGrid(){
    try{
        if(!doPaintGrid){
            return;
        }

        let i;
        for(i = 1; i < 9; i++){
            ctx.beginPath();
            let lineX = AREA_WIDTH_PX / 8 * i;
            ctx.moveTo(lineX, 0);
            ctx.lineTo(lineX, AREA_HEIGHT_PX);
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }

        for(i = 1; i < 9; i++){
            ctx.beginPath();
            let lineY = AREA_HEIGHT_PX / 8 * i;
            ctx.moveTo(0, lineY);
            ctx.lineTo(AREA_WIDTH_PX, lineY);
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
    }catch(error){
        console.log('paintGrid ERROR: ' + error);
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
    round = 1;
    foodToCatchIncrement = 3;
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
    //console.log('mc: ' + mc.toString());

    playTone(mc.x, 5, ToneType.x, 4);
    playTone(9 - mc.y, 3, ToneType.y, 1);

    let everyNthBeat = 2; //setting this to n plays the tone on every nth beat
    let approximationToneSkipper = POINT_SIZE * everyNthBeat;
    if(food_x === x[0] && food_y !== y[0] && y[0] % approximationToneSkipper === 0){
        playApproximationTone(y[0], food_y);
    }
    if(food_y === y[0] && food_x !== x[0] && x[0] % approximationToneSkipper === 0){
        playApproximationTone(x[0], food_x);
    }

    if(food_y === y[0] && food_x === x[0]){
        //food found
        synthSpecial.volume.value = 0;
        synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'B5'], SOUND_LENGTH_MS);
    }
}

function playApproximationTone(axisSnakeCoordinate, axisFoodCoordinate, ){
    try{
        let foodDistance = Math.abs(axisSnakeCoordinate - axisFoodCoordinate);
        //console.log('x: ' + x[0] + ', foodDistance: ' + foodDistance);
        synthSpecial.volume.value = -foodDistance / (AREA_WIDTH_PX / 32);
        //console.log('synthSpecial.volume.value: ' + synthSpecial.volume.value);
        synthSpecial.triggerAttackRelease('C3', SOUND_LENGTH_MS * 2);
    }catch(error){
        console.error('playTone error: ' + error); //probably in Firefox
    }
}

var previousNote = {};
function playTone(noteNumber, startOctave, toneType, length){
    try{
        //console.log('playTone started with noteNumber ' +  noteNumber + ', startOctave ' + startOctave + ', toneType ' + toneType + ', length ' + length);
        var note = ToneMapper.map(noteNumber, startOctave);
        if(previousNote[toneType] == note){
            return;
        }
        previousNote[toneType] = note;
        //console.log('note.' + toneType + ': ' + note);

        let synth = synthX;
        if(toneType = ToneType.y){
            synth = synthY;
        }
        //synth.triggerAttackRelease(note, length + 'n');
        synth.triggerAttackRelease(note, SOUND_LENGTH_MS);
    }catch(error){
        console.error('playTone error: ' + error); //probably in Firefox
    }
}

var snakeAlive = true;
var loopCounter = 0;
function mainGameLoop(){
    if(snakeAlive && gameState === GameStates.STARTED){
        var moveSnakeLocal = function(){
            if(++loopCounter % movementEveryNLoops === 0){
                //console.log(loopCounter++);
                //decoupling movement from key detection guarantees better responsiveness
                moveSnake();
                //printLoopDebugInfo();
                playTones();
                return true;
            }

            return false;
        }
        let stateChanged = checkFoodFound() || checkCollision() || moveSnakeLocal();
        
        if(stateChanged){
            drawCanvas();
            ScoreHandler.incrementScoreLoop(loopCounter);
            ScoreHandler.updateScoreDisplay();
        }
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
var snakefood;

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
    snakebody[Direction.CORNER_NW].src = 'img/eckstueck-nw.svg';    

    snakebody[Direction.CORNER_NE] = new Image();
    snakebody[Direction.CORNER_NE].src = 'img/eckstueck-no.svg';

    snakebody[Direction.CORNER_SE] = new Image();
    snakebody[Direction.CORNER_SE].src = 'img/eckstueck-so.svg';    

    snakebody[Direction.CORNER_SW] = new Image();
    snakebody[Direction.CORNER_SW].src = 'img/eckstueck-sw.svg';
    
    //Snake food
    snakefood = new Image();
    snakefood.src = 'img/wurst.svg';
}

var snakeLength = 3;
function initSnake(){
    x = [];
    y = [];
    x[0] = AREA_WIDTH_PX / 2;
    y[0] = AREA_HEIGHT_PX / 2;
}

var food_x;
var food_y;
/**
 * Returns true if food was found, otherwise false
 */
function checkFoodFound(){
    if(food_x === x[0] && food_y === y[0]){
        snakeLength++;
        replaceFood();
        foodToCatch--;
        ScoreHandler.incrementScoreFoodFound();
        updateFoodToCatch();
        if(foodToCatch == 0){
            initNewRound();
        }

        return true;
    }

    return false;
}

function replaceFood(){
    //TODO: prevent food from landing under snake
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
            return true;
        }
    }

    snakeAlive = x[0] >= 0 && x[0] < AREA_WIDTH_PX && y[0] >= 0 && y[0] < AREA_HEIGHT_PX; 
    return !snakeAlive;
}

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_ENTER = 13;

onkeydown = function(e) {
    var key = e.keyCode; //for performance reasons the deprecated keyCode is used
    //console.log(key);
    
    if (key === KEY_LEFT) {
        currentDirection = currentDirection - 1;
        if(currentDirection === 0){
            currentDirection = 4;
        }
        goingClockwise = true;
    }

    if (key === KEY_RIGHT) {
        currentDirection = currentDirection + 1;
        if(currentDirection === 5){
            currentDirection = 1;
        }
        goingClockwise = false;
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

var prevCd = null;
function drawCanvas(){
    try{
        ctx.clearRect(0, 0, AREA_WIDTH_PX, AREA_HEIGHT_PX);
        //paintGrid();
        //paintBackground();

        var scaledImageSize = POINT_SIZE;

        if (snakeAlive) {
            ctx.drawImage(snakefood, food_x, food_y, scaledImageSize, scaledImageSize);

            for (var i = snakeLength - 1; i > -1; i--) {
                let cd = getCoordinateDirection(i);
                prevCd = cd;
                if (i === 0) {
                    ctx.drawImage(snakehead[currentDirection], x[i], y[i], scaledImageSize, scaledImageSize);
                } else if (i === (snakeLength -1)) {
                    let snakeTailDirection = cd + 2;
                    if(snakeTailDirection > 4){
                        snakeTailDirection = snakeTailDirection - 4;
                    }
                    let snaketailImg = snaketail[snakeTailDirection];
                    if(snaketailImg == null){
                        console.log('snaketailImg not found');
                    } 
                    ctx.drawImage(snaketail[snakeTailDirection], x[i], y[i], scaledImageSize, scaledImageSize);
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
    }catch(error){
        console.log('drawCanvas ERROR: ' + error);
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
function getCoordinateDirection(index){;
    if(index > (x.length - 1)){
        return currentDirection;
    }
    
    if(index < (snakeLength -1) && index > 0 && index < (x.length - 1) && index < (y.length - 1)){
        if(x[index + 1] > x[index - 1]){
            if(y[index + 1] > y[index - 1]){
                if(!goingClockwise){
                    return Direction.CORNER_SW;
                }else{
                    return Direction.CORNER_NE;
                }
            }else if(y[index + 1] < y[index - 1]){
                if(!goingClockwise){
                    return Direction.CORNER_SE;
                }else{
                    return Direction.CORNER_NW;
                }
            }
        }else if(x[index + 1] < x[index - 1]){
            if(y[index + 1] > y[index - 1]){
                if(!goingClockwise){
                    return Direction.CORNER_NW;
                }else{
                    return Direction.CORNER_SE;
                }
            }else if(y[index + 1] < y[index - 1]){
                if(!goingClockwise){
                    return Direction.CORNER_NE;
                }else{
                    return Direction.CORNER_SW;
                }
            }
        }
    }  
    
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
    }
}

function gameOver() {
    ctx.fillStyle = '#222222';
    ctx.textBaseline = 'middle'; 
    ctx.textAlign = 'center'; 
    ctx.font = 'normal bold 2em Verdana';
    
    ctx.fillText('Game over', AREA_WIDTH_PX/2, AREA_HEIGHT_PX/2);

    gameState = GameStates.STOPPED;
    synthX.triggerRelease();
    synthY.triggerRelease();
    synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'C6'], SOUND_LENGTH_MS);
}