import React from 'react';
import { Animated } from "react-animated-css";
import { Switch, Paper, Box, Zoom, Fade, FormControlLabel, Button, IconButton, ButtonBase, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { removeToken, removeLocalStorage, removeUser } from '../../utils';

const BackGroundImage = '/static/images/Gerberas_Stones_Spa.jpg';
const LoginImage = '/static/images/login.png';
const RegisterImage = '/static/images/register.png';

const styles = theme => ({
    root: {
        height: 180,
    },
    container: {
        display: 'flex',
    },
    paper: {
        margin: theme.spacing(1),
    },
    svg: {
        width: 100,
        height: 100,
    },
    polygon: {
        fill: theme.palette.common.white,
        stroke: theme.palette.divider,
        strokeWidth: 1,
    },
    button: {
        height: "10%",
        width: "20%",
    },
    image: {
        position: 'relative',
        height: 200,
        [theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: '100% !important', // Overrides inline-style
        },
        '&:hover, &$focusVisible': {
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.15,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
    },
    imageSrc: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
    },
});

class FacialLogin extends React.Component {


    state = {
        visible: true,
    }

    componentDidMount() {
        removeLocalStorage("userid");
        removeToken();
        removeUser();
    }

    handleRegisterClick = () => {
        const { history } = this.props;
        this.setState({ visible: false })
        setTimeout(function () {
            history.push('/register');
        }, 500);
    }
    
    handleFacialLoginClick = () => {
        const { history } = this.props;
        this.setState({ visible: false })
        setTimeout(function () {
            history.push('/faciallogin');
        }, 500);
    }

    render() {
        const { classes } = this.props;
        const { visible } = this.state;
        return (
            <div>
                <Animated animationIn="fadeIn" animationOut="fadeOut" isVisible={true}>
                    <Paper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: "100vh", backgroundImage: `url(${BackGroundImage})` }}>
                        <div>
                            <Grid
                                container
                                spacing={5}
                                direction="row"
                                justify="center"
                                alignItems="center"
                            >
                                <Grid item>
                                    <Animated animationInDelay={500} animationIn="bounceInLeft" animationOut="fadeOut" isVisible={visible}>
                                        <ButtonBase
                                            focusRipple
                                            className={classes.image}
                                            focusVisibleClassName={classes.focusVisible}
                                            style={{
                                                width: 450,
                                                height: 450,
                                            }}
                                            onClick={this.handleRegisterClick}
                                        >
                                            <span
                                                className={classes.imageSrc}
                                                style={{
                                                    backgroundImage: `url(${RegisterImage})`,
                                                }}
                                            />
                                        </ButtonBase>
                                    </Animated>
                                </Grid>
                                <Grid item>
                                    <Animated animationInDelay={500} animationIn="bounceInRight" animationOut="fadeOut" isVisible={visible}>
                                        <ButtonBase
                                            focusRipple
                                            className={classes.image}
                                            focusVisibleClassName={classes.focusVisible}
                                            style={{
                                                width: 450,
                                                height: 450,
                                            }}
                                            onClick={this.handleFacialLoginClick}
                                        >
                                            <span
                                                className={classes.imageSrc}
                                                style={{
                                                    backgroundImage: `url(${LoginImage})`,
                                                }}
                                            />
                                        </ButtonBase>
                                    </Animated>
                                </Grid>
                            </Grid>
                        </div>
                    </Paper>
                </Animated>
            </div>
        );
    }
}

export default withStyles(styles)(FacialLogin);
