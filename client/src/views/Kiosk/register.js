import React from 'react';
import Select from 'react-select';
import { Animated } from "react-animated-css";
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, CssBaseline, Container, LinearProgress, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Slide, TextField
} from '@material-ui/core';

import { Formik, Field, Form } from 'formik';
import { fetchAPI, setLocalStorage } from '../../utils';
import Swal from 'sweetalert2';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const mainFontSize = 35;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const BackGroundImage = '/static/images/Gerberas_Stones_Spa.jpg';

const styles = theme => ({
    container: {
        marginTop: theme.spacing(5)
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    cancel: {
        margin: theme.spacing(0, 0, 0),
    },
    select: {
        margin: theme.spacing(2, 0, 0),
    },
});

const genderOptions = [
    { value: "M", label: 'M' },
    { value: "F", label: 'F' },
];

class Register extends React.Component {
    state = {
        layoutName: "default",
        inputName: "mobile",
        input: {},
        submittedData: "",
        gender: genderOptions[0],
        keyboardOpen: false,
    };

    handleGenderSelection = (gender) => {
        this.setState({ gender });
    }

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
        } else if (button === "{shift}") {
            this.handleShift();
        }
    };

    handleShift = () => {
        let layoutName = this.state.layoutName;

        this.setState({
            layoutName: layoutName === "default" ? "shift" : "default"
        });
    };

    clearScreen = () => {
        let input = { ...this.state.input };
        let inputName = this.state.inputName;
        input[inputName] = "";

        this.setState({ input }, () => {
            this.keyboard.clearInput(inputName);
        });
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

    setActiveInput = inputName => {
        if (inputName === 'mobile') {
            this.setState({ layoutName: "mobile" })
        } else {
            this.setState({ layoutName: "default" })
        }
        var value = this.refs.displayValue;
        if (inputName === 'password' || inputName === 'confirmPassoword') {
            value.children[0].children[0].type = 'password';
        } else {
            value.children[0].children[0].type = 'text';
        }
        this.setState(
            {
                inputName: inputName,
                keyboardOpen: true
            },
        );
    };

    closeKeyboard = () => {
        this.setState({
            keyboardOpen: false
        });
    };

    handleKeyboardClose = () => {
        this.setState({ keyboardOpen: false });
    }

    submit = async () => {
        const { history } = this.props;
        const { input, gender } = this.state;
        input.gender = gender.value;

        if (!input.mobile) {
            Swal.fire({
                type: 'error', text: 'Mobile must be 8 digit',
                title: "Error"
            })
            return;
        }
        else if (!input.password) {
            Swal.fire({
                type: 'error', text: 'Please enter a password',
                title: "Error"
            })
            return;
        }
        else if (!input.confirmPassoword) {
            Swal.fire({
                type: 'error', text: 'Please enter a password',
                title: "Error"
            })
            return;
        }
        else if (input.confirmPassoword !== input.password) {
            Swal.fire({
                type: 'error', text: 'Password does not match',
                title: "Error"
            })
            return;
        }
        else if (!input.displayName) {
            Swal.fire({
                type: 'error', text: 'Please enter display name',
                title: "Error"
            })
            return;
        }
        else if (!input.email) {
            Swal.fire({
                type: 'error', text: 'Please enter email',
                title: "Error"
            })
            return;
        }
        else if (!input.nric) {
            Swal.fire({
                type: 'error', text: 'Please enter NRIC',
                title: "Error"
            })
            return;
        }

        try {
            const respObj = await fetchAPI('POST', 'auth/clients', this.state.input);

            if (respObj && respObj.ok) {
                setLocalStorage("userid", respObj.user._id);
                history.push('/snapshot');
            } else { throw new Error('Register failed') }
        } catch (err) {
            Swal.fire({
                type: 'error', text: 'Please try again.',
                title: err.message
            })
        }
    };

    render() {
        const { classes } = this.props;
        const { input, keyboardOpen } = this.state;
        return (
            <div>
                <Animated animationIn="fadeIn" animationOut="fadeOut" isVisible={true}>
                    <CssBaseline />
                    <Paper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
                        <Container component="main" maxWidth="md" className={classes.container} >
                            <Typography style={{ fontSize: 50, }} color="primary">
                                New Client Onboard
                            </Typography>
                            <form>
                                <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                                    InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                    variant="outlined" margin="normal" fullWidth
                                    name="mobile" label="Mobile" type="number"
                                    onClick={() => this.setActiveInput("mobile")}
                                    value={input["mobile"] || ""}
                                    onChange={e => this.onChangeInput(e)}
                                />
                                <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                                    InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                    variant="outlined" margin="normal" fullWidth
                                    name="password" label="Password" type="password"
                                    onClick={() => this.setActiveInput("password")}
                                    value={input["password"] || ""}
                                    onChange={e => this.onChangeInput(e)}
                                />
                                <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                                    InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                    variant="outlined" margin="normal" fullWidth
                                    name="confirmPassoword" label="Confirm Password" type="password"
                                    onClick={() => this.setActiveInput("confirmPassoword")}
                                    value={input["confirmPassoword"] || ""}
                                    onChange={e => this.onChangeInput(e)}
                                />
                                <TextField style={{ backgroundColor: "#f2f1ed", fontSize: "30px" }} autoComplete='off'
                                    InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                    variant="outlined" margin="normal" fullWidth
                                    name="displayName" label="Display Name"
                                    onClick={() => this.setActiveInput("displayName")}
                                    value={input["displayName"] || ""}
                                    onChange={e => this.onChangeInput(e)}
                                />
                                <TextField style={{ backgroundColor: "#f2f1ed", fontSize: "30px" }} autoComplete='off'
                                    InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                    variant="outlined" margin="normal" fullWidth
                                    name="email" label="Email"
                                    onClick={() => this.setActiveInput("email")}
                                    value={input["email"] || ""}
                                    onChange={e => this.onChangeInput(e)}
                                />
                                <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                                    InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                                    variant="outlined" margin="normal" fullWidth
                                    name="nric" label="NRIC"
                                    onClick={() => this.setActiveInput("nric")}
                                    value={input["nric"] || ""}
                                    onChange={e => this.onChangeInput(e)}
                                />
                                <Typography variant='h3' color='primary' gutterBottom>
                                    Gender
                                </Typography>
                                <Select className={classes.select}
                                    onChange={this.handleGenderSelection}
                                    options={genderOptions}
                                    value={this.state.gender}
                                    styles={{
                                        control: base => ({
                                            ...base,
                                            fontSize: mainFontSize,
                                        }),
                                        menu: base => ({
                                            ...base,
                                            fontSize: mainFontSize,
                                        })
                                    }}
                                />

                                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                    style={{ fontSize: mainFontSize }} onClick={this.submit}
                                >
                                    Register
                                </Button>
                                <Button variant="contained" color="secondary" fullWidth className={classes.cancel}
                                    onClick={() => { window.history.back(); }} style={{ fontSize: mainFontSize }}
                                >
                                    Cancel
                                </Button>
                            </form>
                            )}
                        </Container>
                    </Paper>
                </Animated>
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
                                    'default': [
                                        '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
                                        'q w e r t y u i o p [ ] \\',
                                        'a s d f g h j k l ; \' {enter}',
                                        'z x c v b n m , . / {shift}',
                                        '.com @ {space}'
                                    ],
                                    'shift': [
                                        '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
                                        'Q W E R T Y U I O P { } |',
                                        'A S D F G H J K L : " {enter}',
                                        'Z X C V B N M < > ? {shift}',
                                        '{space}'
                                    ],
                                    mobile: ["1 2 3", "4 5 6", "7 8 9", "{bksp} 0 {enter}"],
                                }}
                                display={{
                                    '{bksp}': 'Bksp',
                                    '{enter}': 'Enter',
                                    '{shift}': 'Shift',
                                    '{space}': ' '
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(Register);