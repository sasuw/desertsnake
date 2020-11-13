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
            tone = 'C';
            break;
        case 2:
            tone = 'D';
            break;
        case 3:
            tone = 'E';
            break;
        case 4:
            tone = 'F';
            break;
        case 5:
            tone = 'G';
            break;
        case 6:
            tone = 'A';
            break;
        case 7:
            tone = 'B';
            break;
        case 8:
            tone = 'C';
            octave = startOctave + 1;
            break;
        default:
            console.error('ToneMapper.map: unknown number');
            break;
    }

    var note = tone + octave;
    return note;
};