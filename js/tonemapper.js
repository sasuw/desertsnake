function ToneMapper(){

}

/**
 * Returns note, e.g. 'C5' when given a number from 1 to 8
 *  
 * @param {
 * number 
 */
ToneMapper.map = function(number, startOctave){
    
    if(startOctave == null){
        startOctave = 4;
    }
    
    var octave = startOctave;
    switch(number){
        case 1:
            tone = 'E';
            break;
        case 2:
            tone = 'F';
            break;
        case 3:
            tone = 'G#';
            break;
        case 4:
            tone = 'A';
            break;
        case 5:
            tone = 'B';
            break;
        case 6:
            tone = 'C';
            octave = octave + 1;
            break;
        case 7:
            tone = 'D#';
            octave = octave + 1; 
            break;
        case 8:
            tone = 'E';
            octave = startOctave + 1;
            break;
        default:
            console.error('ToneMapper.map: unknown number ' + number);
            break;
    }

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