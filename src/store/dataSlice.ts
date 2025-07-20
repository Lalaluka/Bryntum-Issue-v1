import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

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

interface DataState {
    events: Event[];
    resources: Resource[];
    assignments: Assignment[];
    loading: boolean;
    error: string | null;
    updateCounter: number; // Add a counter to force re-renders
    pendingChange: {
        eventId: number;
        originalEvent: Partial<Event>;
        originalAssignment?: Assignment;
    } | null;
}

export const fetchData = createAsyncThunk(
    'data/fetchData',
    async () => {
        const response = await fetch('/data.json');
        return response.json();
    }
);

const initialState: DataState = {
    events: [],
    resources: [],
    assignments: [],
    loading: false,
    error: null,
    updateCounter: 0,
    pendingChange: null,
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        startPendingChange(state, action: PayloadAction<{ 
            eventId: number; 
            originalEvent: Partial<Event>; 
            originalAssignment?: Assignment;
            newEvent: Partial<Event>;
            newAssignment?: { eventId: number; resourceId: number };
        }>) {
            const { eventId, originalEvent, originalAssignment, newEvent, newAssignment } = action.payload;
            console.log('Redux: startPendingChange called with:', action.payload);
            
            // Store the original data for potential rollback
            state.pendingChange = {
                eventId,
                originalEvent,
                originalAssignment
            };
            
            // Apply the changes immediately
            const eventIndex = state.events.findIndex(event => event.id === eventId);
            if (eventIndex !== -1) {
                state.events[eventIndex] = {
                    ...state.events[eventIndex],
                    ...newEvent
                };
            }
            
            // Update assignment if provided
            if (newAssignment) {
                state.assignments = state.assignments.filter(assignment => assignment.eventId !== eventId);
                state.assignments.push({ eventId: newAssignment.eventId, resourceId: newAssignment.resourceId });
            }
            
            state.updateCounter += 1;
            console.log('Redux: Pending change started');
        },
        acceptPendingChange(state) {
            console.log('Redux: acceptPendingChange called');
            // Clear pending change - changes are already applied
            state.pendingChange = null;
            state.updateCounter += 1;
            console.log('Redux: Pending change accepted');
        },
        rejectPendingChange(state) {
            console.log('Redux: rejectPendingChange called');
            if (state.pendingChange) {
                const { eventId, originalEvent, originalAssignment } = state.pendingChange;
                
                // Revert event changes
                const eventIndex = state.events.findIndex(event => event.id === eventId);
                if (eventIndex !== -1) {
                    state.events[eventIndex] = {
                        ...state.events[eventIndex],
                        ...originalEvent
                    };
                }
                
                // Revert assignment changes
                if (originalAssignment) {
                    state.assignments = state.assignments.filter(assignment => assignment.eventId !== eventId);
                    state.assignments.push(originalAssignment);
                }
                
                state.pendingChange = null;
                state.updateCounter += 1;
                console.log('Redux: Pending change rejected and reverted');
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchData.fulfilled, (state, action) => {
                state.loading = false;
                // Remove resourceId from events since we're using assignments
                // Redux throws runtime error if we don't do this ?
                const eventsWithoutResourceId = action.payload.events.map((event: any) => {
                    const { resourceId, ...eventWithoutResourceId } = event;
                    return eventWithoutResourceId;
                });
                state.events = eventsWithoutResourceId;
                state.resources = action.payload.resources;
                state.assignments = action.payload.assignments;
                state.updateCounter += 1;
            })
            .addCase(fetchData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch data';
            });
    },
});

export const { startPendingChange, acceptPendingChange, rejectPendingChange } = dataSlice.actions;
export default dataSlice.reducer;