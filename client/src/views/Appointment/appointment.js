import React from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import ReactSelect from 'react-select'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss'
import "react-big-calendar/lib/css/react-big-calendar.css";
import { withStyles } from '@material-ui/styles';
import {
  Button, Dialog, FormControl, Paper, Box, Slide, AppBar, IconButton, Toolbar, Typography, Grid, DialogContent
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Swal from 'sweetalert2';
import AppLayout from '../../layout/app'
import { fetchAPI } from '../../utils';
import SelectService from './Component/SelectService'
import './sweetalert.scss'

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar)

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  titleBar: {
    position: 'relative',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 600,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
});

class CalendarView extends React.Component {

  state = {
    eventOpen: false,
    categoryList: [],
    staffList: [],
    serviceStaffList: [],
    serviceList: [],
    clientList: [],
    selectedClient: null,
    events: [],
    editFlag: false,
    bookings: [{
      _id: null,
      start: null,
      end: null,
      staff: null,
      service: null,
      availableServiceList: []
    }],
    checkout: false,
  }


  async componentDidMount() {
    const staffList = await fetchAPI('GET', 'staffMgt/workingStaff');
    const serviceList = await fetchAPI('GET', 'serviceMgt/services');
    const events = await fetchAPI('GET', 'appointmentMgt/bookings');
    const clientList = await fetchAPI('GET', 'clientMgt/clients');
    const categoryList = await fetchAPI('GET', 'serviceMgt/category')
    let options = clientList.map(client => {
      return { value: client._id, label: client.displayName };
    })
    events.map(event => {
      event.start = new Date(event.start);
      event.end = new Date(event.end);
    })
    this.setState({
      staffList: staffList,
      serviceList: serviceList,
      clientList: options,
      events: events,
      appointment: null,
      categoryList: categoryList,
    });
  }

  handleSelectClientChange = (selectedOption) => {
    this.setState({
      selectedClient: selectedOption
    });
  };

  handleConfirmBookings = () => {
    const { bookings, selectedClient } = this.state
    if (bookings.length <= 0) {
      Swal.fire({
        customClass: {
          container: 'my-swal'
        },
        type: 'error',
        title: "Please Select Service !!!"
      })
    } else {
      for (let i = 0; i < bookings.length; i++) {
        if (!bookings[i].service) {
          Swal.fire({
            customClass: {
              container: 'my-swal'
            },
            type: 'error',
            title: "Please Select Service!!!"
          })
          return
        } else if (!bookings[i].staff) {
          Swal.fire({
            customClass: {
              container: 'my-swal'
            },
            type: 'error',
            title: "Please Select Staff!!!"
          })
          return
        }
      }
      if (!selectedClient) {
        Swal.fire({
          customClass: {
            container: 'my-swal'
          },
          type: 'error',
          title: "Please Select Customer!!!"
        })
        return
      }

      if (!this.state.editFlag) {
        let newbookings = bookings.map(booking => {
          booking.client = this.state.selectedClient.value
          delete booking._id
          return booking
        })
        this.submitNewBooking(newbookings)
      } else {
        let newbookings = bookings.map(booking => {
          booking.client = this.state.selectedClient.value
          return booking
        })
        this.submitUpdateBooking(newbookings)
      }
      this.handleEventClose()
    }
  }

