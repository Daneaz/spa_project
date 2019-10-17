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
        selectedStaff: '',
        serviceList: [],
        staffList: [],
        displayName: '',
    };

    async componentWillMount() {
        try {
            let serviceList = await fetchAPI('GET', 'kiosk/services')
            this.setState({
                serviceList: serviceList,
                staffList: serviceList[0].staff
            });
        } catch (error) {
            console.log(error);
        }
    }

    handleSelectStaffChange = (event) => {
        this.setState({ selectedStaff: event.target.value });
    };

    handleSelectServiceChange = (event, child) => {
        this.setState({ selectedStaff: '' });
        let index = child.props.id;

        fetchAPI('POST', 'kiosk/availablestaff', this.state.serviceList[index]).then(staffAvailable => {
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

    render() {
        const { classes } = this.props;
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
            </div >
        )
    }
}
export default withStyles(styles)(SelectService);