import React, { FunctionComponent, useRef, useEffect, useCallback } from 'react';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerproProps } from './SchedulerProConfig';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchData, updateEvent, updateEventAssignment } from './store/dataSlice';
import ReduxDebugger from './components/ReduxDebugger';
import './App.scss';

const App: FunctionComponent = () => {
    const schedulerpro = useRef<BryntumSchedulerPro>(null);
    const dispatch = useAppDispatch();
    
    // Get data from Redux store
    const { events, resources, assignments, loading, error, updateCounter } = useAppSelector((state) => state.data);

    // Efficient single event updater using useCallback and Redux
    const updateSingleEvent = useCallback((eventId: number, updates: Record<string, any>) => {
        dispatch(updateEvent({ id: eventId, updates }));
    }, [dispatch]);

    const handleEventDragStart = (event: any) => {
        // Store the original event data before drag
        const eventRecord = event.eventRecords?.[0] || event.eventRecord;
        if (eventRecord) {
            event.context = event.context || {};
            event.context.originalStartDate = eventRecord.startDate;
            event.context.originalEndDate = eventRecord.endDate;
            // For assignments, store the original resource assignment
            const assignment = assignments.find(a => a.eventId === eventRecord.id);
            event.context.originalResourceId = assignment?.resourceId;
        }
    };

    const handleAfterEventDrop = (event: any) => {
        const eventRecord = event.eventRecords?.[0] || event.eventRecord;
        if (!eventRecord) return;
        
        console.log('Event drop data:', {
            eventRecord,
            eventId: eventRecord.id,
            resourceId: eventRecord.resourceId,
            resource: eventRecord.resource,
            assignments: eventRecord.assignments,
            context: event.context
        });
        
        const confirmed = window.confirm(
            `Do you want to move "${eventRecord.name}" to this new position?`
        );

        if (confirmed) {
            // Convert dates to match the original format "2022-03-23T03:00"
            const formatDateToOriginal = (date: any): string => {
                if (date instanceof Date) {
                    // Use local time instead of UTC to avoid timezone offset issues
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                }
                return date;
            };
            
            const startDateString = formatDateToOriginal(eventRecord.startDate);
            const endDateString = formatDateToOriginal(eventRecord.endDate);
            
            console.log('Updating event with dates:', {
                eventId: eventRecord.id,
                originalStartDate: eventRecord.startDate,
                originalEndDate: eventRecord.endDate,
                convertedStartDate: startDateString,
                convertedEndDate: endDateString
            });
            
            // Update the event timing
            updateSingleEvent(eventRecord.id, {
                startDate: startDateString,
                endDate: endDateString
            });
            
            // Try multiple ways to get the new resource ID
            const newResourceId = eventRecord.resourceId || 
                                 eventRecord.resource?.id || 
                                 eventRecord.assignments?.[0]?.resourceId ||
                                 event.newResource?.id;
            
            console.log('Resource change detection:', {
                newResourceId,
                originalResourceId: event.context?.originalResourceId,
                willUpdate: newResourceId && newResourceId !== event.context?.originalResourceId
            });
            
            // Update the assignment if resource changed
            if (newResourceId && newResourceId !== event.context?.originalResourceId) {
                console.log('Updating assignment:', { eventId: eventRecord.id, resourceId: newResourceId });
                dispatch(updateEventAssignment({ 
                    eventId: eventRecord.id, 
                    resourceId: newResourceId 
                }));
            }
        } else if (event.context) {
            // Revert the changes if user cancels
            eventRecord.set({
                startDate: event.context.originalStartDate,
                endDate: event.context.originalEndDate
            });
            
            // Revert resource assignment if it was changed
            if (event.context.originalResourceId) {
                const originalResource = schedulerpro.current?.instance?.resourceStore?.getById(event.context.originalResourceId);
                if (originalResource) {
                    eventRecord.set({ resource: originalResource });
                }
            }
        }
    };

    useEffect(() => {
        dispatch(fetchData());
    }, [dispatch]);

    // Update Bryntum data when Redux state changes
    useEffect(() => {
        if (schedulerpro.current?.instance && updateCounter > 0) {
            console.log('Manually updating Bryntum data from Redux state');
            const instance = schedulerpro.current.instance;
            
            // Update events
            instance.eventStore.data = events;
            
            // Update assignments
            instance.assignmentStore.data = assignments;
            
            console.log('Bryntum data updated');
        }
    }, [events, assignments, updateCounter]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            {/* Test button to manually trigger Redux update */}
            <div style={{ padding: '10px', backgroundColor: '#e0e0e0', marginBottom: '10px' }}>
                <button 
                    onClick={() => {
                        console.log('Manual test: updating event 1');
                        updateSingleEvent(1, {
                            startDate: "2022-03-23T04:00",
                            endDate: "2022-03-23T06:00"
                        });
                    }}
                    style={{ marginRight: '10px' }}
                >
                    Test Redux Update (Event 1)
                </button>
                <button 
                    onClick={() => {
                        console.log('Manual test: updating assignment');
                        dispatch(updateEventAssignment({ 
                            eventId: 1, 
                            resourceId: 2 
                        }));
                    }}
                >
                    Test Assignment Update (Event 1 → Resource 2)
                </button>
            </div>
            
            <BryntumSchedulerPro
                ref={schedulerpro}
                {...schedulerproProps}
                events={events}
                resources={resources}
                assignments={assignments}
                // when activating the nested events feature no assignments are shown on the gantt anymore
                nestedEventsFeature
                onEventDragStart={handleEventDragStart}
                onAfterEventDrop={handleAfterEventDrop}
            />
            
            <ReduxDebugger />
        </>
    );
};

export default App;