  submitUpdateBooking(bookings) {
    if (bookings) {
      const { appointment } = this.state
      fetchAPI('PATCH', `appointmentMgt/appointment/${appointment._id}`, bookings).then(respObj => {
        if (respObj && respObj.ok) {
          let resBookings = respObj.bookings
          let filterIds = []
          resBookings.map(booking => {
            filterIds.push(booking._id)
          })
          var removedBookings = appointment.bookings.filter((e) => {
            return filterIds.indexOf(e._id) === -1
          })
          removedBookings.map(removedBooking => {
            const { events } = this.state
            let idx = events.findIndex(event => {
              return event.id === removedBooking._id
            })
            if (idx !== -1) {
              const nextEvents = [...events]
              nextEvents.splice(idx, 1)
              this.setState({
                events: nextEvents,
              })
            }
          })

          resBookings.map(resBooking => {
            let booking = {
              _id: resBooking._id,
              id: resBooking._id,
              title: resBooking.title,
              start: new Date(resBooking.start),
              end: new Date(resBooking.end),
              resourceId: resBooking.staff,
              client: resBooking.client,
              service: resBooking.service,
              appointment: resBooking.appointment
            }

            const { events } = this.state
            let idx = events.findIndex(event => {
              return event.id === booking.id
            })
            if (idx !== -1) {
              const nextEvents = [...events]
              nextEvents.splice(idx, 1, booking)
              this.setState({
                events: nextEvents,
              })
            } else {
              this.setState({
                events: this.state.events.concat([booking]),
              })
            }
          })
          if (this.state.checkout) {
            const { history } = this.props;
            history.push({
              pathname: "/checkout",
              state: {
                appointmentId: respObj.appointmentId
              }
            });
          }
        } else {
          Swal.fire({
            type: 'error',
            title: 'Fail to create booking'
          })
        }
      }).catch(err => {
        throw new Error(err)
      })
    } else {
      Swal.fire({
        type: 'error',
        title: 'No Booking found'
      })
    }
  }

  submitNewBooking(bookings) {
    fetchAPI('POST', 'appointmentMgt/appointment', bookings).then(respObj => {
      if (respObj && respObj.ok) {
        let resBookings = respObj.bookings
        resBookings.map(resBooking => {
          let booking = {
            id: resBooking._id,
            title: resBooking.title,
            start: new Date(resBooking.start),
            end: new Date(resBooking.end),
            resourceId: resBooking.staff,
            client: resBooking.client,
            service: resBooking.service,
            appointment: resBooking.appointment
          }
          this.setState({
            events: this.state.events.concat([booking]),
          })
        })
        if (this.state.checkout) {
          const { history } = this.props;
          history.push({
            pathname: "/checkout",
            state: {
              appointmentId: respObj.appointmentId
            }
          });
        }
      } else {
        Swal.fire({
          type: 'error',
          title: 'Fail to create booking'
        })
      }
    }).catch(err => {
      Swal.fire({
        type: 'error',
        title: err
      })
    })
  }

  handleEventClose = () => {
    this.setState({
      editFlag: false,
      eventOpen: false,
      selectedClient: null,
      bookings: [{
        _id: null,
        start: null,
        end: null,
        staff: null,
        service: null,
        availableServiceList: []
      }],
      serviceStaffList: []
    });
  }

  moveBooking = ({ event, start, end, resourceId }) => {
    const { events } = this.state

    const idx = events.indexOf(event)

    const updatedEvent = { ...event, start, resourceId, end }

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    let values = {
      start: updatedEvent.start,
      end: updatedEvent.end,
      staff: updatedEvent.resourceId,
    }
    this.handleUpdateBackendEvent(values, updatedEvent, nextEvents);
  };

  async handleUpdateBackendEvent(values, updatedEvent, nextEvents) {
    const respObj = await fetchAPI('PATCH', `appointmentMgt/bookings/${updatedEvent.id}`, values);
    if (respObj && respObj.ok) {
      this.setState({
        events: nextEvents,
      })
    } else { throw new Error('Fail to update booking') }
  }

  resizeBooking = ({ event, start, end }) => {
    const { events } = this.state

    const nextEvents = events.map(existingEvent => {
      return existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    });

    let values = {
      start: start,
      end: end,
    }
    this.handleUpdateBackendEvent(values, event, nextEvents)
  }

  newBooking = newBooking => {
    const booking = { ...this.state.bookings[0] }
    booking.start = newBooking.start
    booking._id = 0
    const bookings = [...this.state.bookings]
    bookings[0] = booking

    this.setState({
      eventOpen: true,
      bookings: bookings,
    });
  }

