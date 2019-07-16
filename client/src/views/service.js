import React from 'react';
import Picky from 'react-picky';
import 'react-picky/dist/picky.css';

import { withStyles } from '@material-ui/styles';
import {
  Typography, Grid
} from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";

import { fetchAPI } from '../utils';
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

const columns = [
  {
    name: "name",
    label: "Service Name",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "price",
    label: "Price($)",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "duration",
    label: "Duration(min)",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "user",
    label: "Staff Name",
    options: {
      filter: false,
      sort: true,
    }
  },
];

class Service extends React.Component {
  
  constructor() {
    super();
    this.state = { serviceList: [] };
  }

  async componentDidMount() {
    let services = await fetchAPI('GET', 'serviceMgt/services');

    for(let i =0; i<services.length;i++)
    {
        let tempUsers="";
        for(let j=0; j<services[i].user.length;j++)
        {
            tempUsers += services[i].user[j].displayName + ", ";
        }
        services[i].user = tempUsers;
    }
    this.setState({ serviceList: services });
  }

  handleAddStaff = () => {
    const { history } = this.props;
    history.push('/newstaff');
  }

  handleRowClick = (data) => {
    const { history } = this.props;
    history.push({
      pathname: "/staffdetail",
      state: {
        data: data
      }
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <AppLayout title="Service" {...this.props} >
        <Grid container justify="flex-end" spacing={32} >
          <Grid item xs={12}>
            <MUIDataTable
              title="Service List"
              data={ this.state.serviceList }
              columns={columns}
              options={{
                customToolbar: () => {
                  return (
                    <Tooltip title={"Add Service"}>
                      <IconButton onClick={this.handleAddStaff}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  );
                },
                onRowClick: rowData => {
                  this.handleRowClick(rowData);
                },
                onRowsDelete: rowsDeleted => {
                  this.handleRowDelete(rowsDeleted.data);
                },
                filterType: 'checkbox',
              }}
            />
          </Grid>
        </Grid>
      </AppLayout>
    );
  }
}

export default withStyles(styles)(Service);
