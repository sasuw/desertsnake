Globals = {

};

var Backend = {
    fetchAjaxOptions: {
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    },
    getBackendHost: function () {
        let host = window.location.host;
        console.log('host: ' + host);
        switch (host) {
            case 'snake.sasu.net':
                return 'https://backend.snake.sasu.net';
            case 'localhost':
            case 'localhost:8000':
            case '127.0.0.1':
            case '127.0.0.1:8000':
                return 'http://127.0.0.1:3001';
            default:
                return 'http://127.0.0.1:3001'
        }
    },
    getHighScoresTop10: async function () {
        let url = Backend.getBackendHost() + '/highscore/top10';
        let initOptions = Object.assign({
            method: 'GET'
        }, Globals.fetchAjaxOptions);
        try{
            const response = await fetch(url, initOptions);
            return response; // parses JSON response into native JavaScript objects
        }catch(error){
            console.warn('Reading highscores not possible: ' + error);
        }
    },
    saveHighScore: async function (score, name) {
        let url = Backend.getBackendHost() + '/highscore';
        let initOptions = Object.assign({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "score": score,
                "name": name,
                "date": Date.now()
            })
        }, Globals.fetchAjaxOptions);
        const response = await fetch(url, initOptions);
        Display.showHighScoresFromBackend();
        GameState.HighScores.highScoreInputInProgress = false;
    }
}