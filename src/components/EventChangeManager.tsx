import React, { useState, useEffect, useCallback } from 'react';
import { startPendingChange, acceptPendingChange, rejectPendingChange } from '../store/dataSlice';
import ChangeConfirmationModal from './ChangeConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';

interface EventChangeManagerProps {
    schedulerproRef: React.RefObject<any>;
}

const EventChangeManager: React.FC<EventChangeManagerProps> = ({ schedulerproRef }) => {
    const dispatch = useDispatch();
    const { events, resources, assignments, pendingChange } = useSelector((state: any) => state.data);
    
    const [modalData, setModalData] = useState<{
        isOpen: boolean;
        eventName: string;
        originalData: any;
        newData: any;
        originalAssignment?: any;
        newAssignment?: any;
    }>({
        isOpen: false,
        eventName: '',
        originalData: {},
        newData: {},
    });

    const handleEventDragStart = useCallback((event: any) => {
        // Store the original event data before drag
        const eventRecord = event.eventRecords?.[0] || event.eventRecord;
        if (eventRecord) {
            event.context = event.context || {};
            event.context.originalStartDate = eventRecord.startDate;
            event.context.originalEndDate = eventRecord.endDate;
            // For assignments, store the original resource assignment
            const assignment = assignments.find((a: any) => a.eventId === eventRecord.id);
            event.context.originalResourceId = assignment?.resourceId;
        }
    }, [assignments]);

    const handleAfterEventDrop = useCallback((event: any) => {
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
        
        const startDateString = formatDateToOriginal(eventRecord.startDate);
        const endDateString = formatDateToOriginal(eventRecord.endDate);
        
        // Get original assignment
        const originalAssignment = assignments.find((a: any) => a.eventId === eventRecord.id);
        const originalResourceName = originalAssignment ? 
            resources.find((r: any)  => r.id === originalAssignment.resourceId)?.name : 'None';
        
        // Get new resource info
        const newResourceId = eventRecord.resourceId || 
                             eventRecord.resource?.id || 
                             eventRecord.assignments?.[0]?.resourceId ||
                             event.newResource?.id;
        const newResourceName = newResourceId ? 
            resources.find((r: any) => r.id === newResourceId)?.name : 'None';
        
        // Prepare original and new data for modal
        const originalData = {
            startDate: formatDateToOriginal(event.context?.originalStartDate || eventRecord.startDate),
            endDate: formatDateToOriginal(event.context?.originalEndDate || eventRecord.endDate),
            resourceName: originalResourceName
        };
        
        const newData = {
            startDate: startDateString,
            endDate: endDateString,
            resourceName: newResourceName
        };
        
        // Start pending change
        dispatch(startPendingChange({
            eventId: eventRecord.id,
            originalEvent: {
                startDate: originalData.startDate,
                endDate: originalData.endDate
            },
            originalAssignment: originalAssignment,
            newEvent: {
                startDate: startDateString,
                endDate: endDateString
            },
            newAssignment: newResourceId && newResourceId !== originalAssignment?.resourceId ? 
                { eventId: eventRecord.id, resourceId: newResourceId } : undefined
        }));
        
        // Show modal
        setModalData({
            isOpen: true,
            eventName: eventRecord.name,
            originalData,
            newData,
            originalAssignment,
            newAssignment: newResourceId ? { eventId: eventRecord.id, resourceId: newResourceId } : undefined
        });
    }, [dispatch, assignments, resources]);

    const handleAcceptChange = useCallback(() => {
        dispatch(acceptPendingChange());
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, [dispatch]);

    const handleRejectChange = useCallback(() => {
        dispatch(rejectPendingChange());
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, [dispatch]);

    // Attach event listeners to the Bryntum SchedulerPro instance
    useEffect(() => {
        const scheduler = schedulerproRef.current?.instance;
        if (scheduler) {
            scheduler.on('eventdragstart', handleEventDragStart);
            scheduler.on('aftereventdrop', handleAfterEventDrop);
        }
    }, [schedulerproRef, handleEventDragStart, handleAfterEventDrop]);

    return (
        <>
            {/* Pending change indicator */}
            {pendingChange && (
                <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px'
                }}>
                    <strong>⏳ Pending Change:</strong> Event {pendingChange.eventId} has unsaved changes
                </div>
            )}

            {/* Bryntum Redux Desync indicator */}
            {events.length > 0 && (
                <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#cdffd0ff', 
                    border: '1px solid #a7ffc6ff',
                    borderRadius: '4px'
                }}>
                    <strong>ReduxState Event 1:</strong> Start: {events[0].startDate} End: {events[0].endDate} Resource: {assignments.find((a: any) => a.eventId === events[0].id)?.resourceId || 'None'} <br />
                    <strong>BryntumState Event 1:</strong> 
                    {schedulerproRef.current?.instance?.eventStore?.records?.[0] ? (
                        <>
                            {(() => {
                                const eventStore = schedulerproRef.current.instance.eventStore.records;
                                const event = eventStore.find((e: any) => e.id === 1);
                                if (!event) return 'Event 1 not found';
                                return (
                                    <>
                                        Start: {formatDateToOriginal(event.startDate)} 
                                        End: {formatDateToOriginal(event.endDate)} 
                                        Resource: {(() => {
                                            const assignmentStore = schedulerproRef.current.instance._assignmentStore;
                                            if (assignmentStore && assignmentStore._data && assignmentStore._data.length > 0) {
                                                const assignment = assignmentStore._data.find((a: any) => a.eventId === 1);
                                                return assignment ? assignment.resourceId : 'None';
                                            }
                                            return 'None';
                                        })()}
                                    </>
                                );
                            })()}
                        </>
                    ) : 'Loading...'}
                </div>  
            )}  

            {/* Change confirmation modal */}
            <ChangeConfirmationModal
                isOpen={modalData.isOpen}
                eventName={modalData.eventName}
                originalData={modalData.originalData}
                newData={modalData.newData}
                onAccept={handleAcceptChange}
                onReject={handleRejectChange}
            />
        </>
    );
};

// Utility function to convert dates to match the original format "2022-03-23T03:00"
const formatDateToOriginal = (date: any): string => {
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return date;
};

export default EventChangeManager;
