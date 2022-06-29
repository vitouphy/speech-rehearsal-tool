import phonemeNormalizer from './phoneme-normalizer';
const { NWaligner } = require('seqalign');

export default {
    align: (text1, text2) => {
        const aligner = NWaligner({
            gapScoreFunction: () => -2,
            gapSymbol: '-',
        })

        text1 = text1.split(' ').join('|')
        text2 = text2.split(' ').join('')
        // const result = aligner.align(text1, text2);

        const normalizedText1 = phonemeNormalizer.normalize(text1)
        const normalizedText2 = phonemeNormalizer.normalize(text2)
        const result = aligner.align(normalizedText1, normalizedText2);

        const actual = result.alignedSequences[0]
        const pred = result.alignedSequences[1]
        const arr = []

        let rawText2Idx = 0;
        for (let i = 0; i<actual.length; i++) {
            // We use textaligner to align the normalized text, but we select the final character from the raw one. 
            if (pred[i] != "-") {
                // arr.push(pred[i])
                arr.push(text2[rawText2Idx++])
            }
            if (actual[i] == "|") {
                arr.push("|")
            }
        }
        
        return arr.join("").split('|');
    }
}
