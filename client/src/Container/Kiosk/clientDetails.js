import React from 'react';
import Select from 'react-select';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, Container, Dialog, DialogContent, Slide, TextField
} from '@material-ui/core';
import KioskLayout from '../../Component/Kiosk/KioskLayout/KioskLayout';
import { fetchAPI, getClient } from '../../utils';
import Swal from 'sweetalert2';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import DateFnsUtils from '@date-io/date-fns';
import { green } from '@material-ui/core/colors';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
const mainFontSize = 35;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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

class ClientDetails extends React.Component {
    state = {
        layoutName: "default",
        inputName: null,
        input: {},
        submittedData: "",
        gender: genderOptions[0],
        keyboardOpen: false,
        selectedDate: null,
        edit: true
    };

    componentDidMount() {
        try {
            let client = getClient();
            this.setState({
                input: client,
                displayName: client.displayName,
                gender: { value: client.gender, label: client.gender },
                selectedDate: client.birthday
            })
        } catch (error) {
            Swal.fire({
                type: 'error',
                title: "Opps... Something Wrong...",
                text: error
            })
        }
    }

    handleGenderSelection = (gender) => {
        this.setState({ gender });
    }

    onChangeInput = event => {
        let inputVal = event.target.value;

        let updatedInputObj = {
            ...this.state.input,
            [this.state.inputName]: inputVal
        }

        this.setState(
            {
                input: updatedInputObj
            },
            () => {
                this.keyboard.setInput(inputVal);
            }
        );
    };

