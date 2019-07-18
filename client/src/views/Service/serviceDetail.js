import React from 'react';
import Picky from 'react-picky';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, CssBaseline, Container, LinearProgress
} from '@material-ui/core';

import { Formik, Field, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import { fetchAPI } from '../../utils';
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

class ClientDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            staffList: [],
            arrayValue: [],
        };
        this.selectMultipleOption = this.selectMultipleOption.bind(this);
    }

    async componentDidMount() {
        const response = await fetchAPI('GET', 'staffMgt/staffs');
        if (this.props.location.state.data.staff === "All Staff") {
            this.setState({ arrayValue: response });
        } else {
            const service = await fetchAPI('GET', `serviceMgt/services/${this.props.location.state.data._id}`);
            this.setState({ arrayValue: service.staff });
        }
        this.setState({ staffList: response });
    }

    selectMultipleOption(value) {
        this.setState({ arrayValue: value });
    }

    handleChange = selectedOption => {
        this.setState({ selectedOption });
    };

    render() {
        const { classes } = this.props;

        return (
            <AppLayout title="Service Details" {...this.props} >
                <Container component="main" maxWidth="md" className={classes.container} >
                    <Typography>
                        <h3>
                            Service Details
                        </h3>
                    </Typography>
                    <CssBaseline />
                    <Formik
                        initialValues={{ name: this.props.location.state.data.name, price: this.props.location.state.data.price, duration: this.props.location.state.data.duration }}
                        validate={values => {
                            const errors = {};
                            if (!values.name) { errors.name = 'Please enter service name' }
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            try {
                                let rawStaffList = this.state.arrayValue;
                                if (!rawStaffList)
                                    throw new Error('Please select a staff')
                                else {
                                    let staffList = [];
                                    for (let i = 0; i < rawStaffList.length; i++) {
                                        staffList.push(rawStaffList[i]._id)
                                    }
                                    values.staff = staffList;
                                }
                                const respObj = await fetchAPI('PATCH', `serviceMgt/services/${this.props.location.state.data._id}`, values);

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
                                    component={TextField} variant="outlined" margin="normal" fullWidth autoFocus
                                    name="name" label="Service Name"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="price" label="Price ($)" type="number"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="duration" label="Duration (min)" type="number"
                                />
                                <Typography>
                                    <h4>
                                        Select staff who perform this service.
                                    </h4>
                                </Typography>
                                <Picky
                                    value={this.state.arrayValue}
                                    options={this.state.staffList}
                                    onChange={this.selectMultipleOption}
                                    numberDisplayed={10}
                                    valueKey="_id"
                                    labelKey="displayName"
                                    multiple={true}
                                    includeSelectAll={true}
                                    includeFilter={true}
                                    dropdownHeight={600}
                                />
                                <Button variant="contained" color="primary" fullWidth className={classes.submit}
                                    disabled={isSubmitting} onClick={submitForm}
                                >
                                    Update
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

export default withStyles(styles)(ClientDetail);
