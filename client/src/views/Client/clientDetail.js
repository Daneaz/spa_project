import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, Grid, Avatar, Paper, Divider, List, ListItem, ListItemAvatar, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, ButtonGroup
} from '@material-ui/core';
import { fetchAPI, getAvatarLetter } from '../../utils';
import AppLayout from '../../layout/app'
import ClientTabs from './Component/Tabs'
import Swal from 'sweetalert2';

const styles = theme => ({
    bigAvatar: {
        margin: 10,
        width: 100,
        height: 100,
    },
    list: {
        width: "100%",
    },
    listAvatar: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: theme.spacing(2),
    },
    listButton: {
        display: 'flex',
        justifyContent: 'space-evenly',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    labelColor: {
        color: '#969590',
    },
});

class ClientDetail extends React.Component {

    state = {
        addCreditDialog: false,
        credit: '',
        client: '',
    }

    async componentDidMount() {
        try {
            let respObj = await fetchAPI('GET', `clientMgt/clients/${this.props.location.state.data._id}`)
            if (respObj) {
                this.setState({ client: respObj })
            } else {
                Swal.fire({
                    type: 'error', text: "Client cannot be found",
                    title: "Fail!"
                })
            }
        } catch (error) {
            Swal.fire({
                type: 'error', text: error,
                title: "Fail!"
            })
        }
    }
    handleEditClick = () => {
        const { history } = this.props;
        history.push({
            pathname: "/updateclient",
            state: {
                data: this.state.client,
            }
        });
    }
    addCreditValueChange = (event) => {
        this.setState({ credit: event.target.value })
    }
    handleAddCreditOpen = () => {
        this.setState({ addCreditDialog: true });
    }
    handleAddCreditClose = () => {
        this.setState({ addCreditDialog: false });
    };

    handleAddCreditConfirm = () => {
        this.setState({
            addCreditDialog: false,
            credit: '',
        })
        let values = {
            credit: this.state.credit
        }
        fetchAPI('PATCH', `clientMgt/addcredit/${this.state.client._id}`, values).then(respObj => {
            if (respObj && respObj.ok) {
                this.setState({ client: respObj.client })
                Swal.fire({
                    type: 'success', text: respObj.ok,
                    title: "Success!"
                })
            } else {
                Swal.fire({
                    type: 'error', text: respObj.error,
                    title: "Fail!"
                })
            }
        }).catch(error => {
            Swal.fire({
                type: 'error', text: error,
                title: "Fail!"
            })
        })
    }
    render() {
        const { classes } = this.props;
        return (
            <AppLayout title="Client Details" {...this.props} >

                <Grid container justify="center" spacing={3} >
                    <Grid item xs={5}>
                        <Paper>
                            <List className={classes.list}>
                                <ListItemAvatar className={classes.listAvatar}>
                                    <Grid container direction='column' alignItems="center">
                                        {/* <Avatar alt="Remy Sharp" className={classes.bigAvatar}>{getAvatarLetter(this.props.location.state.data.displayName)} </Avatar> */}
                                        <Typography variant='h4' style={{marginTop: "10px"}}> {this.state.client.displayName} </Typography>
                                    </Grid>
                                </ListItemAvatar>
                                <Divider />
                                <ListItem>
                                    <Grid>
                                        <Typography className={classes.labelColor}> Email </Typography>
                                        <Typography> {this.state.client.email} </Typography>
                                    </Grid>
                                </ListItem>
                                <ListItem>
                                    <Grid>
                                        <Typography className={classes.labelColor}> Gender </Typography>
                                        <Typography> {this.state.client.gender} </Typography>
                                    </Grid>
                                </ListItem>
                                <ListItem>
                                    <Grid>
                                        <Typography className={classes.labelColor}> NRIC </Typography>
                                        <Typography> {this.state.client.nric} </Typography>
                                    </Grid>
                                </ListItem>
                                <ListItem>
                                    <Grid>
                                        <Typography className={classes.labelColor}> Mobile </Typography>
                                        <Typography> {this.state.client.mobile} </Typography>
                                    </Grid>
                                </ListItem>
                                {/* <ListItem>
                                    <Grid>
                                        <Typography className={classes.labelColor}> Book No </Typography>
                                        <Typography> {0} </Typography>
                                    </Grid>
                                </ListItem> */}
                                <ListItem >
                                    <ButtonGroup fullWidth >
                                        <Button onClick={this.handleEditClick}>Edit</Button>
                                        <Button onClick={this.handleAddCreditOpen}>Add Credit</Button>
                                        <Button >New Appointment</Button>
                                    </ButtonGroup>
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={7}>
                        <Grid container spacing={3} direction="column">
                            <Grid item>
                                <Paper>
                                    <List>
                                        <ListItem style={{ minHeight: 100 }}>
                                            <Grid container direction='row' justify="space-evenly" alignItems="center">
                                                <Grid item xs={3}>
                                                    <Grid container direction='column' alignItems="center">
                                                        <Typography variant='h5'> {this.state.client.credit} </Typography>
                                                        <Typography className={classes.labelColor} > Credit Balance </Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Grid container direction='column' alignItems="center">
                                                        <Typography variant='h5'> {0} </Typography>
                                                        <Typography className={classes.labelColor}> Total Sales </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <Divider />
                                        <ListItem>
                                            <Grid container direction='row' justify="space-evenly" alignItems="center">
                                                <Grid item xs={3}>
                                                    <Grid container direction='column' alignItems="center">
                                                        <Typography variant='h6'> {0} </Typography>
                                                        <Typography className={classes.labelColor}> All Bookings </Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Grid container direction='column' alignItems="center">
                                                        <Typography variant='h6'> {0} </Typography>
                                                        <Typography className={classes.labelColor}> Completed </Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Grid container direction='column' alignItems="center">
                                                        <Typography variant='h6'> {0} </Typography>
                                                        <Typography className={classes.labelColor}> Missed </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item
                            >
                                <Paper style={{ height: 600 }}>
                                    <ClientTabs></ClientTabs>

                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Dialog open={this.state.addCreditDialog} onClose={this.handleAddCreditClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Add Credit</DialogTitle>
                    <DialogContent style={{ minWidth: 400 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Amount"
                            type="number"
                            fullWidth
                            placeholder="Please enter amount..."
                            onChange={this.addCreditValueChange}
                            value={this.state.credit}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleAddCreditClose} color="primary">
                            Cancel
                    </Button>
                        <Button onClick={this.handleAddCreditConfirm} color="primary">
                            Confirm
                    </Button>
                    </DialogActions>
                </Dialog>
            </AppLayout>
        );
    }
}

export default withStyles(styles)(ClientDetail);
