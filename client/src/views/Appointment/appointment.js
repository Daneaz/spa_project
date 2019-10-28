import React from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss'
import "react-big-calendar/lib/css/react-big-calendar.css";
import { withStyles } from '@material-ui/styles';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, Input, MenuItem, FormControl, Select, Paper, Box, Slide, AppBar, Toolbarm, IconButton, Toolbar,
  Typography, Grid
} from '@material-ui/core';

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
    minWidth: 700,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
});

class CalendarView extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      eventOpen: false,
      staffList: [],
      serviceList: [],
      clientList: [],
      selectedStaff: {},
      selectedService: {},
      selectedClient: {},
      appointment: [],
      events: [],
      start: {},
      editFlag: false,
      selectedEvent: {},
      serviceCount: 1,
      bookingList: [],
    }
  }

  async componentDidMount() {
    const staffList = await fetchAPI('GET', 'staffMgt/workingStaff');
    const serviceList = await fetchAPI('GET', 'serviceMgt/services');
    const events = await fetchAPI('GET', 'appointmentMgt/bookings');
    const clientList = await fetchAPI('GET', 'clientMgt/clients');
    events.map(event => {
      event.start = new Date(event.start);
      event.end = new Date(event.end);
    })
    this.setState({
      staffList: staffList,
      serviceList: serviceList,
      clientList: clientList,
      events: events,
    });
  }

  handleSelectClientChange = (event) => {
    this.setState({
      selectedClient: event.target.value
    });
  };

  handleConfirmBookings = async () => {
    const { bookingList } = this.state
    if (bookingList.length <= 0) {
      Swal.fire({
        customClass: {
          container: 'my-swal'
        },
        type: 'error',
        title: "Please Select Service !!!"
      })
    } else {
      for (let i = 0; i < bookingList.length; i++) {
        if (!bookingList[i].staff) {
          Swal.fire({
            customClass: {
              container: 'my-swal'
            },
            type: 'error',
            title: "Please Select Staff!!!"
          })
          return
        } else if (!bookingList[i].service) {
          Swal.fire({
            customClass: {
              container: 'my-swal'
            },
            type: 'error',
            title: "Please Select Service!!!"
          })
          return
        }
      }
      let bookings = bookingList.map(booking => {
        booking.client = this.state.selectedClient
        return booking
      })
      if (!this.state.editFlag) {
        this.submitNewBooking(bookings)
      } else {
        this.submitUpdateBooking(bookings)
      }
      this.handleEventClose()
    }
  }

  submitUpdateBooking(bookings) {
    if (bookings && bookings[0].appointment) {
      fetchAPI('PATCH', `appointmentMgt/appointment/${bookings[0].appointment}`, bookings).then(respObj => {
        if (respObj && respObj.ok) {
          let resBookings = respObj.bookings
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
            let idx = null;
            for (let i = 0; i < events.length; i++) {
              if (events[i]._id === booking._id) {
                idx = i
                break
              }
            }
            if(idx !=null) {
              const nextEvents = [...events]
              nextEvents.splice(idx, 1, booking)
              this.setState({
                events: nextEvents
              })
            } else {
              this.setState({
                events: this.state.events.concat([booking]),
              })
            }
          })

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
      selectedStaff: {},
      selectedService: {},
      selectedClient: {},
      serviceCount: 1,
      bookingList: [],
    });
  }

  moveEvent = ({ event, start, end, resourceId }) => {
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

  resizeEvent = ({ event, start, end }) => {
    const { events } = this.state

    const nextEvents = events.map(existingEvent => {
      return existingEvent.id == event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    });

    let values = {
      start: start,
      end: end,
    }
    this.handleUpdateBackendEvent(values, event, nextEvents)
  }

  newEvent = newEvent => {
    for (let i = 0; i < this.state.staffList.length; i++) {
      if (this.state.staffList[i]._id === newEvent.resourceId) {
        this.setState({
          eventOpen: true,
          start: newEvent.start,
          selectedStaff: this.state.staffList[i]._id,
          selectedService: this.state.serviceList[0]._id
        });
      }
    }
  }

  handleEditEvent = async (event) => {

    if (event.client && event.service) {
      let appointment = await fetchAPI('GET', `appointmentMgt/appointment/${event.appointment}`)
      await this.setState({
        serviceCount: appointment.bookings.length,
        appointment: appointment,
        start: event.start,
        selectedEvent: event,
        selectedStaff: event.resourceId,
        selectedClient: event.client,
        selectedService: event.service
      });
      this.setState({
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
      if (result.value) {
        fetchAPI('DELETE', `appointmentMgt/appointment/${this.state.appointment._id}`).then(result => {
          if (result && result.ok) {
            this.handleEventClose();
            Swal.fire(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            )
          }
        })
      }
    })
  }

  handleAddBooking = () => {
    this.setState({ serviceCount: ++this.state.serviceCount })
  }

  addBookingCallback = (dataFromSelectedService) => {
    // flag to check if the user editing the booking which havent sumbit to backend
    let flag = false
    this.state.bookingList.map((booking, i) => {
      if (booking.id === dataFromSelectedService.id) {
        let newBookingList = [...this.state.bookingList]
        newBookingList[i] = dataFromSelectedService
        this.setState({ bookingList: newBookingList })
        flag = true
      }
    })
    if (!flag) {
      this.setState({
        bookingList: this.state.bookingList.concat(dataFromSelectedService)
      })
    }
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
            onEventDrop={this.moveEvent}
            onEventResize={this.resizeEvent}
            onSelectSlot={this.newEvent}
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
                  New Appointment
                </Typography>
                <IconButton edge="start" color="inherit" onClick={this.handleEventClose} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              style={{ minHeight: 500 }}
            >

              {
                this.state.editFlag ?
                  Array.from(Array(this.state.serviceCount).keys()).map((_, i) =>
                    <SelectService id={i} addBooking={this.addBookingCallback}
                      edit={this.state.editFlag} booking={this.state.appointment.bookings[i]} start={this.state.start}/>
                  )
                  :
                  Array.from(Array(this.state.serviceCount).keys()).map((_, i) =>
                    <SelectService id={i} addBooking={this.addBookingCallback}
                      edit={this.state.editFlag} start={this.state.start} />
                  )
              }

              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">Customer Name</InputLabel>
                <Select
                  value={this.state.selectedClient}
                  onChange={this.handleSelectClientChange}
                  input={<Input id="age-native-simple" />}
                >
                  {this.state.clientList.map(client => (
                    <MenuItem value={client._id}>
                      {client.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton color="primary" onClick={this.handleAddBooking} aria-label="close">
                <AddIcon fontSize="large" />
              </IconButton>

              {
                !this.state.editFlag ?
                  <div>
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="flex-end"
                      spacing={10}>
                      <Grid item xs={12}>
                        <Button fullWidth variant="contained" color="primary" onClick={this.handleConfirmBookings}>
                          Confirm
                        </Button>
                      </Grid>
                    </Grid>
                  </div>
                  :
                  <div>
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="flex-end"
                      spacing={10}>
                      <Grid item xs={6}>
                        <Button fullWidth variant="contained" color="secondary"
                          onClick={this.deleteAppointment}>
                          Delete
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button fullWidth variant="contained" color="primary" onClick={this.handleConfirmBookings}>
                          Update
                        </Button>
                      </Grid>
                    </Grid>
                  </div>
              }
            </Grid>
          </Dialog>
        </Box>
        </Paper>
      </AppLayout >


    );
  }
}

export default withStyles(styles)(CalendarView);
