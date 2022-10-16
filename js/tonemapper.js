function ToneMapper(){

}

ToneMapper.orientalMap = {
    1: ['E', 0],
    2: ['F', 0],
    3: ['G#', 0],
    4: ['A', 0],
    5: ['B', 0],
    6: ['C', 1],
    7: ['D#', 1],
    8: ['E', 1]
}

ToneMapper.diatonicMap = {
    1: ['F', 0],
    2: ['G', 0],
    3: ['A', 0],
    4: ['Bb', 0],
    5: ['C', 0],
    6: ['D', 1],
    7: ['E', 1],
    8: ['F', 1]
}

ToneMapper.mseMap = {
    1: ['E', 0],
    2: ['G', 0],
    3: ['B', 0],
    4: ['E', 1],
    5: ['G', 1],
    6: ['B', 1],
    7: ['E', 2],
    8: ['E', 3]
}


/**
 * Returns note, e.g. 'C5' when given a number from 1 to 8
 *  
 * @param {
 * number diatonicMap
 */
ToneMapper.map = function(number, startOctave){
    if(startOctave == null){
        startOctave = 4;
    }
    if(number > 8){
        number = 8;
    }

    let toneArr = ToneMapper.mseMap[number];
    let tone = toneArr[0];
    let octave = startOctave + toneArr[1];

    var note = tone + octave;
    //console.log('note: ' + note);
    return note;
};

/**
    x = 1 - 8
    y = 1 - 8
*/
ToneMapper.getChordForSquare = function(x, y){
    
};