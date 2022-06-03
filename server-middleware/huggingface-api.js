const express = require('express')
const axios = require('axios')
const app = express()
var expressWinston = require('express-winston');
var winston = require('winston'); // for transports.Console

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