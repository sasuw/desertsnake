var GameState = {
    State: {
        States: {
            STARTED: 0,
            STOPPED: 1,
            PAUSED: 2
        },
        start: function () {
            GameState.State.currentState = GameState.State.States.STARTED;
        },
        stop: function () {
            GameState.State.currentState = GameState.State.States.STOPPED;
        },
        pause: function () {
            GameState.State.currentState = GameState.State.States.PAUSED;
        },
        isStarted: function () {
            return GameState.State.currentState === GameState.State.States.STARTED;
        },
        isStopped: function () {
            return GameState.State.currentState === GameState.State.States.STOPPED;
        },
        isPaused: function () {
            return GameState.State.currentState === GameState.State.States.PAUSED;
        }
    },
    Round: {
        number: 1,
        increment: function () {
            GameState.Round.number++;
        },
        updateRoundDisplay: function () {
            Display.updateRound(GameState.Round.number);
        }
    },
    Food: {
        foodToCatchFirstRound: 3,
        foodToCatchEachRound: 3,
        foodToCatchCurrentRound: 3,
        x: 1,
        y: 1,
        replaceFood: function () {
            //TODO: prevent food from landing under snake
            GameState.Food.x = Math.floor(Math.random() * AREA_WIDTH) * POINT_SIZE;
            GameState.Food.y = Math.floor(Math.random() * AREA_HEIGHT) * POINT_SIZE;
        },
        incrementFoodToCatchEachRound: function () {
            GameState.Food.foodToCatchEachRound++;
        },
        resetFoodToCatch: function () {
            GameState.Food.foodToCatchCurrentRound = GameState.Food.foodToCatchEachRound;
        },
        updateFoodToCatchDisplay: function () {
            Display.updateFoodToCatch(GameState.Food.foodToCatchCurrentRound);
        },
        noFoodLeft: function () {
            return (GameState.Food.foodToCatchCurrentRound < 1);
        },
        eatFood: function () {
            GameState.Food.foodToCatchCurrentRound--;
        },
        init: function () {
            GameState.Food.foodToCatchEachRound = GameState.Food.foodToCatchFirstRound;
            GameState.Food.foodToCatchCurrentRound = GameState.Food.foodToCatchFirstRound;
            GameState.Food.replaceFood();
        }
    },
    Snake: {
        x: [], //head x
        y: [], //head y
        alive: true,
        die: function () {
            GameState.Snake.alive = false;
        },
        resurrect: function () {
            GameState.Snake.alive = true;
        },
        isAlive: function () {
            return GameState.Snake.alive;
        },
        init: function () {
            GameState.Snake.resurrect();
            GameState.Snake.length = GameState.Snake.initialLength;
            GameState.Snake.x[0] = AREA_WIDTH_PX / 2;
            GameState.Snake.y[0] = AREA_HEIGHT_PX / 2;
        },
        initialLength: 3,
        length: 3,
        grow: function () {
            GameState.Snake.length++;
        }
    },
    Loop: {
        counter: 0,
        incrementCounter: function () {
            GameState.Loop.counter++;
        }
    },
    HighScores: {
        values: [],
        readFromBackend: function () {

        },
        getCurrentHighscores: function () {

        },
        insertNewHighScore: function(newPosition, name, score) {
            if(GameState.HighScores.values.length < newPosition){
                console.error('insertNewHighScore impossible position ' + newPosition);
                return;
            }
            GameState.HighScores.values.splice(newPosition, 0, {
                'name': name,
                'score': score
            });
        },
        /**
         * If given score is in top 10, the position in the list is returned,
         * otherwise null
         * 
         * @param int score 
         */
        getNewHighScorePosition: function (score) {
            if (GameState.HighScores.values.length === 0) {
                return 1;
            }

            for (i = 0; i < GameState.HighScores.values.length; i++) {
                if (score > GameState.HighScores.values[i].score) {
                    return (i + 1);
                }
            }

            if (GameState.HighScores.values.length < 10) {
                return GameState.HighScores.values.length + 1;
            }

            return null;
        },
        highScoreInputInProgress: false,
        highScoreInputFieldEventListener: null,
        highScoreInputFunction: function (e) {
            try {
                let hsNameEl = e.target || e.srcElement;

                if(hsNameEl.textContent.length > 9){
                    e.preventDefault();
                }

                if (e.key === 'Enter') {
                    Backend.saveHighScore(ScoreHandler.totalScore, hsNameEl.textContent.substr(0,10));
                    hsNameEl.contentEditable = 'false';
                }
            } catch (error) {
                console.error('highScoreInputFunction error: ' + error);
            }
        },
        saveHighScore: function () {
            try {
                if(!GameState.HighScores.highScoreInputInProgress){
                    return;
                }

                let newHighScorePos = GameState.HighScores.getNewHighScorePosition(ScoreHandler.totalScore);
                if (newHighScorePos !== null) {
                    GameState.HighScores.insertNewHighScore((newHighScorePos - 1), '', ScoreHandler.totalScore);
                    Display.showHighScores(false);

                    let hsNameEl = document.getElementById('hsName' + newHighScorePos);
                    let hsScoreEl = document.getElementById('hsScore' + newHighScorePos);
                    let hsPosEl = document.getElementById('hsPos' + newHighScorePos);

                    hsPosEl.style.display = 'block';
                    hsNameEl.innerText = '';
                    hsScoreEl.innerText = ScoreHandler.totalScore.toString();

                    hsNameEl.contentEditable = 'true';
                    hsNameEl.removeEventListener('keypress', GameState.HighScores.highScoreInputFunction);
                    hsNameEl.addEventListener('keypress', GameState.HighScores.highScoreInputFunction);
                    hsNameEl.focus();
                } else {
                    Backend.saveHighScore(ScoreHandler.totalScore, '???')
                }
            } catch (error) {
                console.error('saveHighScore error: ' + error);
            }
        },
        enterHighScore: function () {

        }
    }
};

GameState.State.currentState = GameState.State.States.STOPPED;

GameState.init = function () {
    GameState.State.currentState = GameState.State.States.STOPPED;

    GameState.Round.number = 1;

    GameState.Food.init();

    GameState.Snake.init();

    GameState.Loop.counter = 0;

    GameState.HighScores.highScoreInputInProgress = false;
}