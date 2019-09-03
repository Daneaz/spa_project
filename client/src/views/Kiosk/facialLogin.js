import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Fab, Hidden
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

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

class FacialLogin extends React.Component {

    render() {
        const { classes } = this.props;
        return (
            <Typography component="div"  >
                <h3>
                    Hello World, i'm Facial Login
      </h3>
            </Typography>
        );
    }
}

export default withStyles(styles)(FacialLogin);
