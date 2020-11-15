var Display = {
    scoreEl: document.getElementById('score'),
    roundEl: document.getElementById('round'),
    foodToCatchEl: document.getElementById('ftc'),
    updateScore: function(newScore){
        Display.scoreEl.textContent = newScore;
    },
    updateRound: function(newRound){
        Display.roundEl.textContent = newRound;
    },
    updateFoodToCatch: function(newFtc){
        Display.foodToCatchEl.textContent = newFtc;
    },
}