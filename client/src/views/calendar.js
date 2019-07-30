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
    minWidth: 120,
  },
});

class CalendarView extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      eventOpen: false,
      staffList: [],
      selectedStaff: {},
      events: [
        {
          id: 0,
          title: 'Board meeting',
          start: new Date(2019, 7, 29, 0, 0, 0),
          end: new Date(2019, 7, 29, 23, 59, 59),
          allDay: true,
          resourceId: "1",
        }
      ],
      newEvent: {},
    }
  }

  async componentDidMount() {
    const staffList = await fetchAPI('GET', 'staffMgt/workingStaff');
    this.setState({
      staffList: staffList,
    });
  }

  handleChange = event => {
    this.setState({ selectedStaff: event.target.value });
  };

  handleEventConfirm = () => {
    this.setState({ eventOpen: false });
    this.handleSelectService(this.state.newEvent)
  }

  handleEventClose = () => {
    this.setState({ eventOpen: false });
  }

  resizeEvent = ({ event, start, end }) => {
    const { events } = this.state

    const nextEvents = events.map(existingEvent => {
      return existingEvent.id == event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    })

    this.setState({
      events: nextEvents,
    })

    //alert(`${event.title} was resized to ${start}-${end}`)
  }

  newEvent = newEvent => {
    this.setState({ 
      eventOpen: true,
      newEvent: newEvent,
    });
  }


  async handleSelectService(event) {
    let idList = this.state.events.map(a => a.id)
    let newId = Math.max(...idList) + 1
    let hour = {
      id: newId,
      title: 'New Event',
      allDay: event.slots.length == 1,
      start: event.start,
      end: event.end,
      resourceId: event.resourceId,
    }
    this.setState({
      events: this.state.events.concat([hour]),
    })
  }
  
  deleteEvent = event => {
    const r = window.confirm("Would you like to remove this event?")
    if (r === true) {

      this.setState((prevState, props) => {
        const events = [...prevState.events]
        const idx = events.indexOf(event)
        events.splice(idx, 1);
        return { events };
      });
    }
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

    this.setState({
      events: nextEvents,
    })
  };

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
          <DialogTitle>Fill the form</DialogTitle>
          <DialogContent>
            <form className={classes.container}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">Age</InputLabel>
                <Select
                  value={this.state.selectedStaff}
                  onChange={this.handleChange}
                  input={<Input id="age-native-simple" />}
                >
                  {this.state.staffList.map(staff => (
                    <MenuItem key={staff._id} value={staff.displayName}>
                      {staff.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">Age</InputLabel>
                <Select
                  native
                  value={this.state.age}
                  onChange={this.handleChange('age')}
                  input={<Input id="age-native-simple" />}
                />
              </FormControl> */}
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
