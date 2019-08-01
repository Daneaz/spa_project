import React from 'react';

import { withStyles } from '@material-ui/styles';
import {
  Typography, Grid
} from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";
import Swal from 'sweetalert2';
import { fetchAPI } from '../../utils';
import AppLayout from '../../layout/app'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

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
    name: "staff",
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
    this.state = {
      serviceList: [],
      displayServiceList: []
    };
  }

  getMuiTheme = () => createMuiTheme({
    overrides: {
      MUIDataTableBodyCell: {
        root: {
          width: "100px"
        },
      }
    }
  })

  async componentDidMount() {
    let displayService = await fetchAPI('GET', 'serviceMgt/services');
    let staffs = await fetchAPI('GET', 'staffMgt/totalstaffs');
    let services = displayService;

    displayService.map(service => {
      let tempStaffs = "";
      if (service.staff.length === staffs.total) {
        tempStaffs = "All Staff";
      } else {
        service.staff.map(staff => {
          tempStaffs += staff.displayName + ',';
        });
      }
      service.staff = tempStaffs;
    });
    this.setState({
      serviceList: services,
      displayServiceList: displayService
    });
  }

  handleAddStaff = () => {
    const { history } = this.props;
    history.push('/newservice');
  }

  handleRowClick = (rowMeta) => {
    const { history } = this.props;
    history.push({
      pathname: "/servicedetail",
      state: {
        data: this.state.serviceList[rowMeta.dataIndex]
      }
    });
  }

  async handleRowDelete(rowsDeleted) {
    try {
      const deleteObjList = rowsDeleted.map((row) => {
        return this.state.serviceList[row.dataIndex]
      });
      const response = await fetchAPI('DELETE', 'serviceMgt/services', deleteObjList);
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
      <AppLayout title="Service" {...this.props} >
        <Grid container justify="flex-end" spacing={32} >
          <Grid item xs={12}>
            <MuiThemeProvider theme={this.getMuiTheme()}>
              <MUIDataTable
                title="Service List"
                data={this.state.serviceList}
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
                  onRowClick: (rowData, rowMeta) => {
                    this.handleRowClick(rowMeta);
                  },
                  onRowsDelete: rowsDeleted => {
                    this.handleRowDelete(rowsDeleted.data);
                  },
                  filterType: 'checkbox',
                  filter: false,
                }}
              />
            </MuiThemeProvider>
          </Grid>
        </Grid>

      </AppLayout>
    );
  }
}

export default withStyles(styles)(Service);
