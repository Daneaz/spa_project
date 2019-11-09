import React from 'react';
import Picky from 'react-picky';
import 'react-picky/dist/picky.css';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, CssBaseline, Container, LinearProgress
} from '@material-ui/core';

import { Formik, Field, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import { fetchAPI } from '../../utils';
import Swal from 'sweetalert2';
import AppLayout from '../../Component/Layout/Layout'

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
});

class NewStaff extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            staffList: [],
            arrayValue: []
        };
        this.selectMultipleOption = this.selectMultipleOption.bind(this);
    }

    selectMultipleOption(value) {
        this.setState({ arrayValue: value });
    }

    async componentDidMount() {
        const response = await fetchAPI('GET', 'staffMgt/workingStaff');
        this.setState({ staffList: response });
    }

    render() {
        const { classes } = this.props;

        return (
            <AppLayout title="New Category" {...this.props} >
                <Container component="main" maxWidth="md" className={classes.container} >
                    <Typography>
                        <h3>
                            Service Category
                        </h3>
                    </Typography>
                    <CssBaseline />
                    <Formik
                        initialValues={{ name: ''}}
                        validate={values => {
                            const errors = {};
                            if (!values.name) { errors.name = 'Please enter category name' }
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            try {
                                
                                const respObj = await fetchAPI('POST', 'serviceMgt/category', values);

                                if (respObj && respObj.ok) {
                                    window.history.back();
                                } else { throw new Error('Fail to add service') }
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
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="name" label="Category Name"
                                />
                                
                                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                    disabled={isSubmitting} onClick={submitForm}
                                >
                                    Create
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