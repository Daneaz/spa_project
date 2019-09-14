import React from 'react';
import { Animated } from "react-animated-css";
import { Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid, Typography} from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
// import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
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
        this.webcam = React.createRef();
        this.canvasPicWebCam = React.createRef();
    }

    capture = () => {
        this.setState({ takingPicture: true })
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
        return (
            <Typography component="div"  >
                <h3>
                    Hello World, i'm Facial Login
      </h3>
            </Typography>
        );
    }

    // render() {
    //     const { classes } = this.props;
    //     let showCanvas, showWebcam, showRetake, showTake;
    //     if (this.state.takingPicture) {
    //         showWebcam = { display: 'none' }
    //         showCanvas = { display: 'block' }
    //         showRetake = { display: 'block', fontSize: 40 }
    //         showTake = { display: 'none', fontSize: 40 }
    //     } else {
    //         showWebcam = { display: 'block' }
    //         showCanvas = { display: 'none' }
    //         showRetake = { display: 'none', fontSize: 40 }
    //         showTake = { display: 'block', fontSize: 40 }
    //     }
    //     return (
    //         <div>
    //             <Animated animationIn="fadeIn" animationOut="fadeOut" >
    //                 <Paper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
    //                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    //                         <Webcam
    //                             style={showWebcam}
    //                             audio={false}
    //                             height={600}
    //                             ref={this.webcam}
    //                             screenshotFormat="image/jpeg"
    //                             width={800}
    //                             videoConstraints={videoConstraints}
    //                         />
    //                         <canvas ref={this.canvasPicWebCam} width={700} height={700} style={showCanvas} />
    //                         <Button variant="contained" color="primary" fullWidth className={classes.submit}
    //                             style={showTake} onClick={this.capture}
    //                         >
    //                             Take A Snapshot
    //                         </Button>
    //                         <Button variant="contained" color="primary" fullWidth className={classes.submit}
    //                             style={showRetake} onClick={() => this.setState({ takingPicture: false })}
    //                         >
    //                             Retake A Snapshot
    //                         </Button>

    //                     </div>
    //                 </Paper>
    //             </Animated>
    //         </div >
    //     );
    // }
}

export default withStyles(styles)(FacialLogin);
