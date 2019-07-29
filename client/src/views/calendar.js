import React from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss'
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Formik, Field, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import Swal from 'sweetalert2';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress
} from '@material-ui/core';
import AppLayout from '../layout/app'
import { fetchAPI } from '../utils';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar)

class CalendarView extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      eventOpen: false,
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
      resourceMap: []
    }

    this.moveEvent = this.moveEvent.bind(this)
    this.newEvent = this.newEvent.bind(this)
  }

  async componentDidMount() {
    const staffList = await fetchAPI('GET', 'staffMgt/staffs');
    let resourceList = staffList.map(function (staff) {
      return { resourceId: staff._id, resourceTitle: staff.displayName };
    })
    this.setState({ resourceMap: resourceList });
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

  newEvent(event) {
    this.setState({ eventOpen: true });
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
          // onDragStart={console.log}
          defaultView={Views.DAY}
          views={['day', 'week']}
          defaultDate={new Date()}
          step={15}
          timeslots={4}
          resources={this.state.resourceMap}
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"

        // style={{ height: "100vh" }}
        />
        <Dialog open={this.state.eventOpen} onClose={this.handleEventClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">New Appointment</DialogTitle>
          <DialogContent>
          <Formik
                        initialValues={{ username: '', password: '', confirmPassoword: '', mobile: '', email: '', }}
                        validate={values => {
                            const errors = {};
                            if (!values.username) { errors.username = 'Please enter username' }
                            if (!values.displayName) { errors.displayName = 'Please enter password' }
                            if (!values.mobile) { errors.mobile = 'Please enter mobile number' }
                            if (!values.email) { errors.email = 'Please enter email address' }
                            if (values.password !== values.confirmPassoword) { errors.confirmPassoword = 'Password does not match' }
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            try {
                                if (!this.state.selectedOption)
                                    throw new Error('Please select a role')
                                else {
                                    values.role = {};
                                    values.role.name = this.state.selectedOption.value;
                                    values.offDays = this.state.offDays;
                                    values.leaveDays = this.state.selectedLeaves;
                                }
                                const respObj = await fetchAPI('PATCH', `staffMgt/staffs/${this.props.location.state.data._id}`, values);

                                if (respObj && respObj.ok) {
                                    window.history.back();
                                } else { throw new Error('Update failed') }
                            } catch (err) {
                                Swal.fire({
                                    type: 'error', text: 'Please try again.',
                                    title: err.message
                                })
                            }
                            setSubmitting(false);
                        }}
                        render={({ submitForm, isSubmitting, values, setFieldValue, errors, setErrors }) => (
                            <Form>
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth autoFocus
                                    name="username" label="Username" disabled
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="password" label="New Passowrd" type="password"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="confirmPassoword" label="Confirm Password" type="password"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="displayName" label="Display Name"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="mobile" label="Mobile" type="number"
                                />
                                <Field
                                    component={TextField} variant="outlined" margin="normal" fullWidth
                                    name="email" label="Email"
                                />
                                {isSubmitting && <LinearProgress />}
                            </Form>
                        )}
                    />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleEventClose} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </AppLayout>


    );
  }
}

export default CalendarView;
