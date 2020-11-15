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
    }
};

GameState.State.currentState = GameState.State.States.STOPPED;

GameState.init = function(){
    GameState.State.currentState = GameState.State.States.STOPPED;
}

