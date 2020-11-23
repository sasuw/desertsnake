var ScoreType = {
    FOOD: 0,
    LOOP: 1,
    ROUND: 2,
    TOTAL: 3
};

var ScoreEvent = function(scoreType, newScore){
    this.time = Date.now();
    this.scoreType = scoreType;
    this.newScore = newScore;
}

var ScoreHandler = {
    scoreEvents: [],
    foodScore: 0,
    loopScore: 0,
    roundScore: 0,
    totalScore: 0,
    storeScoreEvent: function(scoreType, newScore){
        ScoreHandler.scoreEvents.push(new ScoreEvent(scoreType, newScore));
    },
    incrementScoreFoodFound: function(){
        ScoreHandler.foodScore = ScoreHandler.foodScore + 3;
        ScoreHandler.storeScoreEvent(ScoreType.FOOD, ScoreHandler.foodScore);
    },
    incrementScoreLoop: function(loopCounter){
        ScoreHandler.loopScore = Math.floor(loopCounter / 300);
        ScoreHandler.storeScoreEvent(ScoreType.LOOP, ScoreHandler.loopScore);
    },
    incrementScoreRound: function(roundNumber){
        ScoreHandler.roundScore = ScoreHandler.roundScore + roundNumber * 2;
        ScoreHandler.storeScoreEvent(ScoreType.ROUND, ScoreHandler.roundScore);
    },
    updateScoreDisplay: function(){
        let newTotalScore = ScoreHandler.loopScore + ScoreHandler.foodScore + ScoreHandler.roundScore;
        if(newTotalScore === ScoreHandler.totalScore){
            return;
        }
        ScoreHandler.totalScore = newTotalScore;
        ScoreHandler.storeScoreEvent(ScoreType.TOTAL, ScoreHandler.totalScore);
        Display.updateScore(ScoreHandler.totalScore);
    },
    init: function(){
        Display.updateScore(ScoreHandler.totalScore);
    },
    reset: function(){
        ScoreHandler.totalScore = 0,
        ScoreHandler.loopScore = 0,
        ScoreHandler.foodScore = 0,
        ScoreHandler.roundScore = 0
    }
}
