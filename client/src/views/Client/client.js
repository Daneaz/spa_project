import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
  Grid,
} from '@material-ui/core';
import AppLayout from '../../layout/app'
import MUIDataTable from "mui-datatables";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/PersonAdd";
import Swal from 'sweetalert2';
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
    name: "displayName",
    label: "Display Name",
    options: {
      filter: true,
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
    name: "email",
    label: "Email",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "credit",
    label: "Credit",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "gender",
    label: "Gender",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "nric",
    label: "NRIC",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "createdAt",
    label: "Regitration Date",
    options: {
      filter: false,
      sort: true,
    }
  },
];

function replaceRange(s, start, end, substitute) {
  return s.substring(0, start) + substitute + s.substring(end);
}

class Client extends React.Component {

  state = {
    clientList: [],
  };

  async componentDidMount() {
    const clientList = await fetchAPI('GET', 'clientMgt/clients');
    clientList.map(client => {
      return client.nric = replaceRange(client.nric, 0, 5, "*****")
    })
    this.setState({ clientList: clientList });
  }

  handleAddClient = () => {
    const { history } = this.props;
    history.push('/newclient');
  }

  handleRowClick = (rowMeta) => {
    const { history } = this.props;
    history.push({
      pathname: "/clientdetail",
      state: {
        data: this.state.clientList[rowMeta.dataIndex]
      }
    });
  }
  async handleRowDelete(rowsDeleted) {
    try {
      const deleteObjList = rowsDeleted.map((row) => {
        return this.state.clientList[row.dataIndex]
      });
      const response = await fetchAPI('DELETE', 'clientMgt/clients', deleteObjList);
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
    return (
      <AppLayout title="Clients" {...this.props} >
        <Grid container justify="flex-end" spacing={32} >
          <Grid item xs={12}>
            <MUIDataTable
              title="Client List"
              data={this.state.clientList}
              columns={columns}
              options={{
                customToolbar: () => {
                  return (
                    <Tooltip title={"Add Client"}>
                      <IconButton onClick={this.handleAddClient}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  );
                },
                onRowClick: (rowData, rowMeta) => {
                  this.handleRowClick(rowMeta);
                },
                onRowsDelete: rowsDeleted => {
                  this.handleRowDelete(rowsDeleted.data);
                },
                filterType: 'checkbox',
                filter: false
              }}
            />
          </Grid>
        </Grid>
      </AppLayout>
    );
  }
}

export default withStyles(styles)(Client);
