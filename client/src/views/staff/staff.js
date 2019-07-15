import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
  Typography, Grid, Button
} from '@material-ui/core';
import Swal from 'sweetalert2';
import AppLayout from '../../layout/app'
import MUIDataTable from "mui-datatables";

import { fetchAPI } from '../../utils';

const styles = theme => ({
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
});

const columns = [
  {
    name: "username",
    label: "Userame",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "displayName",
    label: "Display Name",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "email",
    label: "Email",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "mobile",
    label: "Mobile",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "Role.name",
    label: "Role",
    options: {
      filter: true,
      sort: true,
    }
  },
];

class Staff extends React.Component {
  constructor() {
    super();
    this.state = { userList: [] };
  }

  async componentDidMount() {
    const response = await fetchAPI('GET', 'userMgt/users');
    this.setState({ userList: response });
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

  async handleRowDelete(rowsDeleted) {
    try {
      const deleteObjList = rowsDeleted.map((row) => {
        return this.state.userList[row.dataIndex]
      });
      const response = await fetchAPI('DELETE', 'userMgt/users', deleteObjList);
      if (response && response.ok) {
        alert("Clients are deleted");
      } else { throw new Error('Delete failed') }
    }
    catch (err) {
      Swal.fire({
        type: 'error',
        title: err.message
      })
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <AppLayout title="Staff List" {...this.props} >
        <Grid container justify="flex-end" spacing={32} >
          <div className={classes.row}>
            <Button
              color="primary"
              size="small"
              variant="outlined"
              onClick={this.handleAddStaff}
            >
              New Staff
              </Button>
          </div>
          <Grid item xs={12}>
            <MUIDataTable
              title="Client List"
              data={this.state.userList}
              columns={columns}
              options={{
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

export default withStyles(styles)(Staff);
