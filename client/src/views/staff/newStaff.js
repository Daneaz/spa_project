import React from 'react';
import Select from 'react-select';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, CssBaseline, Container, LinearProgress, Dialog, DialogActions, DialogContent, DialogTitle
} from '@material-ui/core';

import { Formik, Field, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import { fetchAPI, setToken, setUser, removeToken, removeUser } from '../../utils';
import Swal from 'sweetalert2';
import AppLayout from '../../layout/app'
import InfiniteCalendar, { Calendar, defaultMultipleDateInterpolation, withMultipleDates } from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css'


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

class NewStaff extends React.Component {

    state = {
        selectedOption: {value:"Manager", label:"Manager"},
        roleList: [],
        selectedDates: [],
        open: false,
    };

    async componentDidMount() {
        const response = await fetchAPI('GET', 'staffMgt/roles');
        this.setState({ roleList: response });
    }

    handleChange = selectedOption => {
        this.setState({ selectedOption });
    };

    handleMultiSelectDates(selectedDate) {
        let selectedDates = defaultMultipleDateInterpolation(selectedDate, this.state.selectedDates)
        this.setState({
            selectedDates: selectedDates
        })
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleOpen = () => {
        this.setState({ open: false });
    }

    handleClose = () => {
        this.setState({ open: false });
    }

    render() {
        const { classes } = this.props;
        const { selectedOption } = this.state;
        let options = this.state.roleList.map(function (role) {
            return { value: role.name, label: role.name };
        })
        return (
            <AppLayout title="New Staff" {...this.props} >
                <Container component="main" maxWidth="md" className={classes.container} >
                    <Typography>
                        <h3>
                            Personal Infomation
                        </h3>
                    </Typography>
                    <CssBaseline />
                    <Formik
                        initialValues={{ username: '', password: '', confirmPassoword: '', mobile: '', email: '', selectedOption: '' }}
                        validate={values => {
                            const errors = {};
                            if (!values.username) { errors.username = 'Please enter username' }
                            if (!values.password) { errors.password = 'Please enter password' }
                            if (!values.confirmPassoword) { errors.confirmPassoword = 'Please enter password' }
                            if (!values.displayName) { errors.displayName = 'Please enter password' }
                            if (!values.mobile) { errors.mobile = 'Please enter mobile number' }
                            if (!values.email) { errors.email = 'Please enter email address' }
                            if (values.password !== values.confirmPassoword) { errors.confirmPassoword = 'Password does not match' }
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            try {
                                if (!this.state.selectedOption)
                                    throw new Error('Please select a role')
                                else {
                                    values.role = {};
                                    values.role.name = this.state.selectedOption.value;
                                }
                                const respObj = await fetchAPI('POST', 'staffMgt/staffs', values);

                                if (respObj && respObj.ok) {

                                    window.history.back();
                                } else { throw new Error('Register failed') }
                            } catch (err) {
                                Swal.fire({
                                    type: 'error', text: 'Please try again.',
                                    title: err.message
                                })
                            }
                            setSubmitting(false);
                        }}
                        render={({ submitForm, isSubmitting, values, setFieldValue, errors, setErrors }) => (
                            <Form>
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth autoFocus
                                    name="username" label="Username"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="password" label="Password" type="password"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="confirmPassoword" label="Confirm Password" type="password"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="displayName" label="Display Name"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="mobile" label="Mobile" type="number"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="email" label="Email"
                                />
                                <Typography>
                                    <h5>
                                        Role
                                    </h5>
                                </Typography>
                                <Select className={classes.select}
                                    onChange={this.handleChange}
                                    options={options}
                                    value={selectedOption}
                                />
                                <Typography>
                                    <h5>
                                        Off Days
                                    </h5>
                                </Typography>
                                <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
                                    Please Select Off Days...
                                </Button>
                                <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                                    <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                                    <DialogContent>
                                        <InfiniteCalendar
                                            Component={withMultipleDates(Calendar)}
                                            selected={this.state.selectedDates}
                                            minDate={new Date()}
                                            interpolateSelection={defaultMultipleDateInterpolation}
                                            onSelect={(selectedDate) => { this.handleMultiSelectDates(selectedDate) }}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={this.handleClose} color="primary">
                                            Done
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                    disabled={isSubmitting} onClick={submitForm}
                                >
                                    Register
                                </Button>
                                <Button variant="contained" color="secondary" fullWidth className={classes.cancel}
                                    onClick={() => { window.history.back(); }}
                                >
                                    Cancel
                                </Button>
                                {isSubmitting && <LinearProgress />}
                            </Form>
                        )}
                    />
                </Container>
            </AppLayout>
        );
    }
}

export default withStyles(styles)(NewStaff);