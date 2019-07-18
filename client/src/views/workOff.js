import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
    Container, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, Input, MenuItem, FormControl, Select, TextField
} from '@material-ui/core';
import InfiniteCalendar, { Calendar, defaultMultipleDateInterpolation, withMultipleDates } from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css'

import AppLayout from '../layout/app'

const styles = theme => ({
    fab: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
});

class WorkOff extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedDates: [],
            open: false,
        };
    }

    handleMultiSelectDates(selectedDate) {
        this.state.selectedDates.push(selectedDate);
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleOpen = () => {
        this.setState({ open: false });
    }

    handleClose = () => {
        this.setState({ open: false });
    }

    render() {
        const { classes } = this.props;
        return (
            <AppLayout title="Work Off" {...this.props} >
                <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
                    Open form dialog
                </Button>
                <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                    <DialogContent>
                        <InfiniteCalendar
                            Component={withMultipleDates(Calendar)}
                            selected={[]}
                            minDate={new Date()}
                            interpolateSelection={defaultMultipleDateInterpolation}
                            onSelect={(selectedDate) => { this.handleMultiSelectDates(selectedDate) }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleDone} color="primary">
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>

            </AppLayout>
        );
    }
}

export default withStyles(styles)(WorkOff);
