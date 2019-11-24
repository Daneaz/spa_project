import React from 'react';
import { withStyles } from '@material-ui/styles';

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts';

import {
  Paper
} from '@material-ui/core';

import AppLayout from '../Component/Layout/Layout'
import { fetchAPI } from '../utils';

const styles = theme => ({
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
});

class Dashboard extends React.Component {

  state = {
    bookingList: null,
    totalBookings: null,
  }

  async componentDidMount() {
    const response = await fetchAPI('GET', 'dashboardMgt/dashboard');
    response.totalBookings.map(booking => {
      booking._id = new Date(booking._id).toLocaleDateString()
    })
    console.log(response)
    this.setState({
      bookingList: response.bookingsByStaff,
      totalBookings: response.totalBookings
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <AppLayout title="Dashboard" {...this.props} >
        <Paper>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={this.state.totalBookings}
              margin={{
                top: 20, right: 40, left: 20, bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis dataKey="TotalBooking" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="TotalBooking" stroke="#8884d8" activeDot={{ r: 8 }} />
              {/* <Line type="monotone" dataKey="Bookings" stroke="#82ca9d" /> */}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper style={{ marginTop: 20 }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={this.state.bookingList}
              margin={{
                top: 20, right: 40, left: 20, bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="staff" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* <Bar dataKey="totalBookings" fill="#8884d8" /> */}
              <Bar dataKey="Bookings" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </AppLayout>
    );
  }
}

export default withStyles(styles)(Dashboard);
