import React from 'react';
import { withStyles } from '@material-ui/styles';

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
} from 'recharts';

import {
  Paper
} from '@material-ui/core';

import AppLayout from '../Component/Layout/Layout'
import { Grid } from '@material-ui/core';

const styles = theme => ({
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
});

const data = [
  {
    name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
  },
  {
    name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
  },
  {
    name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
  },
  {
    name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
  },
  {
    name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
  },
  {
    name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
  },
  {
    name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
  },
];

class Dashboard extends React.Component {

  render() {
    const { classes } = this.props;
    return (
      <AppLayout title="Dashboard" {...this.props} >
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
        >
          <Grid
            container
            direction="row"
            justify="space-around"
            alignItems="center"
          >
            <Paper>
              <LineChart
                width={750}
                height={400}
                data={data}
                margin={{
                  top: 10, right: 10, left: 10, bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </Paper>
            <Paper>
              <BarChart
                width={750}
                height={400}
                data={data}
                margin={{
                  top: 10, right: 10, left: 10, bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
              </BarChart>
            </Paper>
          </Grid>
          <Grid
            container
            direction="row"
            justify="space-around"
            alignItems="center"
          >
            <Paper>
              <LineChart
                width={750}
                height={400}
                data={data}
                margin={{
                  top: 10, right: 10, left: 10, bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </Paper>
            <Paper>
              <BarChart
                width={750}
                height={400}
                data={data}
                margin={{
                  top: 10, right: 10, left: 10, bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
              </BarChart>
            </Paper>
          </Grid>
        </Grid>
      </AppLayout>
    );
  }
}

export default withStyles(styles)(Dashboard);
