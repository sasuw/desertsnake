var GameState = {
    State: {
        States: {
            STARTED: 0, 
            STOPPED: 1,
            PAUSED: 2
        },
        start: function(){
            GameState.State.currentState = GameState.State.States.STARTED;
        },
        stop: function(){
            GameState.State.currentState = GameState.State.States.STOPPED;
        },
        pause: function(){
            GameState.State.currentState = GameState.State.States.PAUSED;
        },
        isStarted: function(){
            return GameState.State.currentState === GameState.State.States.STARTED;
        },
        isStopped: function(){
            return GameState.State.currentState === GameState.State.States.STOPPED;
        },
        isPaused: function(){
            return GameState.State.currentState === GameState.State.States.PAUSED;
        }
    },
    Round: {
        number: 1,
        increment: function(){
            GameState.Round.number++;
        },
        updateRoundDisplay: function(){
            Display.updateRound(GameState.Round.number);
        }
    },
    Food: {
        foodToCatchFirstRound: 3,
        foodToCatchEachRound: 3,
        foodToCatchCurrentRound: 3,
        x: 1,
        y: 1,
        replaceFood: function(){
            //TODO: prevent food from landing under snake
            GameState.Food.x = Math.floor(Math.random() * AREA_WIDTH) * POINT_SIZE;
            GameState.Food.y = Math.floor(Math.random() * AREA_HEIGHT) * POINT_SIZE;
        },
        incrementFoodToCatchEachRound: function(){
            GameState.Food.foodToCatchEachRound++;
        },
        resetFoodToCatch: function(){
            GameState.Food.foodToCatchCurrentRound = GameState.Food.foodToCatchEachRound;
        },
        updateFoodToCatchDisplay: function(){
            Display.updateFoodToCatch(GameState.Food.foodToCatchCurrentRound);
        },
        noFoodLeft: function(){
            return (GameState.Food.foodToCatchCurrentRound < 1);
        },
        eatFood: function(){
            GameState.Food.foodToCatchCurrentRound--;
        },
        init: function(){
            GameState.Food.foodToCatchEachRound = GameState.Food.foodToCatchFirstRound;
            GameState.Food.foodToCatchCurrentRound = GameState.Food.foodToCatchCurrentRound;
            GameState.Food.replaceFood();
        }
    },
    Snake: {
        alive: true,
        die: function(){
            GameState.Snake.alive = false;
        },
        resurrect: function(){
            GameState.Snake.alive = true;
        },
        isAlive: function(){
            return GameState.Snake.alive;
        },
        init: function(){
            GameState.Snake.resurrect();
        }
    }
};

GameState.State.currentState = GameState.State.States.STOPPED;

GameState.init = function(){
    GameState.State.currentState = GameState.State.States.STOPPED;

    GameState.Round.number = 1;

    GameState.Food.init();

    GameState.Snake.init();
}

