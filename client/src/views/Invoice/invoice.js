import React from 'react';
import { withStyles } from '@material-ui/styles';
import {
    Grid
} from '@material-ui/core';

import MUIDataTable from "mui-datatables";
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
});

const columns = [
    {
        name: "client.displayName",
        label: "Customer Name",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "paymentType",
        label: "Payment Method",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "discount",
        label: "Discount",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "addon",
        label: "Add-ons",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "total",
        label: "Total",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "createdAt",
        label: "Date",
        options: {
            filter: false,
            sort: true,
        }
    }
];

class Invoice extends React.Component {


    state = {
        invoiceList: [],
        displayServiceList: []
    };

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
        let invoiceList = await fetchAPI('GET', 'invoiceMgt/invoicelist');
        this.setState({
            invoiceList: invoiceList
        });
    }

    handleAddService = () => {
        const { history } = this.props;
        history.push('/newservice');
    }

    handleAddCategory = () => {
        const { history } = this.props;
        history.push('/newcategory');
    }

    handleRowClick = (rowMeta) => {
        const { history } = this.props;
        history.push({
            pathname: "/invoice/detail",
            state: {
                appointmentId: this.state.invoiceList[rowMeta.dataIndex].appointment
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
            <AppLayout title="Invoice" {...this.props} >
                <Grid container justify="flex-end" spacing={32} >
                    <Grid item xs={12}>
                        <MuiThemeProvider theme={this.getMuiTheme()}>
                            <MUIDataTable
                                title="Service List"
                                data={this.state.invoiceList}
                                columns={columns}
                                options={{
                                    onRowClick: (rowData, rowMeta) => {
                                        this.handleRowClick(rowMeta);
                                    },
                                    onRowsDelete: rowsDeleted => {
                                        this.handleRowDelete(rowsDeleted.data);
                                    },
                                    filterType: 'checkbox',
                                }}
                            />
                        </MuiThemeProvider>
                    </Grid>
                </Grid>
            </AppLayout>
        );
    }
}

export default withStyles(styles)(Invoice);
