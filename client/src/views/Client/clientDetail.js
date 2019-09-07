import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
    Typography, Button, CssBaseline, Container, Grid, Avatar
} from '@material-ui/core';

import AppLayout from '../../layout/app'

const styles = theme => ({
    container: {
        marginTop: theme.spacing(5)
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    cancel: {
        margin: theme.spacing(0, 0, 0),
    },
    bigAvatar: {
        margin: 10,
        width: 60,
        height: 60,
    },
});

class ClientDetail extends React.Component {

    render() {
        const { classes } = this.props;
        return (
            <AppLayout title="Staff Details" {...this.props} >
                <Container component="main" maxWidth="md" className={classes.container} >
                    <Typography>
                        <h3>
                            Update Client Details
                        </h3>
                    </Typography>
                    <CssBaseline />
                    <Grid container justify="center" alignItems="center">
                        <Avatar alt="Remy Sharp" src="/static/images/logo.png" className={classes.bigAvatar} />
                    </Grid>
                </Container>
            </AppLayout>
        );
    }
}

export default withStyles(styles)(ClientDetail);
