var Display = {
    scoreEl: document.getElementById('score'),
    updateScore: function(newScore){
        Display.scoreEl.textContent = newScore;
    }
}