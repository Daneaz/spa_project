import React from 'react';
import Select from 'react-select';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, CssBaseline, Container, LinearProgress
} from '@material-ui/core';

import { Formik, Field, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import { fetchAPI, setToken, setUser, removeToken, removeUser } from '../../utils';
import Swal from 'sweetalert2';
import AppLayout from '../../layout/app'

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
    };

    handleChange = selectedOption => {
        this.setState({ selectedOption });
    };

    async componentDidMount() {
        const response = await fetchAPI('GET', 'userMgt/roles');
        this.setState({ roleList: response });
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
                                    values.Role = {};
                                    values.Role.name = this.state.selectedOption.value;
                                }
                                const respObj = await fetchAPI('POST', 'userMgt/users', values);

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