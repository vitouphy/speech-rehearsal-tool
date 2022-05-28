const { NWaligner } = require('seqalign');

export default {
    align: (text1, text2) => {
        const aligner = NWaligner({
            gapScoreFunction: () => -2,
            gapSymbol: '-',
        })

        text1 = text1.split(' ').join('|')
        text2 = text2.split(' ').join('')
        const result = aligner.align(text1, text2);

        const actual = result.alignedSequences[0]
        const pred = result.alignedSequences[1]
        const arr = []
        for (let i = 0; i<actual.length; i++) {
            if (pred[i] != "-") {
                arr.push(pred[i])
            }
            if (actual[i] == "|") {
                arr.push("|")
            }
        }
        return arr.join("").split('|');
    }
}
