import React from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss'
import "react-big-calendar/lib/css/react-big-calendar.css";
import { withStyles } from '@material-ui/styles';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, Input, MenuItem, FormControl, Select, Paper, Box
} from '@material-ui/core';
import Swal from 'sweetalert2';
import AppLayout from '../layout/app'
import { fetchAPI } from '../utils';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar)

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 250,
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
      selectedClientName: {},
      events: [],
      newEvent: {},
      editEvent: false,
      selectedEvent: {},
    }
  }

  async componentDidMount() {
    const staffList = await fetchAPI('GET', 'staffMgt/workingStaff');
    const serviceList = await fetchAPI('GET', 'serviceMgt/services');
    const events = await fetchAPI('GET', 'bookingMgt/bookings');
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

  handleSelectStaffChange = (event) => {
    this.setState({ selectedStaff: event.target.value });
  };

  handleSelectServiceChange = (event) => {
    this.setState({ selectedService: event.target.value });
  };

  handleSelectClientChange = (event, child) => {
    this.setState({
      selectedClient: event.target.value,
      selectedClientName: child.props.children,
    });
  };

  handleEventConfirm = () => {
    this.setState({
      eventOpen: false,
    });
    this.submitNewBooking(this.state.newEvent)
  }


  async submitNewBooking(event) {
    let serviceName;
    let serviceDuration;
    for (let service of this.state.serviceList) {
      if (service._id === this.state.selectedService) {
        serviceName = service.name;
        serviceDuration = service.duration
      }
    }
    let endtime = new Date((event.start).getTime() + parseInt(serviceDuration) * 60000)
    let values = {
      serviceName: `${serviceName} ${this.state.selectedClientName}`,
      allDay: event.slots.length == 1,
      start: event.start,
      end: endtime,
      staff: this.state.selectedStaff,
      client: this.state.selectedClient,
      service: this.state.selectedService
      
    }
    const respObj = await fetchAPI('POST', 'bookingMgt/bookings', values);
    if (respObj && respObj.ok) {
      let bookingObj = respObj.booking
      let booking = {
        id: bookingObj._id,
        title: bookingObj.serviceName,
        allDay: bookingObj.allDay,
        start: new Date (bookingObj.start),
        end: new Date (bookingObj.end),
        resourceId: bookingObj.staff,
        client: bookingObj.client,
        service: bookingObj.service
      }
      this.setState({
        events: this.state.events.concat([booking]),
      })
      this.handleEventClose();
    } else { throw new Error('Fail to create booking') }

  }

  handleEventClose = () => {

    this.setState({
      editEvent: false,
      eventOpen: false,
      selectedStaff: {},
      selectedService: {},
      selectedClient: {},
    });
  }

  moveEvent = ({ event, start, end, resourceId, isAllDay: droppedOnAllDaySlot }) => {
    const { events } = this.state

    const idx = events.indexOf(event)
    let allDay = event.allDay

    if (!event.allDay && droppedOnAllDaySlot) {
      allDay = true
    } else if (event.allDay && !droppedOnAllDaySlot) {
      allDay = false
    }

    const updatedEvent = { ...event, start, resourceId, end, allDay }

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    let values = {
      allDay: allDay,
      start: updatedEvent.start,
      end: updatedEvent.end,
      staff: updatedEvent.resourceId,
    }
    this.handleUpdateBackendEvent(values, updatedEvent, nextEvents);
  };

  async handleUpdateBackendEvent(values, updatedEvent, nextEvents) {
    const respObj = await fetchAPI('PATCH', `bookingMgt/bookings/${updatedEvent.id}`, values);
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
          newEvent: newEvent,
          selectedStaff: this.state.staffList[i]._id,
          selectedService: this.state.serviceList[0]._id
        });
      }
    }
  }

  handleEditEvent = (event) => {

    if (event.client && event.service) {
      this.setState({
        editEvent: true,
        eventOpen: true,
        selectedEvent: event,
        selectedStaff: event.resourceId,
        selectedClient: event.client,
        selectedService: event.service
      });
    } else {
      Swal.fire({
        type: 'error',
        title: "Unable to edit leave from booking. Please edit in staff page!!!"
      })
    }
  }

  handleUpdateEvent = async () => {
    let event = this.state.selectedEvent;
    let serviceName;
    let serviceDuration;
    for (let service of this.state.serviceList) {
      if (service._id === this.state.selectedService) {
        serviceName = service.name;
        serviceDuration = service.duration
      }
    }
    let endtime = new Date((event.start).getTime() + parseInt(serviceDuration) * 60000)
    let values = {
      serviceName: `${serviceName} ${this.state.selectedClientName}`,
      start: event.start,
      end: endtime,
      staff: this.state.selectedStaff,
      client: this.state.selectedClient,
      service: this.state.selectedService
      
    }
    const respObj = await fetchAPI('PATCH', `bookingMgt/bookings/${event.id}`, values);
    if (respObj && respObj.ok) {
      this.setState((prevState, props) => {
        const events = [...prevState.events]
        const idx = events.indexOf(event)
        events.splice(idx, 1);
        return { events };
      });
      let bookingObj = respObj.booking
      let booking = {
        id: bookingObj._id,
        title: bookingObj.serviceName,
        allDay: bookingObj.allDay,
        start: new Date (bookingObj.start),
        end: new Date (bookingObj.end),
        resourceId: bookingObj.staff,
        client: bookingObj.client,
        service: bookingObj.service
      }
      this.setState({
        events: this.state.events.concat([booking]),
      })
      this.handleEventClose();
    } else { throw new Error('Fail to create booking') }
  }

  deleteEvent = async () => {
    let event = this.state.selectedEvent;
    const r = window.confirm("Would you like to remove this event?")
    if (r === true) {
      const response = await fetchAPI('DELETE', `bookingMgt/bookings/${event.id}`);
      if (response && response.ok) {
        this.setState((prevState, props) => {
          const events = [...prevState.events]
          const idx = events.indexOf(event)
          events.splice(idx, 1);
          return { events };
        });
      } else { throw new Error('Delete failed') }
    }
    this.handleEventClose();
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
          <Dialog open={this.state.eventOpen} onClose={this.handleEventClose}>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogContent>
              <form className={classes.container}>
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
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="age-native-simple">Staff Name</InputLabel>
                  <Select
                    value={this.state.selectedStaff}
                    onChange={this.handleSelectStaffChange}
                    input={<Input id="age-native-simple" />}
                  >
                    {this.state.staffList.map(staff => (
                      <MenuItem value={staff._id}>
                        {staff.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="age-native-simple">Service Type</InputLabel>
                  <Select
                    value={this.state.selectedService}
                    onChange={this.handleSelectServiceChange}
                    input={<Input id="age-native-simple" />}
                  >
                    {this.state.serviceList.map(service => (
                      <MenuItem value={service._id}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </form>
            </DialogContent>
            <DialogActions>
              {this.state.editEvent ?
                <Button onClick={this.deleteEvent} color="secondary">
                  Delete
                </Button> :
                <Button onClick={this.handleEventClose} color="secondary">
                  Cancel
                </Button>
              }
              {this.state.editEvent ?
                <Button onClick={this.handleUpdateEvent} color="primary">
                  Update
                </Button> :
                <Button onClick={this.handleEventConfirm} color="primary">
                  Ok
                </Button>
              }
            </DialogActions>
          </Dialog>
        </Box>
        </Paper>
      </AppLayout>


    );
  }
}

export default withStyles(styles)(CalendarView);
