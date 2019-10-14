import React from 'react';
import { withStyles } from '@material-ui/styles';
import { Animated } from "react-animated-css";
import {
    Button, Grid, Typography,
    InputLabel, FormControl, Select, Input, MenuItem, Container, Dialog, DialogContent, Slide, TextField,
} from '@material-ui/core';
import Swal from 'sweetalert2';
import Keyboard from "react-simple-keyboard";
import KioskLayout from './Component/KioskLayout';
import { fetchAPI, setClient, setToken, getClient } from '../../utils';
// import SelectService from './Component/SelectService';
const mainFontSize = 35;

const styles = theme => ({
    root: {
        height: 180,
    },
    submit: {
        margin: theme.spacing(3),
        minWidth: 220,
    },
    cancel: {
        margin: theme.spacing(3),
        minWidth: 220,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing(3),
        minWidth: 500,
    },
    bold: {
        margin: theme.spacing(3),
        fontWeight: 500,
    },
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class MobileLogin extends React.Component {
    state = {
        layoutName: "default",
        input: {},
        inputName: "mobile",
        submittedData: "",
        keyboardOpen: false,
        selectedServiceData: '',
        selectedService: '',
        selectedStaff: '',
        serviceList: [],
        staffList: [],
        client: '',
        displayName: '',
    };

    componentDidMount() {
        fetchAPI('GET', 'kiosk/services').then(serviceList => {
            this.setState({
                serviceList: serviceList,
                staffList: serviceList[0].staff
            });
        }).catch(error => {
            console.log(error);
        })
    }

    handleSelectStaffChange = (event) => {
        this.setState({ selectedStaff: event.target.value });
    };

    handleSelectServiceChange = (event, child) => {
        this.setState({ selectedStaff: '' });
        let index = child.props.id;

        fetchAPI('POST', 'kiosk/availablestaff', this.state.serviceList[index]).then(staffAvailable => {
            if (staffAvailable.length === 0) {
                staffAvailable= [
                    {   
                        displayName: "No Staff Available"
                    }
                ]
            }
            this.setState({
                selectedServiceData: this.state.serviceList[index],
                selectedService: event.target.value,
                staffList: staffAvailable
            });
        });
    };

    onChangeAll = inputObj => {
        this.setState({
            input: inputObj
        });
    };

    onKeyPress = button => {
        if (button === "{enter}") {
            this.setState({
                keyboardOpen: false
            });
        } else if (button === "{clear}") {
            this.clearScreen();
        }
    };

    onChangeInput = event => {
        let inputVal = event.target.value;

        let updatedInputObj = {
            ...this.state.input,
            [this.state.inputName]: inputVal
        };

        this.setState(
            {
                input: updatedInputObj
            },
            () => {
                this.keyboard.setInput(inputVal);
            }
        );
    };

    setActiveInput = () => {
        this.setState(
            {
                keyboardOpen: true
            },
        );
    };

    handleKeyboardClose = () => {
        this.setState({ keyboardOpen: false });
    }

    submit() {
        let client = getClient()
        let data = {}
        data.id = client._id;
        data.price = this.state.selectedServiceData.price;
        fetchAPI('POST', 'kiosk/buyservice', data).then(service => {
            if (service.ok) {
                let start = new Date();
                let end = new Date(start.getTime() + parseInt(this.state.selectedServiceData.duration) * 60000)
                let values = {
                    serviceName: `${this.state.selectedServiceData.name} ${client.displayName}`,
                    start: start,
                    end: end,
                    staff: this.state.selectedStaff,
                }
                fetchAPI('POST', 'kiosk/bookings', values).then(respObj => {
                    if (respObj && respObj.ok) {
                        Swal.fire({
                            type: 'success',
                            title: service.ok,
                            animation: false,
                            customClass: {
                                popup: 'animated tada'
                            },
                            preConfirm: () => {
                                return this.props.history.push('/start')
                            }
                        })
                    } else {
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
                })
            } else if (service.error) {
                Swal.fire({
                    type: 'error',
                    title: service.error,
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    },
                    preConfirm: () => {
                        return this.props.history.push('/start')
                    }
                })
            }
        }).catch(error => {
            console.log(error)
        });
    }

    login = async () => {
        const { input } = this.state;

        if (!input.mobile) {
            Swal.fire({
                type: 'error', text: 'Mobile must be 8 digit',
                title: "Error"
            })
            return;
        }
        try {
            fetchAPI('GET', `kiosk/mobilelogin/${input.mobile}`).then(respObj => {
                if (respObj && respObj.ok) {
                    setToken(respObj.token);
                    setClient(respObj.user);
                    this.setState({ displayName: respObj.user.displayName })
                    const login = document.getElementById('login')
                    const packageChoosing = document.getElementById('packageChoosing')
                    login.style.display = 'none';
                    packageChoosing.style.display = 'block'

                } else {
                    Swal.fire({
                        type: 'error', text: 'Please try again.',
                        title: respObj.error
                    })
                }
            })
        } catch (err) {
            Swal.fire({
                type: 'error', text: 'Please try again.',
                title: err.message
            })
        }
    };

    render() {
        const { classes } = this.props;
        const { input } = this.state;

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
            <KioskLayout {...this.props} imageWidth={200} imagePadding={10} displayName={this.state.displayName}>

                <div style={{ flexDirection: 'column', alignItems: 'center', display: 'flex' }} >
                    <div id="login" ref="login" style={{ display: "block" }} >
                        <Typography style={{ fontSize: 50, }} color="primary">
                            Login
                            </Typography>
                        <form style={{ flexDirection: 'column', alignItems: 'center', display: 'flex', minWidth: 600 }}>
                            <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                                InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                variant="outlined" margin="normal" fullWidth
                                name="mobile" label="Mobile" type="number"
                                onClick={this.setActiveInput}
                                value={input["mobile"] || ""}
                                onChange={e => this.onChangeInput(e)}
                            />
                            <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                style={{ fontSize: mainFontSize }} onClick={this.login}
                            >
                                Login
                        </Button>
                        </form>
                    </div>
                    <div id="packageChoosing" ref="packageChoosing" style={{ display: "none", paddingTop: 100 }}>
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
                <Dialog
                    fullWidth
                    maxWidth="xl"
                    style={{ fontSize: mainFontSize }}
                    open={this.state.keyboardOpen}
                    onEnter={() => {
                        //clear the display value when open
                        var value = this.refs.displayValue;
                        value.children[0].children[0].value = '';
                    }}
                    onClose={this.handleKeyboardClose}
                    TransitionComponent={Transition}
                    keepMounted
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent>
                        <div>
                            <TextField InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                ref="displayValue" value={input[this.state.inputName]} placeholder={"Tap to start"} onChange={e => this.onChangeAll(e)} />
                            <Keyboard
                                keyboardRef={r => (this.keyboard = r)}
                                inputName={this.state.inputName}
                                layoutName={this.state.layoutName}
                                onChangeAll={inputObj => this.onChangeAll(inputObj)}
                                onKeyPress={button => this.onKeyPress(button)}
                                theme={"hg-theme-default hg-layout-default myTheme"}
                                layout={{
                                    default: ["1 2 3", "4 5 6", "7 8 9", "{bksp} 0 {enter}"],
                                }}
                                display={{
                                    '{bksp}': 'Bksp',
                                    '{enter}': 'Enter',
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </KioskLayout>
        );
    }
}

export default withStyles(styles)(MobileLogin);
