import React from 'react';
import { Animated } from "react-animated-css";
import { Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { fetchAPI } from '../../utils';

const axios = require('axios');
const uriBase = 'https://spa-fr.cognitiveservices.azure.com/face/v1.0';
const subscriptionKey = '5463be0170e742d98bf5b3606727fbdb';
const MODEL_URL = '/models'

let faceBox = { detected: false, topLeftX: 0, topLeftY: 0, bottomRightX: 0, bottomRightY: 0 };
const BackGroundImage = '/static/images/Gerberas_Stones_Spa.jpg';

const videoConstraints = {
    width: 800,
    height: 600,
    facingMode: 'user',
};

const styles = theme => ({
    root: {
        height: 180,
    },
    submit: {
        margin: theme.spacing(5, 0, 0),
    },
});

class FacialLogin extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            client: '',
            takingPicture: true,
            timerOn: false,
            timerTime: 3000,
        }
        this.webcam = React.createRef();
        this.canvas = React.createRef();
        this.packageChoosing = React.createRef();
        this.photoTaking = React.createRef();
    }

    startTimer = () => {
        this.setState({
            timerOn: true,
            timerTime: this.state.timerTime,
        });
        this.timer = setInterval(() => {
            const newTime = this.state.timerTime - 1000;
            if (newTime >= 0) {
                this.setState({
                    timerTime: newTime
                });
            } else {
                clearInterval(this.timer);
                this.setState({ timerOn: false });
            }
        }, 1000);
    };

    stopTimer = () => {
        clearInterval(this.timer);
        this.setState({ timerOn: false, timerTime: 3000 });
    };

    componentDidMount() {
        faceapi.loadFaceDetectionModel(MODEL_URL)
            .then(() => faceapi.loadTinyFaceDetectorModel(MODEL_URL)
                .then(() => {
                    this.startDetection();
                }));
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    getTL(v) {
        v -= 70;
        return ((v <= 0) ? 0 : v);
    }
    getBR(v, x) {
        v += 70;
        if (x) { return ((v > 640) ? 640 : v) }
        else { return ((v > 480) ? 480 : v) }
    }

    faceAPIGetPersonId(personId) {
        const fullUrl = `${uriBase}/persongroups/1/persons/${personId}`

        const options = {
            method: 'GET',
            url: fullUrl,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };
        axios(options).then(response => {
            fetchAPI('GET', `auth/clients/${response.data.name}`).then(client => {
                this.setState({ client: client })
                this.photoTaking.style.display = 'none';
                this.packageChoosing.style.display = 'block'
            })
            console.log(response.data.name);
        }).catch(error => {
            console.log('Error: ', error);
        });
    }

    faceAPIIdentify(faceIdData) {
        let faceIds = [];
        for (let i = 0; i < faceIdData.length; i++) {
            faceIds.push(faceIdData[i].faceId)
        }
        const fullUrl = `${uriBase}/identify`

        const options = {
            method: 'POST',
            url: fullUrl,
            data: {
                personGroupId: "1",
                faceIds: faceIds,
                maxNumOfCandidatesReturned: 1,
            },
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };
        axios(options).then(response => {
            if (response.error) {
                alert("Authentication Fail");
                this.setState({ takingPicture: true });
                return setTimeout(() => this.startDetection(), 500);
            }
            console.log(response.data[0].candidates[0].personId);
            this.faceAPIGetPersonId(response.data[0].candidates[0].personId);
        }).catch(error => {
            console.log('Error: ', error);
        });

    }

    faceAPIDetect(imageUrl) {
        const fullUrl = `${uriBase}/detect?returnFaceId=true`
        const options = {
            method: 'POST',
            url: fullUrl,
            data: { url: imageUrl },
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };

        axios(options).then(response => {
            console.log(response.data);
            this.faceAPIIdentify(response.data);
        }).catch(error => {
            console.log('Error: ', error);
        });
    }

    startDetection = () => {
        try {
            const { timerTime, timerOn } = this.state;
            const canvas = document.getElementById('videoOverlay')
            let video = this.webcam.current;
            if (video && canvas && video.getCanvas()) {
                video = video.getCanvas();
                let inputSize = 512
                let scoreThreshold = 0.5
                faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })).then((result) => {
                    if (result) {
                        if (!timerOn) {
                            this.setState({ timerTime: 3000 });
                            this.startTimer();
                        }
                        canvas.width = video.width;
                        canvas.height = video.height;
                        canvas.style.display = "";
                        const dims = faceapi.matchDimensions(canvas, video, true)
                        faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
                        if (timerTime <= 0 && timerOn) {
                            if (result.box) {
                                let box = result.box;
                                faceBox.detected = true;
                                faceBox.topLeftX = this.getTL(box.x);
                                faceBox.topLeftY = this.getTL(box.y);
                                faceBox.bottomRightX = this.getBR((box.x + box.width), true);
                                faceBox.bottomRightY = this.getBR((box.y + box.height), false);
                            }
                            canvas.getContext('2d').drawImage(video, 0, 0);
                            this.capture(canvas.toDataURL())
                            return;
                        }
                        return setTimeout(() => this.startDetection(), 300);
                    } else {
                        this.stopTimer();
                        canvas.style.display = "none"
                        return setTimeout(() => this.startDetection(), 300);
                    }
                });
            }
        } catch (error) {
            console.log(error)

        }
    }

    capture = async (imageUrl) => {
        try {
            let data = {};
            data.imagebase64 = imageUrl;
            data.id = "auth";
            const respObj = await fetchAPI('POST', 'auth/savephoto', data);
            if (respObj && respObj.ok) {
                this.faceAPIDetect(`${"http://180.129.28.114:3000"}/photos/${data.id}.png`);
            }
        } catch (error) {
            console.log(error);
        }
    };

    render() {
        const { classes } = this.props;
        let displayText, button;
        if (this.state.timerOn) {
            displayText = `Identifying, please keep still`
        } else {
            displayText = `Face not detected, adjust your position...`
        }

        return (
            <div>
                <Animated animationIn="fadeIn" animationOut="fadeOut" >
                    <Paper style={{ zIndex: -1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
                        <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <div ref="photoTaking" style={{ display: "block" }} >
                                <div style={{ height: 600, width: 800, alignItems: 'center' }}>
                                    <Webcam
                                        style={{ position: 'absolute', zIndex: 1 }}
                                        audio={false}
                                        height={600}
                                        ref={this.webcam}
                                        screenshotFormat="image/jpeg"
                                        width={800}
                                        videoConstraints={videoConstraints}
                                    />
                                    <canvas id='videoOverlay' ref={this.canvas} style={{ height: 600, width: 800, position: 'relative', zIndex: 2 }} />
                                </div>
                                <div>
                                    <Typography style={{ fontSize: 40 }} align="center" color="primary" >
                                        {displayText}
                                    </Typography>
                                </div>
                            </div>
                            <div ref="packageChoosing" style={{ display: "none" }}>
                                <h1>test</h1>
                            </div>
                        </div>
                    </Paper>
                </Animated>
            </div >
        );
    }
}

export default withStyles(styles)(FacialLogin);
