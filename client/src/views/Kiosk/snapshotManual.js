import React from 'react';
import { Animated } from "react-animated-css";
import { Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import { faceAPIAddPerson } from './faceAPI';
import { fetchAPI, getClient, removeClient } from '../../utils';

const STORAGE_URL = 'https://projectspa.blob.core.windows.net/spacontainer';

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
            imageUrl: '',
            takingPicture: true,
        }
        this.webcam = React.createRef();
        this.canvasPicWebCam = React.createRef();
    }

    capture = () => {
        this.setState({ takingPicture: false })
        const imageUrl = this.webcam.current.getScreenshot();
        const ctx = this.canvasPicWebCam.current.getContext("2d");
        var image = new Image();

        image.onload = async () => {
            ctx.drawImage(image, 0, 0);
        };
        image.src = imageUrl;
        this.setState({ imageUrl: imageUrl })
    };

    createUser() {
        const user = getClient();
        fetchAPI('POST', 'kiosk/clients', user).then(respObj => {
            if (respObj && respObj.ok) {
                let data = {};
                data.imagebase64 = this.state.imageUrl;
                data.id = respObj.user._id;
                fetchAPI('POST', 'kiosk/savephoto', data).then(respObj => {
                    if (respObj && respObj.ok) {
                        faceAPIAddPerson(`${STORAGE_URL}/${data.id}.png`, data.id);
                        removeClient();
                        this.props.history.push('/start')
                    } else {
                        Swal.fire({
                            type: 'error', text: 'Please try again.',
                            title: respObj.error
                        })
                    }
                })
            } else {
                Swal.fire({
                    type: 'error', text: 'Please try again.',
                    title: respObj.error
                })
            }
        })
    }

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
                    style={{ display: 'block', fontSize: 40 }} onClick={() => {
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
                    style={{ display: 'block', fontSize: 40, paddingTop: 10 }} onClick={() => this.createUser()}
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
                                screenshotFormat="image/png"
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
