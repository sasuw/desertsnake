const BASE_POINT_SIZE = 10;
const POINT_SIZE = 45;

const AREA_WIDTH = 24;
const AREA_HEIGHT = 24;

const AREA_WIDTH_PX = AREA_WIDTH * POINT_SIZE;
const AREA_HEIGHT_PX = AREA_HEIGHT * POINT_SIZE;

const POINT_AMOUNT = AREA_WIDTH * AREA_HEIGHT;

const MOVEMENT_EVERY_N_LOOPS_DEFAULT = 24;
var movementEveryNLoops = MOVEMENT_EVERY_N_LOOPS_DEFAULT;

const LOOP_DELAY = 5;
const SOUND_LENGTH_MS = movementEveryNLoops * LOOP_DELAY / 1000 * 4;

//canvas and canvas context for gameplay
var canvas, ctx;
//canvas and canvas context for background
var canvasBg, ctxBg;

var goingClockwise = null;

var shxEl, shyEl, fx, fy;
function init() {
    loadImages();

    setTimeout(function(){
        initCanvas();
        if (GameState.Round.number < 2 && GameState.State.isStopped()) {
            GameState.Snake.init();
        }

        initEventHandlers();
        initInfoTable();
        initDebugTable();

        GameState.Snake.resurrect();
        //GameState.Food.replaceFood();
        drawCanvas();
    }, 500)
    //wait for all images to load before drawing canvas
    Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(
        resolve => { img.onload = img.onerror = resolve; }))).then(() => {
            //does not work
        });

}

function initDebugTable() {
    shxEl = document.getElementById('shx'); //snake head x
    shyEl = document.getElementById('shy'); //snake head y
    fx = document.getElementById('fx'); //food x
    fy = document.getElementById('fy'); //food y
}

function initNewRound() {
    GameState.Round.increment();

    GameState.Food.incrementFoodToCatchEachRound();
    GameState.Food.resetFoodToCatch();

    movementEveryNLoops = movementEveryNLoops - 2;
    synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'E6'], SOUND_LENGTH_MS);
    //setTimeout(init, 5000);
    init();
}

function initInfoTable() {
    ScoreHandler.init();
    GameState.Round.updateRoundDisplay();
    GameState.Food.updateFoodToCatchDisplay();
}

var canvasInitialized = false;
function initCanvas() {
    try {
        if (canvasInitialized) {
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

        //Display.paintGrid();
        paintBackground();

        canvasInitialized = true;
    } catch (error) {
        console.error('initCanvas error: ' + error);
    }
}

function paintBackground() {
    try {
        var ptrn = ctxBg.createPattern(bg, 'repeat');
        ctxBg.fillStyle = ptrn;
        ctxBg.fillRect(0, 0, canvasBg.width, canvasBg.height);
    } catch (error) {
        console.log('paintBackground ERROR: ' + error);
    }
}

function initEventHandlers() {
    var playBtn = document.getElementById("playBtn");
    playBtn.addEventListener("click", async function () {
        startGame();
    });
}

var toneInitialized = false;
async function startGame() {
    document.getElementById('highScores').style.zIndex = 0;
    GameState.init();

    movementEveryNLoops = MOVEMENT_EVERY_N_LOOPS_DEFAULT;
    ScoreHandler.reset();
    ScoreHandler.updateScoreDisplay();

    if (!toneInitialized) {
        await Tone.start();
        toneInitialized = true;
    }
    GameState.Snake.resurrect();
    init();
    GameState.State.start();
    mainGameLoop();
}

function pauseGame() {
    synthX.triggerRelease();
    synthY.triggerRelease();
}

const synthX = new Tone.AMSynth().toDestination();
const synthY = new Tone.AMSynth().toDestination();
const synthSpecial = new Tone.MetalSynth().toDestination();
const synthSpecialPoly = new Tone.PolySynth(Tone.Synth).toDestination();

var ToneType = {
    x: 'x',
    y: 'y'
}
function playTones() {
    var mc = getMusicCoordinates();
    //console.log('mc: ' + mc.toString());

    playTone(mc.x, 5, ToneType.x, 4);
    playTone(9 - mc.y, 3, ToneType.y, 1);

    let everyNthBeat = 2; //setting this to n plays the tone on every nth beat
    let approximationToneSkipper = POINT_SIZE * everyNthBeat;
    if (GameState.Food.x === GameState.Snake.x[0] && GameState.Food.y !== GameState.Snake.y[0] && GameState.Snake.y[0] % approximationToneSkipper === 0) {
        playApproximationTone(GameState.Snake.y[0], GameState.Food.y);
    }
    if (GameState.Food.y === GameState.Snake.y[0] && GameState.Food.x !== GameState.Snake.x[0] && GameState.Snake.x[0] % approximationToneSkipper === 0) {
        playApproximationTone(GameState.Snake.x[0], GameState.Food.x);
    }

    if (GameState.Food.y === GameState.Snake.y[0] && GameState.Food.x === GameState.Snake.x[0]) {
        //food found
        synthSpecial.volume.value = 0;
        synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'B5'], SOUND_LENGTH_MS);
    }
}

