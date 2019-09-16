import React from 'react';
import { Animated } from "react-animated-css";
import { Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { fetchAPI, getLocalStorage } from '../../utils';

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
        margin: theme.spacing(5),
    },
});

class Snapshot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            takingPicture: true,
            timerOn: false,
            timerTime: 3000,
        }
        this.webcam = React.createRef();
        this.canvas = React.createRef();
        this.canvasPicWebCam = React.createRef();
    }

    startTimer = () => {
        console.log("Start timer")
        this.setState({
            timerOn: true,
            timerTime: this.state.timerTime,
        });
        this.timer = setInterval(() => {
            console.log("in interval")
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
        console.log("stopTimer")
        clearInterval(this.timer);
        this.setState({ timerOn: false, timerTime: 3000 });
    };

    componentDidMount() {
        faceapi.loadFaceDetectionModel(MODEL_URL)
            .then(() => faceapi.loadTinyFaceDetectorModel(MODEL_URL)
                .then(() => {
                    setTimeout(() => this.startDetection(), 1000);
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

    faceAPITrainStatus() {
        const fullUrl = `${uriBase}/persongroups/1/training`
        const options = {
            method: 'GET',
            url: fullUrl,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };

        axios(options).then(response => {
            console.log(response.data);
        }).catch(error => {
            console.log('Error: ', error);
        });
    }

    faceAPITrain() {
        const fullUrl = `${uriBase}/persongroups/1/train`
        const options = {
            method: 'POST',
            url: fullUrl,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };

        axios(options).then(response => {
            console.log(response.data);
        }).catch(error => {
            console.log('Error: ', error);
        });
    }

    faceAPIAddFace(personId, imageUrl) {
        const fullUrl = `${uriBase}/persongroups/1/persons/${personId}/persistedFaces`
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
            // response.data;
            this.faceAPITrain();
            console.log(response.data);
        }).catch(error => {
            console.log('Error: ', error);
        });
    }

    faceAPIAddPerson(imageUrl) {
        const userid = getLocalStorage("userid");
        const fullUrl = `${uriBase}/persongroups/1/persons`
        const options = {
            method: 'POST',
            url: fullUrl,
            data: { name: userid },
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };

        axios(options).then(response => {
            this.faceAPIAddFace(response.data.personId, imageUrl)
            console.log(response.data.personId);
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
            console.log(response);
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
                        console.log(timerTime)
                        console.log("Result:  " + result);
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
                        console.log("not detected")
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
            const userid = getLocalStorage("userid");
            console.log("capture")
            this.setState({ takingPicture: false })
            const taking = document.getElementById('photoTaking')
            const showing = document.getElementById('photoShowing')
            taking.style.display = 'none';
            showing.style.display = 'block';
            var photoCanvas = document.getElementById('showPhoto')
            var photoctx = photoCanvas.getContext("2d");
            var img = new Image();
            img.onload = async () => {
                photoctx.drawImage(img, 0, 0, photoCanvas.width, photoCanvas.height);
            };
            img.src = imageUrl;
            let data = {};
            data.imagebase64 = imageUrl;
            data.id = userid;
            const respObj = await fetchAPI('POST', 'auth/savephoto', data);
            if (respObj && respObj.ok) {
                this.faceAPIAddPerson(`${process.env.REACT_APP_FACE_API}/photos/${data.id}.png`);
            }
        } catch (error) {
            console.log(error);
        }
    };

    retakePhoto() {
        console.log("retake")
        this.setState({ takingPicture: true });
        const taking = document.getElementById('photoTaking')
        const showing = document.getElementById('photoShowing')
        taking.style.display = 'block';
        showing.style.display = 'none'
        this.startDetection();
    }

    render() {
        const { classes } = this.props;
        let displayText, button;
        if (this.state.timerOn) {
            displayText = `Keep still photo will be taken in ${this.state.timerTime / 1000}`
        } else {
            displayText = `Face not detected, adjust your position...`
        }
        if (this.state.takingPicture) {
            button = (<Button variant="contained" color="primary" fullWidth className={classes.submit}
                style={{ display: 'block', fontSize: 40 }} onClick={() => {
                    this.setState({ takingPicture: false })
                    // this.capture();
                    this.props.history.push('/snapshotmanual');
                }}
            >
                Manual Mode
                </Button>);
        } else {
            button = [
                <Button key="btnRetake" variant="contained" color="primary" fullWidth className={classes.submit}
                    style={{ display: 'block', fontSize: 40 }} onClick={() => this.retakePhoto()}
                >
                    Retake A Snapshot
                </Button>,
                <Button key="btnDone" variant="contained" color="primary" fullWidth
                    style={{ display: 'block', fontSize: 40 }} onClick={() => this.props.history.push('/start')}
                >
                    Done
                </Button>
            ]
        }

        return (
            <div>
                <Animated animationIn="fadeIn" animationOut="fadeOut" >
                    <Paper style={{ zIndex: -1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
                        <div style={{ flexDirection: 'column', alignItems: 'center', display: 'flex' }}>
                            <div id="photoTaking" >
                                <div style={{ height: 600, width: 800, alignItems: 'center' }}>
                                    {/* <video id="webcam" onLoadedMetadata={this.startDetection} autoPlay muted playsInline style={{ height: 600, width: 800, position: 'absolute', zIndex: 1 }} /> */}
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
                            <div id="photoShowing" style={{ display: "none" }}>
                                <canvas id='showPhoto' style={{ height: 600, width: 800 }} />
                            </div>
                            {button}
                        </div>
                    </Paper>
                </Animated>
            </div >
        );
    }
}

export default withStyles(styles)(Snapshot);
