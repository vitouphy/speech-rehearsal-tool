const normalize_map = {
    'ɨ':'ɪ',
    'ʉ':'u',    
    'ɔ':'ɑ',   
    'l̩':'l',        
    'ɚ':'ɝ',
    'm̩':'m',        
    'ɾ̃':'n',     
    'n̩':'n',         
    'ʒ':'ʃ', 
    'ɾ̃':'ŋ',
    // these 4 should be in the same group
    'ɜ':'ɝ',
    'ə':'ʌ'   
}

export default {
    normalize: (text) => {
        if (!text || text.length == 0) {
            return text;
        }

        let arr = []
        for (let i = 0; i<text.length; i++) {
            if (text[i] in normalize_map) {
                arr.push(normalize_map[text[i]])
            } else {
                arr.push(text[i])
            }
        }
        return arr.join('');
    }
}