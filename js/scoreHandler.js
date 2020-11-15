var ScoreHandler = {
    totalScore: 0,
    loopScore: 0,
    foodScore: 0,
    roundScore: 0,
    incrementScoreLoop: function(loopCounter){
        ScoreHandler.loopScore = Math.floor(loopCounter / 300);
    },
    incrementScoreRound: function(roundNumber){
        ScoreHandler.roundScore = ScoreHandler.roundScore + roundNumber * 2;
    },
    incrementScoreFoodFound: function(){
        ScoreHandler.foodScore = ScoreHandler.foodScore + 3;
    },
    updateScoreDisplay: function(){
        let newTotalScore = ScoreHandler.loopScore + ScoreHandler.foodScore + ScoreHandler.roundScore;
        if(newTotalScore === ScoreHandler.totalScore){
            return;
        }
        ScoreHandler.totalScore = newTotalScore;
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