  handleEditEvent = async (event) => {
    if (event.client && event.service) {
      let appointment = await fetchAPI('GET', `appointmentMgt/appointment/${event.appointment}`)
      let idx = this.state.clientList.findIndex(client => {
        return client.value === event.client
      })
      for (let i = 0; i < appointment.bookings.length; i++) {
        appointment.bookings[i].availableServiceList = await fetchAPI('GET', `appointmentMgt/availableservice/${appointment.bookings[i].service.category}`)
      }
      this.setState({
        selectedClient: this.state.clientList[idx],
        bookings: appointment.bookings,
        appointment: appointment,
        editFlag: true,
        eventOpen: true,
      })
    } else {
      Swal.fire({
        type: 'error',
        title: "Unable to edit leave from booking. Please edit in staff page!!!"
      })
    }
  }

  deleteAppointment = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        container: 'my-swal'
      },
    }).then((result) => {
      const { appointment, events } = this.state
      if (result.value) {
        fetchAPI('DELETE', `appointmentMgt/appointment/${appointment._id}`).then((result) => {
          if (result && result.ok) {
            const nextEvents = [...events]
            for (let i = 0; i < appointment.bookings.length; i++) {
              let idx = nextEvents.findIndex(event => {
                return event.id === appointment.bookings[i]._id
              })
              nextEvents.splice(idx, 1)
              this.setState({
                events: nextEvents,
              })
            }
          }
          this.handleEventClose();
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
        })
      }
    })
  }

  handleAddBooking = () => {
    const booking = { ...this.state.bookings[this.state.bookings.length - 1] }
    if (typeof booking._id === "number") {
      booking._id = ++booking._id
    } else {
      booking._id = 0
    }

    booking.staff = null
    const bookings = [...this.state.bookings]
    bookings.push(booking)
    this.setState({
      eventOpen: true,
      bookings: bookings,
    });
  }

  handleRemoveBooking = (index) => {
    let bookings = [...this.state.bookings]
    bookings.splice(index, 1)
    this.setState({ bookings: bookings })
  }

  handleChangeBooking = async (event, id, type, child = null) => {

    const bookingIndex = this.state.bookings.findIndex(booking => {
      return booking._id === id
    })

    const booking = { ...this.state.bookings[bookingIndex] }
    if (type === "Time") {
      booking.start = event
    } else if (type === "Category") {
      booking.category = event.target.value
      let availableServiceList = await fetchAPI('GET', `appointmentMgt/availableservice/${booking.category}`)
      booking.availableServiceList = availableServiceList
    } else if (type === "Service") {
      let index = child.props.id;
      let service = this.state.serviceList[index]
      if (this.state.editFlag) {
        service.start = new Date(booking.start)
      } else {
        service.start = booking.start
      }
      service.end = new Date((service.start).getTime() + service.duration * 60000);
      booking.service = event.target.value
      booking.end = service.end
      booking.staff = null
      fetchAPI('POST', 'appointmentMgt/availablestaff', service).then((staffAvailable) => {
        if (staffAvailable.length === 0) {
          staffAvailable = [
            {
              "displayName": "No Staff Available"
            }
          ]
        }
        this.setState({
          serviceStaffList: staffAvailable,
        });
      });
    } else {
      booking.staff = event.target.value
    }

    const bookings = [...this.state.bookings]
    bookings[bookingIndex] = booking

    this.setState({
      bookings: bookings
    })
  }

  handleCheckOut = () => {
    this.setState({ checkout: true })
    this.handleConfirmBookings();
  }

  render() {
    const { classes } = this.props;
    return (
      <AppLayout title="Calendar" {...this.props} >
        <Paper> <Box p={2}>
          <DragAndDropCalendar
            selectable
            resizable
            localizer={localizer}
            events={this.state.events}
            onEventDrop={this.moveBooking}
            onEventResize={this.resizeBooking}
            onSelectSlot={this.newBooking}
            onSelectEvent={this.handleEditEvent}
            defaultView={Views.DAY}
            views={['day', 'week']}
            defaultDate={new Date()}
            step={15}
            timeslots={4}
            resources={this.state.staffList}
            resourceIdAccessor="_id"
            resourceTitleAccessor="displayName"
          // style={{ height: "100vh" }}
          />
          <Dialog fullScreen open={this.state.eventOpen} onClose={this.handleEventClose} TransitionComponent={Transition} >
            <AppBar className={classes.titleBar}>
              <Toolbar>
                <Typography variant="h6" className={classes.title}>
                  {!this.state.editFlag ? "New Appointment" : "Update Appointment"}
                </Typography>
                <IconButton edge="start" color="inherit" onClick={this.handleEventClose} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <DialogContent dividers="paper">
              <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                style={{ minHeight: 500 }}>
                {
                  !this.state.editFlag ?
                    this.state.bookings.map((booking, index) =>
                      <SelectService key={booking._id} category={booking.category}
                        staff={booking.staff} service={booking.service} start={booking.start}
                        staffList={this.state.serviceStaffList} serviceList={booking.availableServiceList}
                        categoryList={this.state.categoryList}
                        changeTime={(event) => this.handleChangeBooking(event, booking._id, "Time")}
                        changeService={(event, child) => this.handleChangeBooking(event, booking._id, "Service", child)}
                        changeStaff={(event) => this.handleChangeBooking(event, booking._id, "Staff")}
                        changeCategory={(event) => this.handleChangeBooking(event, booking._id, "Category")}
                        removeBooking={() => this.handleRemoveBooking(index)}
                      />
                    )
                    :
                    this.state.bookings.map((booking, index) =>
                      <SelectService key={booking._id} category={booking.service.category}
                        staff={booking.staff} service={booking.service._id} start={booking.start}
                        staffList={this.state.staffList} serviceList={booking.availableServiceList}
                        categoryList={this.state.categoryList}
                        changeTime={(event) => this.handleChangeBooking(event, booking._id, "Time")}
                        changeService={(event, child) => this.handleChangeBooking(event, booking._id, "Service", child)}
                        changeStaff={(event) => this.handleChangeBooking(event, booking._id, "Staff")}
                        changeCategory={(event) => this.handleChangeBooking(event, booking._id, "Category")}
                        removeBooking={() => this.handleRemoveBooking(index)}
                      />
                    )
                }

                <FormControl className={classes.formControl}>
                  <ReactSelect
                    onChange={this.handleSelectClientChange}
                    options={this.state.clientList}
                    value={this.state.selectedClient}
                    placeholder={"Please Select a Customer..."}
                  />
                </FormControl>

                <IconButton color="primary" onClick={this.handleAddBooking} aria-label="close">
                  <AddIcon fontSize="large" />
                </IconButton>

              </Grid>

              {
                !this.state.editFlag ?
                  (
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="flex-end"
                      spacing={10}>
                      <Grid item xs={3}>
                        <Button fullWidth variant="contained" color="primary" onClick={this.handleConfirmBookings}>
                          Save Appointment
                        </Button>
                      </Grid>
                      <Grid item xs={3}>
                        <ColorButton fullWidth variant="contained" color="primary" onClick={this.handleCheckOut}>
                          Express Checkout
                        </ColorButton>
                      </Grid>
                    </Grid>
                  )
                  :
                  (
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="flex-end"
                      spacing={10}>
                      <Grid item xs={3}>
                        <Button fullWidth variant="contained" color="secondary"
                          onClick={this.deleteAppointment}>
                          Delete
                        </Button>
                      </Grid>
                      <Grid item xs={3}>
                        <Button fullWidth variant="contained" color="primary" onClick={this.handleConfirmBookings}>
                          Update Appointment
                        </Button>
                      </Grid>
                      <Grid item xs={3}>
                        <ColorButton fullWidth variant="contained" color="primary" onClick={this.handleCheckOut}>
                          Checkout
                        </ColorButton>
                      </Grid>
                    </Grid>
                  )
              }
            </DialogContent>
          </Dialog>
        </Box>
        </Paper>
      </AppLayout>
    );
  }
}

const ColorButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(green[600]),
    backgroundColor: green[600],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
}))(Button);

export default withStyles(styles)(CalendarView);
