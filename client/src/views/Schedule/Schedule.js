
import React from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss'
import "react-big-calendar/lib/css/react-big-calendar.css";

import AppLayout from '../../layout/app'
import { fetchAPI } from '../../utils';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar)


class Schedule extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
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
        this.setState({resourceMap: resourceList});
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

        const updatedEvent = { ...event, start, resourceId,  end, allDay }

        const nextEvents = [...events]
        nextEvents.splice(idx, 1, updatedEvent)

        this.setState({
            events: nextEvents,
        })
    };

    render() {
        return (
            <AppLayout title="Clients" {...this.props} >
                <DragAndDropCalendar
                    selectable
                    localizer={localizer}
                    events={this.state.events}
                    onEventDrop={this.moveEvent}
                    resizable
                    onEventResize={this.resizeEvent}
                    onSelectSlot={this.newEvent}
                    onDragStart={console.log}
                    defaultView={Views.DAY}
                    views={['day']}
                    defaultDate={new Date()}
                    step={15}
                    timeslots={4}
                    resources={this.state.resourceMap}
                    resourceIdAccessor="resourceId"
                    resourceTitleAccessor="resourceTitle"
                    // style={{ height: "100vh" }}
                />
            </AppLayout>
        );
    }
}

export default Schedule;
