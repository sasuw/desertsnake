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
    showGameOver: function(){
        ctx.fillStyle = 'green';
        ctx.textBaseline = 'middle'; 
        ctx.textAlign = 'center'; 
        ctx.font = 'bold 4em sans-serif';
        
        ctx.fillText('Game over', AREA_WIDTH_PX/2, AREA_HEIGHT_PX/2);
    },
    //not used currently
    paintGrid: function(){
        try{   
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
}