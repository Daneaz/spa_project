import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import 'typeface-roboto';

import { getUser } from './utils';
import Login from './views/login';
import ErrorPage from './views/error';
import Dashboard from './views/dashboard';
import Calendar from './views/calendar';
import Client from './views/Client/client';
import NewClient from './views/Client/newClient';
import ClientDetail from './views/Client/clientDetail'
import Staff from './views/staff/staff';
import NewStaff from './views/staff/newStaff';
import StaffDetail from './views/staff/staffDetail';
import Service from './views/service';
import Message from './views/message';
import Report from './views/report';




function PrivateRoute({ component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={(props) => {
                props.user = getUser();
                if (props.user) { return <Component {...props} /> }
                else { return <Redirect to={{ pathname: "/login", state: { from: props.location } }} /> }
            }}
        />
    );
}

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#d32f2f',
        },
    }
});
function Routers() {

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route path="/login" component={Login} />
                    <PrivateRoute exact path="/" component={Dashboard} />
                    <PrivateRoute exact path="/dashboard" component={Dashboard} />
                    <PrivateRoute exact path="/calendar" component={Calendar} />
                    <PrivateRoute exact path="/client" component={Client} />
                    <PrivateRoute exact path="/staff" component={Staff} />
                    <PrivateRoute exact path="/service" component={Service} />
                    <PrivateRoute exact path="/message" component={Message} />
                    <PrivateRoute exact path="/report" component={Report} />
                    <PrivateRoute exact path="/newclient" component={NewClient} />
                    <PrivateRoute exact path="/newstaff" component={NewStaff} />
                    <PrivateRoute exact path="/clientdetail" component={ClientDetail} />
                    <PrivateRoute exact path="/staffdetail" component={StaffDetail} />
                    <Route component={ErrorPage} />
                </Switch>
            </Router>
        </ThemeProvider>
    )
}

ReactDOM.render(<Routers />, document.getElementById('root'));

serviceWorker.unregister();