function playApproximationTone(axisSnakeCoordinate, axisFoodCoordinate,) {
    try {
        let foodDistance = Math.abs(axisSnakeCoordinate - axisFoodCoordinate);
        //console.log('x: ' + GameState.Snake.x[0] + ', foodDistance: ' + foodDistance);
        synthSpecial.volume.value = -foodDistance / (AREA_WIDTH_PX / 32);
        //console.log('synthSpecial.volume.value: ' + synthSpecial.volume.value);
        synthSpecial.triggerAttackRelease('C3', SOUND_LENGTH_MS * 2);
    } catch (error) {
        console.error('playTone error: ' + error); //probably in Firefox
    }
}

var previousNote = {};
function playTone(noteNumber, startOctave, toneType, length) {
    try {
        //console.log('playTone started with noteNumber ' +  noteNumber + ', startOctave ' + startOctave + ', toneType ' + toneType + ', length ' + length);
        var note = ToneMapper.map(noteNumber, startOctave);
        if (previousNote[toneType] == note) {
            return;
        }
        previousNote[toneType] = note;
        //console.log('note.' + toneType + ': ' + note);

        let synth = synthX;
        if (toneType = ToneType.y) {
            synth = synthY;
        }
        //synth.triggerAttackRelease(note, length + 'n');
        synth.triggerAttackRelease(note, SOUND_LENGTH_MS);
    } catch (error) {
        console.error('playTone error: ' + error); //probably in Firefox
    }
}

function mainGameLoop() {
    try {
        if (GameState.Snake.isAlive() && GameState.State.isStarted()) {
            var moveSnakeLocal = function () {
                try {
                    GameState.Loop.incrementCounter();
                    if (GameState.Loop.counter % movementEveryNLoops === 0) {
                        //console.log(loopCounter++);
                        //decoupling movement from key detection guarantees better responsiveness
                        moveSnake();
                        //printLoopDebugInfo();
                        playTones();
                        return true;
                    }

                    return false;
                } catch (error) {
                    console.error('moveSnakeLocal error: ' + error);
                }
            }
            let stateChanged = checkFoodFound() || checkCollision() || moveSnakeLocal();

            if (stateChanged) {
                drawCanvas();
                ScoreHandler.incrementScoreLoop(GameState.Loop.counter);
                ScoreHandler.updateScoreDisplay();
            }
            setTimeout(mainGameLoop, LOOP_DELAY);
        } else if (GameState.Snake.isAlive() && GameState.State.isPaused()) {
            setTimeout(mainGameLoop, 200);
        }
    } catch (error) {
        console.error('mainGameLoop ERROR: ' + error);
    }
}

function Coordinates(x, y) {
    this.x = x;
    this.y = y;
}

Coordinates.prototype.toString = function () {
    return 'x: ' + this.x + ', y: ' + this.y;
}
function getMusicCoordinates() {
    var mcx = Math.floor(GameState.Snake.x[0] / AREA_WIDTH_PX * 8) + 1;
    var mcy = Math.floor(GameState.Snake.y[0] / AREA_HEIGHT_PX * 8 + 1);
    return new Coordinates(mcx, mcy);
}

