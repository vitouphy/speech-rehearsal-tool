const express = require('express')
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const axios = require('axios')
const app = express()
// init Log
var expressWinston = require('express-winston');
var winston = require('winston'); // for transports.Console
// init SpeechConfig 
const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_API_KEY, process.env.SPEECH_API_REGION);
speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; 


app.use(express.json({
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({
    extended: false,
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));


var router = express.Router();
router.post('/audio2phoneme', (req, res) => {
    const apiUrl = process.env.AUDIO_TO_PHONEME_URL;
    const config = {
        headers: {
            'Authorization': `Bearer ${process.env.HF_API_SECRET}`,
            'Content-Type': 'audio/webm'
        }
    };

    axios.post(apiUrl, req.rawBody, config)
    .then(response => {
        res.status(response.status).json(response.data);
    })
    .catch(error => {
        res.status(error.response.status).json(error.response.data);
    });
})

router.get('/text2phoneme', (req, res) => {
    if (!req.query.hasOwnProperty('text')) {
        return res.status(400).json();
    }

    const apiUrl = process.env.TEXT_TO_PHONEME_URL;
    const params = { text: req.query.text };

    axios.get(apiUrl, { params })
    .then(response => {
        res.status(response.status).json(response.data);
    })
    .catch(error => {
        res.status(error.response.status).json(error.response.data);
    });
})

router.get('/text2speech', (req, res) => {
    if (!req.query.hasOwnProperty('text')) {
        return res.status(400).json();
    }
    
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    synthesizer.speakTextAsync(req.query.text, 
        function (result) {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                // Convert audio buffer into base64
                result.audio = Buffer.from(result.audioData).toString('base64');
                res.json(result)
            } else {
                console.error("Speech synthesis canceled, " + result.errorDetails + "\nDid you set the speech resource key and region values?");
            }
            synthesizer.close();
            synthesizer = null;
        },
        function (err) {
            console.trace("err - " + err);
            synthesizer.close();
            synthesizer = null;
        }
    );
})


// express-winston logger makes sense BEFORE the router
const defaultLogger = expressWinston.logger({
    transports: [
      new winston.transports.Console()
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    )
})

const errorLogger = expressWinston.errorLogger({
    transports: [
      new winston.transports.Console()
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    )
})

app.use(defaultLogger);
app.use(router);
app.use(errorLogger);

module.exports = app