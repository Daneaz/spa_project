import React from 'react';
import { Animated } from "react-animated-css";
import {
    Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid, Typography,
    InputLabel, FormControl, Select, Input, MenuItem,
} from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { fetchAPI, setToken, setUser, getClient } from '../../utils';
import Swal from 'sweetalert2';

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
        margin: theme.spacing(3),
        minWidth: 320,
    },
    cancel: {
        margin: theme.spacing(3),
        minWidth: 320,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing(3),
        minWidth: 700,
    },
    bold: {
        margin: theme.spacing(3),
        fontWeight: 500,
    },
});

class FacialLogin extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedServiceData: '',
            selectedService: '',
            selectedStaff: '',
            serviceList: [],
            staffList: [],
            client: '',
            takingPicture: true,
            timerOn: false,
            timerTime: 3000,
        }
        this.webcam = React.createRef();
        this.canvas = React.createRef();
    }

    componentDidMount() {
        faceapi.loadFaceDetectionModel(MODEL_URL)
            .then(() => faceapi.loadTinyFaceDetectorModel(MODEL_URL)
                .then(() => {
                    setTimeout(() => this.startDetection(), 1000);
                }));
        fetchAPI('GET', 'auth/services').then(serviceList => {
            this.setState({
                serviceList: serviceList,
                staffList: serviceList[0].staff
            });
        });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
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
            fetchAPI('GET', `auth/faciallogin/${response.data.name}`).then(respObj => {
                setToken(respObj.token);
                setUser(respObj.user);
                const photoTaking = document.getElementById('photoTaking')
                const packageChoosing = document.getElementById('packageChoosing')
                photoTaking.style.display = 'none';
                packageChoosing.style.display = 'block'
            })
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
                this.setState({ takingPicture: true });
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: 'Authendication fail!',
                    showCancelButton: true,
                    confirmButtonText: 'Re-try!',
                    cancelButtonText: 'No, cancel!',
                    reverseButtons: true,
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    }
                })
                // return setTimeout(() => this.startDetection(), 500);
            }
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
                this.faceAPIDetect(`${process.env.REACT_APP_FACE_API}/photos/${data.id}.png`);
            }
        } catch (error) {
            console.log(error);
        }
    };

    handleSelectStaffChange = (event) => {
        this.setState({ selectedStaff: event.target.value });
    };

    handleSelectServiceChange = (event, child) => {
        this.setState({ selectedStaff: '' });
        let index = child.props.id;
        this.setState({
            selectedServiceData: this.state.serviceList[index],
            selectedService: event.target.value,
            staffList: this.state.serviceList[index].staff
        });
    };

    submit() {
        let data = {}
        data.id = getClient()._id;
        data.price = this.state.selectedServiceData.price;
        fetchAPI('POST', 'auth/buyservice', data).then(respObj => {

            if (respObj.ok) {
                Swal.fire({
                    type: 'success',
                    title: respObj.ok,
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    },
                    preConfirm: () => {
                        return this.props.history.push('/start')
                    }
                })
            } else if (respObj.error) {
                Swal.fire({
                    type: 'error',
                    title: respObj.error,
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    },
                    preConfirm: () => {
                        return this.props.history.push('/start')
                    }
                })
            }
        });
    }

    render() {
        const { classes } = this.props;
        let displayText;
        if (this.state.timerOn) {
            displayText = `Identifying, please keep still`
        } else {
            displayText = `Face not detected, adjust your position...`
        }
        let serviceInfoDiv;
        if (this.state.selectedServiceData) {
            let service = this.state.selectedServiceData;
            serviceInfoDiv =
                <Animated key="serviceInfoDiv" animationIn="fadeIn" animationOut="fadeOut" >
                    <FormControl className={classes.formControl} fullWidth>
                        <InputLabel htmlFor="age-native-simple" style={{ fontSize: 40 }} >Staff Name</InputLabel>
                        <Select
                            style={{ fontSize: 40, height: 100 }}
                            value={this.state.selectedStaff}
                            onChange={this.handleSelectStaffChange}
                            input={<Input id="age-native-simple" style={{ fontSize: 40 }} />}
                        >
                            {this.state.staffList.map(staff => (
                                <MenuItem value={staff._id} style={{ fontSize: 40 }}>
                                    {staff.displayName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="h3" className={classes.bold}> Price: ${service.price}</Typography>
                    <Typography variant="h3" className={classes.bold}> Duration: {service.duration} mins</Typography>
                </Animated>

        }
        let confirmDiv;
        if (this.state.selectedStaff && this.state.selectedService) {
            confirmDiv = <Animated animationIn="fadeIn" animationOut="fadeOut" key="confirmDiv" >
                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                    style={{ fontSize: 40 }} onClick={() => this.submit()}
                >
                    Confirm
                </Button>
                <Button variant="contained" color="secondary" fullWidth className={classes.cancel}
                    onClick={() => { this.props.history.push('/start'); }} style={{ fontSize: 40 }}
                >
                    Cancel
                </Button>
            </Animated>
        }

        return (
            <div>
                <Animated animationIn="fadeIn" animationOut="fadeOut">
                    <Paper style={{ zIndex: -1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
                        <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <div id="photoTaking" ref="photoTaking" style={{ display: "block" }} >
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
                                    <Typography style={{ fontSize: 40, fontWeight: 500 }} align="center" color="primary" >
                                        {displayText}
                                    </Typography>
                                </div>
                            </div>
                            <div id="packageChoosing" ref="packageChoosing" style={{ display: "none" }}>
                                <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDelay={500} >
                                    <form >
                                        <Grid
                                            container
                                            direction="column"
                                            justify="center"
                                            alignItems="center"
                                        >
                                            <Grid item xs={12}>
                                                <FormControl className={classes.formControl} fullWidth >
                                                    <InputLabel htmlFor="age-native-simple" style={{ fontSize: 40 }}>Service Type</InputLabel>
                                                    <Select
                                                        style={{ fontSize: 40, height: 100 }}
                                                        value={this.state.selectedService}
                                                        onChange={this.handleSelectServiceChange}
                                                        input={<Input id="age-native-simple" style={{ fontSize: 40 }} />}
                                                    >
                                                        {this.state.serviceList.map((service, i) => (
                                                            <MenuItem id={i} value={service._id} style={{ fontSize: 40 }}>
                                                                {service.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {serviceInfoDiv}
                                            </Grid>
                                            <Grid item xs={12}>
                                                {confirmDiv}
                                            </Grid>
                                        </Grid>
                                    </form>
                                </Animated>
                            </div>
                        </div>
                    </Paper>
                </Animated>
            </div >
        );
    }
}

export default withStyles(styles)(FacialLogin);
