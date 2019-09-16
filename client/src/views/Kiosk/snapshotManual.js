import React from 'react';
import { Animated } from "react-animated-css";
import { Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import Webcam from 'react-webcam';
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
        margin: theme.spacing(5),
    },
});

class FacialLogin extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            takingPicture: true,
        }
        this.webcam = React.createRef();
        this.canvasPicWebCam = React.createRef();
    }

    capture = () => {
        this.setState({ takingPicture: false })
        const imageSrc = this.webcam.current.getScreenshot();
        const ctx = this.canvasPicWebCam.current.getContext("2d");
        var image = new Image();

        image.onload = async () => {
            ctx.drawImage(image, 0, 0);
        };
        image.src = imageSrc;
    };

    render() {
        const { classes } = this.props;
        let showCanvas, showWebcam, showRetake, showTake, button;
        if (this.state.takingPicture) {
            showWebcam = { display: 'block' }
            showCanvas = { display: 'none' }
        } else {
            showWebcam = { display: 'none' }
            showCanvas = { display: 'block' }
        }

        if (this.state.takingPicture) {
            button = [
                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                    style={{ display: 'block', fontSize: 40}} onClick={() => {
                        this.setState({ takingPicture: false })
                        // this.capture();
                        this.props.history.push('/snapshot');
                    }}
                >
                    Auto Mode
                </Button>,
                <Button variant="contained" color="primary" fullWidth
                    style={{ display: 'block', fontSize: 40 }} onClick={this.capture}
                >
                    Take A Snapshot
            </Button>
            ]

        } else {
            button = [
                <Button key="btnRetake" variant="contained" color="primary" fullWidth className={classes.submit}
                    style={{ display: 'block', fontSize: 40, paddingTop: 10 }} onClick={() => this.setState({ takingPicture: true })}
                >
                    Retake A Snapshot
                </Button>,
                <Button key="btnDone" variant="contained" color="primary" fullWidth
                    style={{ display: 'block', fontSize: 40, paddingTop: 10 }} onClick={() => this.props.history.push('/start')}
                >
                    Done
                </Button>
            ]
        }
        return (
            <div>
                <Animated animationIn="fadeIn" animationOut="fadeOut" >
                    <Paper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Webcam
                                style={showWebcam}
                                audio={false}
                                height={600}
                                ref={this.webcam}
                                screenshotFormat="image/jpeg"
                                width={800}
                                videoConstraints={videoConstraints}
                            />
                            <canvas ref={this.canvasPicWebCam} width={800} height={600} style={showCanvas} />
                            {button}
                        </div>
                    </Paper>
                </Animated>
            </div >
        );
    }
}

export default withStyles(styles)(FacialLogin);
