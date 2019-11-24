import React from 'react';
import { Animated } from "react-animated-css";
import {
    Button, Grid, Typography,
    InputLabel, FormControl, Select, Input, MenuItem,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { fetchAPI, getClient } from '../../../utils';
import Swal from 'sweetalert2';

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

class SelectService extends React.Component {

    state = {
        selectedServiceData: '',
        selectedService: '',
        selectedServiceCategory: '',
        selectedStaff: '',
        serviceList: [],
        staffList: [],
        displayName: '',
        categoryList: [],
    };

    async componentWillMount() {
        try {
            const serviceList = await fetchAPI('GET', 'kioskMgt/services')
            const categoryList = await fetchAPI('GET', 'kioskMgt/category')
            this.setState({
                serviceList: serviceList,
                staffList: serviceList[0].staff,
                categoryList: categoryList
            });
        } catch (error) {
            console.log(error);
        }
    }

    handleSelectStaffChange = (event) => {
        this.setState({ selectedStaff: event.target.value });
    };

    handleSelectServiceCategoryChange = (event) => {
        this.setState({
            selectedServiceCategory: event.target.value,
            selectedService: ''
        });
    };

    handleSelectServiceChange = (event, child) => {
        this.setState({ selectedStaff: '' });
        let index = child.props.id;
        let start = new Date();
        let end = new Date(start.getTime() + parseInt(this.state.selectedServiceData.duration) * 60000)
        let values = {
            ...this.state.serviceList[index],
            start: start,
            end: end,
        }
        fetchAPI('POST', 'kioskMgt/availablestaff', values).then(staffAvailable => {
            if (staffAvailable.length === 0) {
                staffAvailable = [
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

    submit() {
        let client = getClient()
        let data = {}
        data.total = this.state.selectedServiceData.price;

        fetchAPI('POST', `kioskMgt/useCredit/${client._id}`, data).then(service => {
            if (service.ok) {
                let start = new Date();
                let end = new Date(start.getTime() + parseInt(this.state.selectedServiceData.duration) * 60000)
                let values = [{
                    category: this.state.selectedServiceCategory,
                    client: client._id,
                    service: this.state.selectedService,
                    start: start,
                    end: end,
                    staff: this.state.selectedStaff,
                }]
                fetchAPI('POST', 'kioskMgt/appointment', values).then(respObj => {
                    if (respObj && respObj.ok) {
                        let values = {
                            subtotal: data.total,
                            client: client._id,
                            discount: 0,
                            addon: 0,
                            total: data.total,
                            remark: '',
                            paymentType: "Credit",
                            appointment: respObj.appointmentId
                        }
                        this.checkout(values);
                    } else {
                        Swal.fire({
                            type: 'error',
                            title: "Opps... Something Wrong...",
                            text: respObj.error,
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
                    title: "Opps... Something Wrong...",
                    text: service.error,
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
            Swal.fire({
                type: 'error',
                title: "Opps... Something Wrong...",
                text: error
            })
        });
    }

    checkout = (values) => {
        fetchAPI('POST', `kioskMgt/invoice`, values).then(respObj => {
            if (respObj && respObj.ok) {
                Swal.fire({
                    type: 'success',
                    title: "Please process to the waiting area!",
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
                    title: "Opps... Something Wrong...",
                    text: respObj.error
                })
            }
        }).catch(error => {
            Swal.fire({
                type: 'error',
                title: "Opps... Something Wrong...",
                text: error
            })
        })
    }

    render() {
        const { classes } = this.props;
        let serviceDiv =
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

        let serviceInfoDiv =
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
                <Typography variant="h3" className={classes.bold}> Price: ${this.state.selectedServiceData.price}</Typography>
                <Typography variant="h3" className={classes.bold}> Duration: {this.state.selectedServiceData.duration} mins</Typography>
            </Animated>


        let confirmDiv = <Animated animationIn="fadeIn" animationOut="fadeOut" key="confirmDiv" >
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

        return (
            <div style={{ display: "block" }} >
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
                                    <InputLabel htmlFor="age-native-simple" style={{ fontSize: 40 }}>Service Category</InputLabel>
                                    <Select
                                        style={{ fontSize: 40, height: 100 }}
                                        value={this.state.selectedServiceCategory}
                                        onChange={this.handleSelectServiceCategoryChange}
                                        input={<Input id="age-native-simple" style={{ fontSize: 40 }} />}
                                    >
                                        {this.state.categoryList.map((category, i) => (
                                            <MenuItem id={i} value={category._id} style={{ fontSize: 40 }}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                {this.state.selectedServiceCategory ? serviceDiv : null}
                            </Grid>
                            <Grid item xs={12}>
                                {this.state.selectedService ? serviceInfoDiv : null}
                            </Grid>
                            <Grid item xs={12}>
                                {(this.state.selectedStaff && this.state.selectedService) ? confirmDiv : null}
                            </Grid>
                        </Grid>
                    </form>
                </Animated>
            </div >
        )
    }
}
export default withStyles(styles)(SelectService);