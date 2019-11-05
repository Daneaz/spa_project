import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
    Grid, TextField, Paper, ListItem,
    InputLabel, FormControl, Select, Input, MenuItem,
} from '@material-ui/core';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
} from '@material-ui/pickers';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    
    paperMargin: {
        margin: theme.spacing(1),
        minWidth: 800,
        maxWidth: 800
    },
});

class Checkout extends React.Component {

    render() {
        const { classes } = this.props;
        return (
            <Paper className={classes.paperMargin}>
                <ListItem>
                    <Grid
                        container
                        direction="column">
                        <Grid item>
                            <Grid
                                container
                                justify="space-between"
                                direction="row">
                                <h3><strong>{this.props.booking.service.name}</strong></h3>
                                <h3><strong>S${this.props.booking.service.price}</strong></h3>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <light>{new Date(this.props.booking.start).toTimeString().split(' ')[0]} with {this.props.booking.staff.displayName} </light>
                        </Grid>
                    </Grid>
                </ListItem>
            </Paper>
        )
    }
}
export default withStyles(styles)(Checkout);