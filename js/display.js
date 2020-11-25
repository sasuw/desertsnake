var Display = {
    scoreEl: document.getElementById('score'),
    roundEl: document.getElementById('round'),
    foodToCatchEl: document.getElementById('ftc'),
    updateScore: function (newScore) {
        Display.scoreEl.textContent = newScore;
    },
    updateRound: function (newRound) {
        Display.roundEl.textContent = newRound;
    },
    updateFoodToCatch: function (newFtc) {
        Display.foodToCatchEl.textContent = newFtc;
    },
    showGameOver: function () {
        ctx.fillStyle = 'green';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = 'bold ' + (POINT_SIZE * 3) + 'px Play, monospace';

        ctx.fillText('Game over', AREA_WIDTH_PX / 2, AREA_HEIGHT_PX / 2);
        setTimeout(function () {
            ctx.clearRect(0, 0, AREA_WIDTH_PX, AREA_HEIGHT_PX);
            Display.showHighScoresFromBackend();
        }, 1200);
    },
    //not used currently
    paintGrid: function () {
        try {
            let i;
            for (i = 1; i < 9; i++) {
                ctx.beginPath();
                let lineX = AREA_WIDTH_PX / 8 * i;
                ctx.moveTo(lineX, 0);
                ctx.lineTo(lineX, AREA_HEIGHT_PX);
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
            }

            for (i = 1; i < 9; i++) {
                ctx.beginPath();
                let lineY = AREA_HEIGHT_PX / 8 * i;
                ctx.moveTo(0, lineY);
                ctx.lineTo(AREA_WIDTH_PX, lineY);
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
            }
        } catch (error) {
            console.log('paintGrid ERROR: ' + error);
        }
    },
    showHighScoresFromBackend: function () {
        document.getElementById('highScores').style.zIndex = 15;
        Backend.getHighScoresTop10().then(response => {
            try {
                if (response.status === 400) {
                    //hmm
                    console.error('400');
                } else if (response.status !== 200) {
                    console.error('Backend.getHighScoresTop10 error with status code ' + response.status);
                } else {
                    response.text().then(data => {
                        try {
                        let highScoreArr = JSON.parse(data);
                        GameState.HighScores.values = highScoreArr;
                        Display.showHighScores(true);
                    } catch (error) {
                        console.error('Backend.getHighScoresTop10 fetch success function error: ' + error);
                    }
                    });
                }
            } catch (error) {
                console.error('Backend.getHighScoresTop10 fetch error: ' + error);
            }
        });
        console.log('ready');
    },
    showHighScores: function (saveHighScores) {
        try {
            let hsPosElements = document.getElementsByClassName('hsPos');
            Array.prototype.forEach.call(hsPosElements, (hsPosEl) => {
                hsPosEl.style.display = 'none';
            });

            let i = 0;
            for (i = 0; i < GameState.HighScores.values.length && i < 11;) {
                let hs = GameState.HighScores.values[i];

                let hsNameEl = document.getElementById('hsName' + (++i));
                let hsScoreEl = document.getElementById('hsScore' + i);
                let hsPos = document.getElementById('hsPos' + i);

                hsNameEl.innerText = hs.name;
                hsScoreEl.innerText = hs.score;
                hsPos.style.display = 'block';
            }

            document.getElementById('topXTitle').innerText = 'TOP ' + GameState.HighScores.values.length;
            if (saveHighScores) {
                GameState.HighScores.saveHighScore();
            }
        } catch (error) {
            console.error('showHighScores error: ' + error);
        }
    }
}