function printLoopDebugInfo() {
    shxEl.textContent = GameState.Snake.x[0];
    shyEl.textContent = GameState.Snake.y[0];
    fx.textContent = GameState.Food.x;
    fy.textContent = GameState.Food.y;
}

//graphical elements
var snaketail = [];
var snakehead = [];
var snakebody = [];
var snakefood;
var bg;

function loadImages() {
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

    bg = new Image();
    bg.src = 'img/hintergrund.png'; //Safari cannot handle SVG images here    
}

/**
 * Returns true if food was found, otherwise false
 */
function checkFoodFound() {
    if (GameState.Food.x === GameState.Snake.x[0] && GameState.Food.y === GameState.Snake.y[0]) {
        GameState.Snake.grow();
        GameState.Food.replaceFood();
        GameState.Food.eatFood();
        ScoreHandler.incrementScoreFoodFound();
        GameState.Food.updateFoodToCatchDisplay();
        if (GameState.Food.noFoodLeft()) {
            initNewRound();
        }

        return true;
    }

    return false;
}

function moveSnake() {
    GameState.Snake.x.unshift(GameState.Snake.x[0]);
    GameState.Snake.y.unshift(GameState.Snake.y[0]);

    switch (GameState.Snake.currentDirection) {
        case Direction.DOWN:
            GameState.Snake.y[0] = GameState.Snake.y[0] + POINT_SIZE;
            break;
        case Direction.UP:
            GameState.Snake.y[0] = GameState.Snake.y[0] - POINT_SIZE;
            break;
        case Direction.LEFT:
            GameState.Snake.x[0] = GameState.Snake.x[0] - POINT_SIZE;
            break;
        case Direction.RIGHT:
            GameState.Snake.x[0] = GameState.Snake.x[0] + POINT_SIZE;
            break;
    }
}

function checkCollision() {
    for (var i = 1; i < GameState.Snake.length; i++) {
        if (GameState.Snake.x[i] == GameState.Snake.x[0] && GameState.Snake.y[i] == GameState.Snake.y[0]) {
            GameState.Snake.die();
            return true;
        }
    }

    let snakeIsStillInsideMap = GameState.Snake.x[0] >= 0 && GameState.Snake.x[0] < AREA_WIDTH_PX && GameState.Snake.y[0] >= 0 && GameState.Snake.y[0] < AREA_HEIGHT_PX;
    if (!snakeIsStillInsideMap) {
        GameState.Snake.die();
    }
    return !snakeIsStillInsideMap;
}

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_ENTER = 13;

onkeydown = function (e) {
    var key = e.keyCode; //for performance reasons the deprecated keyCode is used
    //console.log(key);

    if (key === KEY_LEFT) {
        GameState.Snake.currentDirection = GameState.Snake.currentDirection - 1;
        if (GameState.Snake.currentDirection === 0) {
            GameState.Snake.currentDirection = 4;
        }
        goingClockwise = true;
    }

    if (key === KEY_RIGHT) {
        GameState.Snake.currentDirection = GameState.Snake.currentDirection + 1;
        if (GameState.Snake.currentDirection === 5) {
            GameState.Snake.currentDirection = 1;
        }
        goingClockwise = false;
    }

    if (key === KEY_ENTER) {
        if (GameState.HighScores.highScoreInputInProgress) {
            return;
        }

        if (GameState.State.isStarted()) {
            GameState.State.pause();
            pauseGame();
        } else if (GameState.State.isStopped()) {
            //GameState.State.start();
            startGame();
        } else if (GameState.State.isPaused()) {
            GameState.State.start();
        }
    }
};

