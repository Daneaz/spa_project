import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
    Grid, TextField, Paper, ListItem, Button, Divider, List, IconButton, AppBar, Toolbar, Typography, Container
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';


import Swal from 'sweetalert2';
import Invoice from '../Appointment/Component/invoice'
import { fetchAPI } from '../../utils';

const styles = theme => ({
    checkoutBtn: {
        marginTop: 5,
        marginBottom: 5,
        width: "25%",
        minHeight: 100,
    },
    titleBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
});

class Checkout extends React.Component {

    state = {
        bookingList: [],
        client: null,
        total: null,
        subtotal: null,
        addon: null,
        discount: null,
        remark: "",
        isCheckout: false,
    }

    async componentDidMount() {
        let appointment = await fetchAPI('GET', `invoiceMgt/invoice/${this.props.location.state.appointmentId}`)
        let subtotal = 0
        appointment.bookings.map(booking => {
            subtotal += parseFloat(booking.service.price)
        })
        this.setState({
            bookingList: appointment.bookings,
            client: appointment.bookings[0].client,
            subtotal: subtotal,
            total: subtotal,
            isCheckout: appointment.checkout,
        })
    }

    handleChange = (event, type) => {
        if (type !== "remark") {
            this.setState({
                ...this.state, [type]: Math.abs(parseFloat(event.target.value)),
            });
            this.setState((prevState, props) => {
                return { total: prevState.subtotal + prevState.addon - prevState.discount }
            })
        } else {
            this.setState({ ...this.state, [type]: event.target.value });
        }
    };


    handleConfirmCheckout = (type) => {
        Swal.fire({
            type: 'info',
            title: "Confirm to check out ?",
            animation: false,
            showCancelButton: true,
            cancelButtonColor: '#d33',
            confirmButtonColor: '#08a325',
            confirmButtonText: 'Confirm',
            reverseButtons: true,
            preConfirm: () => {
                console.log(this.state.client)
                let values = {
                    subtotal: this.state.subtotal,
                    client: this.state.client._id,
                    discount: this.state.discount ? this.state.discount : 0,
                    addon: this.state.addon ? this.state.addon : 0,
                    total: this.state.total,
                    remark: this.state.remark,
                    paymentType: type,
                    appointment: this.props.location.state.appointmentId,
                }
                fetchAPI('POST', `invoiceMgt/invoice`, values).then(invoice => {
                    const { history } = this.props;
                    history.push({
                        pathname: "/invoice",
                        state: {
                            invoice: invoice._id
                        }
                    });
                })
            }
        })

    }

    handleClose = () => {
        window.history.back()
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <AppBar className={classes.titleBar}>
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            New Appointment
                    </Typography>
                        <IconButton edge="start" color="inherit" onClick={this.handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Grid
                    container
                    direction="column"
                    alignItems="center">
                    {
                        this.state.bookingList.map(booking => {
                            return <Invoice booking={booking}> </Invoice>
                        })
                    }
                    <Paper style={{ marginTop: 10 }}>
                        <ListItem style={{ width: 800 }}>
                            <Grid
                                container
                                justify="space-between"
                                direction="row">
                                {this.state.isCheckout ? null :
                                    <React.Fragment>
                                        <TextField variant="outlined" margin="normal" type="number" label="Discount" value={this.state.discount}
                                            onChange={(event) => this.handleChange(event, 'discount')} ></TextField>
                                        <TextField variant="outlined" margin="normal" type="number" label="Add-on" value={this.state.addon}
                                            onChange={(event) => this.handleChange(event, 'addon')} ></TextField>
                                        <TextField variant="outlined" margin="normal" label="Remark" value={this.state.remark}
                                            onChange={(event) => this.handleChange(event, 'remark')}></TextField>
                                    </React.Fragment>
                                }
                                <Grid
                                    container
                                    alignItems="flex-end"
                                    direction="column">
                                    <Grid item>
                                        <List style={{ minWidth: 350 }}>
                                            <ListItem>
                                                <Typography>
                                                    <strong> Customer Name : {this.state.client ? this.state.client.displayName : null} </strong>
                                                </Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Grid
                                                    container
                                                    justify="space-between"
                                                    direction="row">
                                                    <div>Subtotal</div>
                                                    <div>${this.state.subtotal}</div>
                                                </Grid>
                                            </ListItem>
                                            <Divider />
                                            <ListItem>
                                                <Grid
                                                    container
                                                    justify="space-between"
                                                    direction="row">
                                                    <div>Discount</div>
                                                    <div>${this.state.discount ? this.state.discount : 0}</div>
                                                </Grid>
                                            </ListItem>
                                            <ListItem>
                                                <Grid
                                                    container
                                                    justify="space-between"
                                                    direction="row">
                                                    <div>Add-on</div>
                                                    <div>${this.state.addon ? this.state.addon : 0}</div>
                                                </Grid>
                                            </ListItem>
                                            <Divider />
                                            <ListItem>
                                                <Grid
                                                    container
                                                    justify="space-between"
                                                    direction="row">
                                                    <div>Total</div>
                                                    <div>${this.state.total}</div>
                                                </Grid>
                                            </ListItem>
                                        </List>
                                    </Grid>
                                </Grid>
                                {
                                    this.state.isCheckout ?
                                        null :
                                        <Grid
                                            container
                                            justify="space-evenly"
                                            direction="row">
                                            <Button className={classes.checkoutBtn} variant="contained" color="primary" onClick={() => this.handleConfirmCheckout("Cash")}>
                                                Cash
                                            </Button>
                                            <Button className={classes.checkoutBtn} variant="contained" color="primary" onClick={() => this.handleConfirmCheckout("Card")}>
                                                Credit Card
                                            </Button>
                                            <Button className={classes.checkoutBtn} variant="contained" color="primary" onClick={() => this.handleConfirmCheckout("Others")}>
                                                Others
                                            </Button>
                                        </Grid>
                                }
                            </Grid>
                        </ListItem>
                    </Paper>
                </Grid>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Checkout);
