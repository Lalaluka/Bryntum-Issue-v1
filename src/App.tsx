import React, { FunctionComponent, useRef, useState, useEffect } from 'react';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerproProps } from './SchedulerProConfig';
import './App.scss';

interface Event {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    duration: number;
    durationUnit: string;
    iconCls: string;
    eventColor: string;
}

interface Resource {
    id: number;
    name: string;
    iconCls: string;
    image: boolean;
}

interface Assignment {
    resourceId: number;
    eventId: number;
}   



const App: FunctionComponent = () => {
    const schedulerpro = useRef<BryntumSchedulerPro>(null);
    const [data, setData] = useState<{
        events: Event[];
        resources: Resource[];
        assignments: Assignment[];
    }>({
        events: [],
        resources: [],
        assignments: [],
    });

    const handleEventDragStart = (event: any) => {
        // Store the original event data before drag
        const eventRecord = event.eventRecords?.[0] || event.eventRecord;
        if (eventRecord) {
            event.context = event.context || {};
            event.context.originalStartDate = eventRecord.startDate;
            event.context.originalEndDate = eventRecord.endDate;
            event.context.originalResourceId = eventRecord.resourceId;
        }
    };

    const handleEventDrop = async (event: any) => {
        const eventRecord = event.eventRecords?.[0] || event.eventRecord;
        if (!eventRecord) return;
        
        const confirmed = window.confirm(
            `Do you want to move "${eventRecord.name}" to this new position?`
        );

        if (!confirmed && event.context) {
            // Revert the changes if user cancels
            eventRecord.set({
                startDate: event.context.originalStartDate,
                endDate: event.context.originalEndDate,
                resourceId: event.context.originalResourceId
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data.json');
                const jsonData = await response.json();

                console.log(jsonData);

                setData({
                    events: jsonData.events,
                    resources: jsonData.resources,
                    assignments: jsonData.assignments,
                });
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        fetchData();
    }, []);

    return (
                <BryntumSchedulerPro
                    ref={schedulerpro}
                    {...schedulerproProps}
                    events={data.events}
                    resources={data.resources}
                    assignments={data.assignments}
                    // when activating the nested events feature no assignments are shown on the gantt anymore
                    nestedEventsFeature
                    onEventDragStart={handleEventDragStart}
                    onEventDrop={handleEventDrop}
                />
    );
};

export default App;