var prevCd = null;
function drawCanvas() {
    try {
        ctx.clearRect(0, 0, AREA_WIDTH_PX, AREA_HEIGHT_PX);

        var scaledImageSize = POINT_SIZE;

        if (GameState.Snake.isAlive()) {
            ctx.drawImage(snakefood, GameState.Food.x, GameState.Food.y, scaledImageSize, scaledImageSize);

            for (var i = GameState.Snake.length - 1; i > -1; i--) {
                let cd = getCoordinateDirection(i);
                prevCd = cd;
                if (i === 0) {
                    ctx.drawImage(snakehead[GameState.Snake.currentDirection], GameState.Snake.x[i], GameState.Snake.y[i], scaledImageSize, scaledImageSize);
                } else if (i === (GameState.Snake.length - 1)) {
                    let snakeTailDirection = cd + 2;
                    if (snakeTailDirection > 4) {
                        snakeTailDirection = snakeTailDirection - 4;
                    }
                    let snaketailImg = snaketail[snakeTailDirection];
                    if (snaketailImg == null) {
                        console.log('snaketailImg not found');
                    }
                    ctx.drawImage(snaketail[snakeTailDirection], GameState.Snake.x[i], GameState.Snake.y[i], scaledImageSize, scaledImageSize);
                } else {
                    if (cd > Direction.UNKNOWN) {
                        //corner case (literally)
                        ctx.drawImage(snakebody[cd], GameState.Snake.x[i], GameState.Snake.y[i], scaledImageSize, scaledImageSize);
                    } else if (cd === Direction.UP || cd === Direction.DOWN) {
                        ctx.drawImage(snakebody[Direction.UP], GameState.Snake.x[i], GameState.Snake.y[i], scaledImageSize, scaledImageSize);
                    } else {
                        ctx.drawImage(snakebody[Direction.RIGHT], GameState.Snake.x[i], GameState.Snake.y[i], scaledImageSize, scaledImageSize);
                    }
                }
            }
        } else {
            gameOver();
        }
    } catch (error) {
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
function getCoordinateDirection(index) {
    ;
    if (index > (GameState.Snake.x.length - 1)) {
        return GameState.Snake.currentDirection;
    }

    if (index < (GameState.Snake.length - 1) && index > 0 && index < (GameState.Snake.x.length - 1) && index < (GameState.Snake.y.length - 1)) {
        if (GameState.Snake.x[index + 1] > GameState.Snake.x[index - 1]) {
            if (GameState.Snake.y[index + 1] > GameState.Snake.y[index - 1]) {
                if (!goingClockwise) {
                    return Direction.CORNER_SW;
                } else {
                    return Direction.CORNER_NE;
                }
            } else if (GameState.Snake.y[index + 1] < GameState.Snake.y[index - 1]) {
                if (!goingClockwise) {
                    return Direction.CORNER_SE;
                } else {
                    return Direction.CORNER_NW;
                }
            }
        } else if (GameState.Snake.x[index + 1] < GameState.Snake.x[index - 1]) {
            if (GameState.Snake.y[index + 1] > GameState.Snake.y[index - 1]) {
                if (!goingClockwise) {
                    return Direction.CORNER_NW;
                } else {
                    return Direction.CORNER_SE;
                }
            } else if (GameState.Snake.y[index + 1] < GameState.Snake.y[index - 1]) {
                if (!goingClockwise) {
                    return Direction.CORNER_NE;
                } else {
                    return Direction.CORNER_SW;
                }
            }
        }
    }

    if (index == 0) {
        if (GameState.Snake.x[1] === GameState.Snake.x[0]) {
            if (GameState.Snake.y[1] > GameState.Snake.y[0]) {
                return Direction.DOWN;
            } else {
                return Direction.UP;
            }
        } else {
            if (GameState.Snake.x[1] > GameState.Snake.x[0]) {
                return Direction.RIGHT;
            } else {
                return Direction.LEFT;
            }
        }
    }
    if (GameState.Snake.x[index] === GameState.Snake.x[index - 1]) {
        if (GameState.Snake.y[index] > GameState.Snake.y[index - 1]) {
            return Direction.DOWN;
        } else {
            return Direction.UP;
        }
    } else if (GameState.Snake.y[index] === GameState.Snake.y[index - 1]) {
        if (GameState.Snake.x[index] > GameState.Snake.x[index - 1]) {
            return Direction.RIGHT;
        } else {
            return Direction.LEFT;
        }
    }
}

function gameOver() {
    GameState.State.stop();
    GameState.HighScores.highScoreInputInProgress = true;
    Display.showGameOver();
    synthX.triggerRelease();
    synthY.triggerRelease();
    synthSpecialPoly.triggerAttackRelease(['E5', 'G#5', 'C6'], SOUND_LENGTH_MS);
}