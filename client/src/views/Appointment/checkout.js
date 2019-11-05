import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
    Grid, TextField, Paper, ListItem, Button, Divider, List
} from '@material-ui/core';

import AppLayout from '../../layout/app'
import Invoice from './Component/invoice'
import { fetchAPI } from '../../utils';

const styles = theme => ({
    fab: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
});

class Checkout extends React.Component {

    state = {
        bookingList: [],
        total: 0,
        subtotal: 0,
        addon: 0,
        discount: 0,
        remark: "",
    }

    async componentDidMount() {
        let bookingList = await fetchAPI('GET', `invoiceMgt/invoice/${this.props.location.state.appointmentId}`)
        let subtotal = 0
        bookingList.map(booking => {
            subtotal += parseFloat(booking.service.price)
        })
        this.setState({
            bookingList: bookingList,
            subtotal: subtotal,
            total: subtotal
        })
    }

    handleChange = (event, type) => {
        if (type !== "remark") {
            this.setState({
                ...this.state, [type]: parseFloat(event.target.value),
            });
        } else {
            this.setState({ ...this.state, [type]: event.target.value });
        }
    };

    calculatTotal = () => {
        this.setState({ total: this.state.subtotal + this.state.addon - this.state.discount })
    }

    handleConfirmCheckout = () => {
        let values = {
            subtotal: this.state.subtotal,
            discount: this.state.discount,
            addon: this.state.addon,
            total: this.state.total,
            remark: this.state.remark,
            appointment: this.props.location.state.appointmentId,
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <AppLayout title="Checkout" {...this.props} >
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center">
                    {
                        this.state.bookingList.map(booking => {
                            return <Invoice booking={booking}> </Invoice>
                        })
                    }
                    <Paper style={{ marginTop: 10 }}>
                        <ListItem style={{ maxWidth: 800 }}>
                            <Grid
                                container
                                justify="space-between"
                                direction="row">

                                <TextField variant="outlined" margin="normal" type="number" label="Discount" value={this.state.discount}
                                    onChange={(event) => this.handleChange(event, 'discount')} onBlur={this.calculatTotal}></TextField>
                                <TextField variant="outlined" margin="normal" type="number" label="Add-on" value={this.state.addon}
                                    onChange={(event) => this.handleChange(event, 'addon')} onBlur={this.calculatTotal}></TextField>
                                <TextField variant="outlined" margin="normal" label="Remark" value={this.state.remark}
                                    onChange={(event) => this.handleChange(event, 'remark')}></TextField>


                                <Grid
                                    container
                                    alignItems="flex-end"
                                    direction="column">
                                    <Grid item>
                                        <List style={{ minWidth: 350 }}>
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
                                                    <div>${this.state.discount}</div>
                                                </Grid>
                                            </ListItem>
                                            <ListItem>
                                                <Grid
                                                    container
                                                    justify="space-between"
                                                    direction="row">
                                                    <div>Add-on</div>
                                                    <div>${this.state.addon}</div>
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
                                    <Button style={{ marginTop: 5, marginBottom: 5 }} fullWidth variant="contained" color="primary" onClick={this.handleConfirmCheckout}>
                                        Confirm Checkout
                                    </Button>
                                    <Button style={{ marginTop: 5, marginBottom: 5 }} fullWidth variant="contained" color="secondary"
                                        onClick={() => window.history.back()}>
                                        Cancel
                                    </Button>
                                </Grid>
                            </Grid>
                        </ListItem>
                    </Paper>
                </Grid>
            </AppLayout>
        );
    }
}

export default withStyles(styles)(Checkout);