    onChangeAll = inputObj => {
        let input = { ...this.state.input, ...inputObj }
        this.setState({
            input: input
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

    setActiveInput = inputName => {
        if (inputName === 'mobile') {
            this.setState({ layoutName: "mobile" })
        } else {
            this.setState({ layoutName: "default" })
        }
        var value = this.refs.displayValue;
        // Disable password for register
        // if (inputName === 'password' || inputName === 'confirmPassoword') {
        //     value.children[0].children[0].type = 'password';
        // } else {
        value.children[0].children[0].type = 'text';
        // }
        this.setState(
            {
                inputName: inputName,
                keyboardOpen: true
            },
        );
    };

    handleKeyboardClose = () => {
        this.setState({ keyboardOpen: false });
    }

    update = async () => {
        const { input, gender } = this.state;
        input.gender = gender.value;

        if (!input.mobile) {
            Swal.fire({
                type: 'error', text: 'Mobile must be 8 digit',
                title: "Error"
            })
            return;
        }
        // Disable password for register
        // else if (!input.password) {
        //     Swal.fire({
        //         type: 'error', text: 'Please enter a password',
        //         title: "Error"
        //     })
        //     return;
        // }
        // else if (!input.confirmPassoword) {
        //     Swal.fire({
        //         type: 'error', text: 'Please enter a password',
        //         title: "Error"
        //     })
        //     return;
        // }
        // else if (input.confirmPassoword !== input.password) {
        //     Swal.fire({
        //         type: 'error', text: 'Password does not match',
        //         title: "Error"
        //     })
        //     return;
        // }
        else if (!input.displayName) {
            Swal.fire({
                type: 'error', text: 'Please enter display name',
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
            fetchAPI('PATCH', `kioskMgt/clients/${this.state.input._id}`, this.state.input).then(respObj => {
                if (respObj && respObj.ok) {
                    Swal.fire({
                        type: 'success',
                        title: "Update Success!",
                        animation: false,
                        customClass: {
                            popup: 'animated tada'
                        },
                        preConfirm: () => {
                            return this.props.history.push('/start')
                        },
                    })
                } else {
                    Swal.fire({
                        type: 'error', text: 'Please try again.',
                        title: respObj.error
                    })
                }
            });
        } catch (err) {
            Swal.fire({
                type: 'error', text: 'Please try again.',
                title: err.message
            })
        }
    };

    handleDateChange = (value) => {
        this.setState({ selectedDate: value })
    }

    render() {
        const { classes } = this.props;
        const { input, edit } = this.state;
        return (
            <KioskLayout {...this.props} imageWidth={130} imagePadding={10} displayName={this.state.displayName}>
                <Container component="main" maxWidth="md" className={classes.container} >

                    <form>
                        <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                            InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                            variant="outlined" margin="normal" fullWidth
                            name="mobile" label="Mobile" type="number"
                            onClick={edit ? null : () => this.setActiveInput("mobile")}
                            value={input["mobile"] || ""}
                            onChange={e => this.onChangeInput(e)}
                            disabled={edit}
                        />

                        {// Disable password for register
                        /* <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                            InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                            variant="outlined" margin="normal" fullWidth
                            name="password" label="Password" type="password"
                            onClick={edit ? null : () => this.setActiveInput("password")}
                            value={input["password"] || ""}
                            onChange={e => this.onChangeInput(e)}
                            disabled={edit}
                        /> */}
                        {/* <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                            InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                            variant="outlined" margin="normal" fullWidth
                            name="confirmPassoword" label="Confirm Password" type="password"
                            onClick={edit ? null : () => this.setActiveInput("confirmPassoword")}
                            value={input["confirmPassoword"] || ""}
                            onChange={e => this.onChangeInput(e)}
                            disabled={edit}
                        /> */}
                        <TextField style={{ backgroundColor: "#f2f1ed", fontSize: "30px" }} autoComplete='off'
                            InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                            variant="outlined" margin="normal" fullWidth
                            name="displayName" label="Display Name"
                            onClick={edit ? null : () => this.setActiveInput("displayName")}
                            value={input["displayName"] || ""}
                            onChange={e => this.onChangeInput(e)}
                            disabled={edit}
                        />
                        <TextField style={{ backgroundColor: "#f2f1ed", fontSize: "30px" }} autoComplete='off'
                            InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                            variant="outlined" margin="normal" fullWidth
                            name="email" label="Email"
                            onClick={edit ? null : () => this.setActiveInput("email")}
                            value={input["email"] || ""}
                            onChange={e => this.onChangeInput(e)}
                            disabled={edit}
                        />
                        <TextField style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                            InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ style: { fontSize: mainFontSize } }}
                            variant="outlined" margin="normal" fullWidth
                            name="nric" label="NRIC"
                            onClick={edit ? null : () => this.setActiveInput("nric")}
                            value={input["nric"] || ""}
                            onChange={e => this.onChangeInput(e)}
                            disabled={edit}
                        />
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker
                                autoOk
                                disableFuture
                                disableToolbar
                                openTo="year"
                                format="dd/MM/yyyy"
                                label="Date of birth"
                                views={["year", "month", "date"]}
                                style={{ backgroundColor: "#f2f1ed" }} autoComplete='off'
                                InputProps={{ style: { fontSize: mainFontSize } }} InputLabelProps={{ shrink: true, style: { fontSize: mainFontSize } }}
                                fullWidth
                                margin="normal"
                                inputVariant="outlined"
                                variant="outlined"
                                value={this.state.selectedDate} onChange={this.handleDateChange}
                                disabled={edit} />
                        </MuiPickersUtilsProvider>
                        <Typography variant='h5' gutterBottom>
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
                            isDisabled={edit}
                        />
                        <div style={{textAlign: "center"}}>
                            <Typography style={{ fontSize: 50, marginTop: 20 }} color="primary">
                                Credit: {this.state.input.credit}
                            </Typography>
                        </div>
                        {this.state.edit ?
                            <React.Fragment>
                                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                    style={{ fontSize: mainFontSize }} onClick={() => this.setState({ edit: false })}
                                >
                                    Edit
                            </Button>
                                <ColorButton variant="contained" fullWidth className={classes.cancel}
                                    onClick={() => { this.props.history.push('/selectservice') }} style={{ fontSize: mainFontSize }}
                                >
                                    Check In
                                </ColorButton>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                    style={{ fontSize: mainFontSize }} onClick={this.update}
                                >
                                    Update
                            </Button>
                                <Button variant="contained" color="secondary" fullWidth className={classes.cancel}
                                    style={{ fontSize: mainFontSize }} onClick={() => this.setState({ edit: true })}
                                >
                                    Cancel
                            </Button>
                            </React.Fragment>
                        }


                    </form>
                </Container>
                <Dialog
                    fullWidth
                    maxWidth="xl"
                    style={{ fontSize: mainFontSize }}
                    open={this.state.keyboardOpen}
                    // onEnter={() => {
                    //     //clear the display value when open
                    //     var value = this.refs.displayValue;
                    //     value.children[0].children[0].value = '';
                    // }}
                    onClose={this.handleKeyboardClose}
                    TransitionComponent={Transition}
                    keepMounted
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent>
                        <div>
                            <TextField InputProps={{ style: { fontSize: 30 } }} fullWidth
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
            </KioskLayout>
        );
    }
}

const ColorButton = withStyles(theme => ({
    root: {
        color: theme.palette.getContrastText(green[600]),
        backgroundColor: green[600],
        '&:hover': {
            backgroundColor: green[700],
        },
        marginTop: 30
    },
}))(Button);

export default withStyles(styles)(ClientDetails);
