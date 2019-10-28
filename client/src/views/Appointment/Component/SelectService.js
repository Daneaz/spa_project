import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
    Button, Grid, Typography, IconButton,
    InputLabel, FormControl, Select, Input, MenuItem,
} from '@material-ui/core';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
} from '@material-ui/pickers';
import { withStyles } from '@material-ui/core/styles';
import { fetchAPI, getClient } from '../../../utils';

const styles = theme => ({
    formControl: {
        margin: theme.spacing(3),
        minWidth: 500,
    },
});

class SelectService extends React.Component {

    state = {
        selectedServiceData: '',
        selectedService: '',
        selectedStaff: '',
        serviceList: [],
        staffList: [],
        selectedTime: new Date(),
        booking: {
            id: this.props.id,
            start: this.props.start,
            end: null,
            staff: null,
            service: null,
        },
    };

    async componentWillMount() {
        try {
            let serviceList = await fetchAPI('GET', 'kiosk/services')
            if (this.props.edit && this.props.booking) {
                let booking = this.props.booking
                booking.start = new Date(this.props.booking.start)
                booking.end = new Date(this.props.booking.end)
                booking.id = this.props.booking._id
                this.props.addBooking(booking)
                this.setState({
                    serviceList: serviceList,
                    staffList: serviceList[0].staff,
                    booking: booking,
                    selectedService: booking.service,
                    selectedStaff: booking.staff,
                    selectedTime: booking.start
                });
            } else {
                this.setState({
                    selectedTime: this.props.start,
                    serviceList: serviceList,
                    staffList: serviceList[0].staff,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    handleSelectStaffChange = (event) => {
        let booking = { ...this.state.booking }
        booking.staff = event.target.value
        this.props.addBooking(booking);
        this.setState({
            selectedStaff: event.target.value,
            booking: booking,
        });
    };

    handleSelectServiceChange = (event, child) => {
        this.setState({ selectedStaff: '' });
        let index = child.props.id;
        let value = this.state.serviceList[index]
        value.start = this.state.selectedTime
        value.end = new Date((value.start).getTime() + value.duration * 60000);
        fetchAPI('POST', 'appointmentMgt/availablestaff', this.state.serviceList[index]).then(async (staffAvailable) => {
            if (staffAvailable.length === 0) {
                staffAvailable = [
                    {
                        "displayName": "No Staff Available"
                    }
                ]
            }
            let booking = { ...this.state.booking }
            booking.service = event.target.value
            booking.end = value.end
            booking.staff = null
            this.props.addBooking(booking);
            this.setState({
                selectedServiceData: this.state.serviceList[index],
                selectedService: event.target.value,
                staffList: staffAvailable,
                booking: booking,
            });
        });
    };

    handleTimeChange = (time) => {
        let booking = { ...this.state.booking }
        booking.start = time
        this.props.addBooking(booking);
        this.setState({
            selectedTime: time,
            booking: booking,
        })
    };

    render() {
        const { classes } = this.props;
        return (
            <form>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center">
                    <Grid item>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardTimePicker
                                ampm={false}
                                minutesStep={5}
                                autoOk
                                label="Start Time"
                                value={this.state.selectedTime}
                                onChange={this.handleTimeChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change time',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item>
                        <FormControl className={classes.formControl} >
                            <InputLabel htmlFor="age-native-simple" >Service Type</InputLabel>
                            <Select
                                value={this.state.selectedService}
                                onChange={this.handleSelectServiceChange}
                                input={<Input id="age-native-simple" />}
                            >
                                {this.state.serviceList.map((service, i) => (
                                    <MenuItem id={i} value={service._id}>
                                        {`${service.name} ( ${service.duration} mins $${service.price} )`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="age-native-simple" >Staff Name</InputLabel>
                            <Select
                                value={this.state.selectedStaff}
                                onChange={this.handleSelectStaffChange}
                                input={<Input id="age-native-simple" />}
                            >
                                {this.state.staffList.map(staff => (
                                    <MenuItem value={staff._id}>
                                        {staff.displayName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </form>
        )
    }
}
export default withStyles(styles)(SelectService);