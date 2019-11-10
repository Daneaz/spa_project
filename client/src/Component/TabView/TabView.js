import React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { withStyles } from '@material-ui/styles';
// import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Tabs, Tab, Typography, Box, Divider, ListItem, List } from '@material-ui/core';
import InvoiceListView from '../Invoice/InvoiceListView'

function Appointment(props) {
    return (
        <InvoiceListView bookings={props.bookings} click={props.click} />
    )
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            <Box p={3}>{children}</Box>
        </Typography>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: 500,
    },
});

class TabView extends React.Component {
    state = {
        value: 0,
        index: null,
    }

    handleChange = (event, newValue) => {
        this.setState({ value: newValue })
    };

    handleChangeIndex = index => {
        this.setState({ index: index })
    };

    render() {
        const { appointments, invoices } = this.props
        const { value } = this.state

        return (
            <div>
                <Tabs
                    value={value}
                    onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    aria-label="full width tabs example"
                >
                    <Tab label="Appointments" {...a11yProps(0)} />
                    <Tab label="Invoices" {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={value} index={0} >
                    {
                        appointments ?
                            appointments.map(appointment => {
                                return (
                                    <React.Fragment>
                                        <Divider />
                                        <Appointment bookings={appointment.bookings} click={() => {
                                            const { history } = this.props;
                                            history.push({
                                                pathname: "/invoice/detail",
                                                state: {
                                                    appointment: appointment
                                                }
                                            });
                                        }} />
                                        <Divider />
                                    </React.Fragment>
                                )
                            }) : null
                    }
                </TabPanel>
                <TabPanel value={value} index={1} >
                    {
                        invoices ?
                            invoices.map(invoice => {
                                return (
                                    <React.Fragment>
                                        <Divider />
                                        <Appointment bookings={invoice.appointment.bookings} click={() => {
                                            const { history } = this.props;
                                            history.push({
                                                pathname: "/invoice/detail",
                                                state: {
                                                    invoice: invoice
                                                }
                                            });
                                        }} />
                                        <Divider />
                                    </React.Fragment>
                                )
                            }) : null
                    }
                </TabPanel>
            </div>
        );
    }
}

export default withStyles(styles)(TabView);