import React from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss'
import "react-big-calendar/lib/css/react-big-calendar.css";
import { withStyles } from '@material-ui/styles';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, Input, MenuItem, FormControl, Select,
} from '@material-ui/core';
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
      selectedStaff: {},
      selectedService: {},
      events: [],
      newEvent: {},
    }
  }

  async componentDidMount() {
    const staffList = await fetchAPI('GET', 'staffMgt/workingStaff');
    const serviceList = await fetchAPI('GET', 'serviceMgt/services');
    const events = await fetchAPI('GET', 'bookingMgt/bookings');
    events.map(event => {
      event.start = new Date(event.start);
      event.end = new Date(event.end);
    })
    this.setState({
      staffList: staffList,
      serviceList: serviceList,
      events: events,
    });
  }

  handleSelectStaffChange = (event) => {
    this.setState({ selectedStaff: event.target.value });
  };

  handleSelectServiceChange = (event) => {
    this.setState({ selectedService: event.target.value });
  };

  handleEventConfirm = () => {
    this.setState({
      eventOpen: false,
    });
    this.submitNewBooking(this.state.newEvent)
  }


  async submitNewBooking(event) {
    let serviceName;
    for (let service of this.state.serviceList) {
      if (service._id === this.state.selectedService) {
        serviceName = service.name;
      }
    }
    let values = {
      serviceName: serviceName,
      allDay: event.slots.length == 1,
      start: event.start,
      end: event.end,
      staff: this.state.selectedStaff,
    }
    const respObj = await fetchAPI('POST', 'bookingMgt/bookings', values);
    if (respObj && respObj.ok) {
      let booking = {
        id: respObj.id,
        title: serviceName,
        allDay: event.slots.length == 1,
        start: event.start,
        end: event.end,
        resourceId: this.state.selectedStaff,
      }
      this.setState({
        events: this.state.events.concat([booking]),
      })
    } else { throw new Error('Fail to create booking') }

  }

  handleEventClose = () => {
    this.setState({
      eventOpen: false,
      selectedStaff: {},
      selectedService: {},
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



  deleteEvent = async event => {
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
  }

  render() {
    const { classes } = this.props;
    return (
      <AppLayout title="Calendar" {...this.props} >
        <DragAndDropCalendar
          selectable
          resizable
          localizer={localizer}
          events={this.state.events}
          onEventDrop={this.moveEvent}
          onEventResize={this.resizeEvent}
          onSelectSlot={this.newEvent}
          onSelectEvent={this.deleteEvent}
          // onDragStart={console.log}
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
        <Dialog disableBackdropClick disableEscapeKeyDown open={this.state.eventOpen} onClose={this.handleEventClose}>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogContent>
            <form className={classes.container}>
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
            <Button onClick={this.handleEventClose} color="secondary">
              Cancel
          </Button>
            <Button onClick={this.handleEventConfirm} color="primary">
              Ok
          </Button>
          </DialogActions>
        </Dialog>
      </AppLayout>


    );
  }
}

export default withStyles(styles)(CalendarView);
