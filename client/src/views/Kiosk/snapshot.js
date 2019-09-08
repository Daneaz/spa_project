import React from 'react';
import { Animated } from "react-animated-css";
import { Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid, Container } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import zIndex from '@material-ui/core/styles/zIndex';
const MODEL_URL = '/models'

const videoConstraints = {
    width: 800,
    height: 600,
    facingMode: 'user',
};

const BackGroundImage = '/static/images/Gerberas_Stones_Spa.jpg';

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
            takingPicture: false,
        }
        // this.webcam = React.createRef();
        this.canvasPicWebCam = React.createRef();
    }

    async run() {
        // to the video element
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
        const video = document.getElementById('webcam')
        video.srcObject = stream
    }

    async componentDidMount() {
        await this.loadModels();
    }

    loadModels() {
        faceapi.loadFaceDetectionModel(MODEL_URL)
            .then(() => faceapi.loadTinyFaceDetectorModel(MODEL_URL)
                .then(() => {
                    this.startDetection();
                    this.run();
                }));
        // await faceapi.loadFaceLandmarkModel(MODEL_URL)
        // await faceapi.loadFaceRecognitionModel(MODEL_URL)
    }

    startDetection = async () => {
        try {
            const video = document.getElementById('webcam')
            const videoOverlay = document.getElementById('videoOverlay')
            let inputSize = 512
            let scoreThreshold = 0.5
            const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold }));
            if (result) {
                console.log("Result:  " + result);
                videoOverlay.width = video.width;
                videoOverlay.height = video.height;
                videoOverlay.style.display = "";
                // const detectionsForSize = faceapi.resizeResults(result, { width: video.width, height: video.height })
                // faceapi.draw.drawDetections(videoOverlay, detectionsForSize, { withScore: false, boxColor: '#28a745' });
                const dims = faceapi.matchDimensions(videoOverlay, video, true)
                faceapi.draw.drawDetections(videoOverlay, faceapi.resizeResults(result, dims))
                return setTimeout(() => this.startDetection(), 500);
            } else {
                console.log("not detected")
                return setTimeout(() => this.startDetection(), 500);
            }
        } catch (e) {
            console.log(e);
            return setTimeout(() => this.startDetection(), 500);
        }
    }

    async onPlay() {
        const videoEl = document.getElementById('webcam')

        if (videoEl.paused || videoEl.ended)
            return setTimeout(() => this.onPlay())


        const result = await faceapi.detectSingleFace(videoEl)

        if (result) {
            const canvas = document.getElementById('videoOverlay')
            const dims = faceapi.matchDimensions(canvas, videoEl, true)
            faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
        }

        setTimeout(() => this.onPlay())
    }

    // capture = () => {
    //     this.setState({ takingPicture: true })
    //     const imageSrc = this.webcam.current.getScreenshot();
    //     const ctx = this.canvasPicWebCam.current.getContext("2d");
    //     var image = new Image();

    //     image.onload = async () => {
    //         ctx.drawImage(image, 0, 0);
    //     };
    //     image.src = imageSrc;
    // };

    render() {
        const { classes } = this.props;
        let showCanvas, showWebcam, showRetake, showTake;
        if (this.state.takingPicture) {
            showWebcam = { display: 'none' }
            showCanvas = { display: 'block' }
            showRetake = { display: 'block', fontSize: 40 }
            showTake = { display: 'none', fontSize: 40 }
        } else {
            showWebcam = { display: 'block' }
            showCanvas = { display: 'none' }
            showRetake = { display: 'none', fontSize: 40 }
            showTake = { display: 'block', fontSize: 40 }
        }
        return (
            <div>
                <Animated animationIn="fadeIn" animationOut="fadeOut" >
                    <Paper style={{ zIndex: -1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
                        <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                            {/* <Webcam
                                id="webcam"
                                style={showWebcam}
                                audio={false}
                                height={600}
                                ref={this.webcam}
                                screenshotFormat="image/jpeg"
                                width={800}
                                videoConstraints={videoConstraints}
                            /> */}
                            <div style={{ height: 600, width: 800 }}>
                                <video id="webcam" onLoadedMetadata={this.startDetection} autoPlay muted playsInline style={{ height: 600, width: 800, position: 'absolute', zIndex: 1 }} />
                                <canvas id='videoOverlay' style={{ height: 600, width: 800, position: 'relative', zIndex: 2 }} />
                            </div>
                            <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                style={showTake} onClick={this.capture}
                            >
                                Manual Mode
                            </Button>
                            <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                style={showRetake} onClick={() => this.setState({ takingPicture: false })}
                            >
                                Retake A Snapshot
                            </Button>

                        </div>
                    </Paper>
                </Animated>
            </div >

            // <Container>
            //     <video id="webcam" onLoadedMetadata={this.startDetection} autoPlay muted playsInline style={{ position: 'absolute', zIndex: -1 }} />
            //     <canvas id='videoOverlay' style={{ position: 'absolute', zIndex: 2 }} />
            // </Container>
        );
    }
}

export default withStyles(styles)(FacialLogin);
