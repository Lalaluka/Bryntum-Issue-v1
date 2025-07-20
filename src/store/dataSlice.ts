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
    // Removed resourceId since we're using assignments
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
}

// Async thunk for fetching data
export const fetchData = createAsyncThunk(
    'data/fetchData',
    async () => {
        const response = await fetch('/data.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        return jsonData;
    }
);

const initialState: DataState = {
    events: [],
    resources: [],
    assignments: [],
    loading: false,
    error: null,
    updateCounter: 0,
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state, action: PayloadAction<{ events: Event[]; resources: Resource[]; assignments: Assignment[] }>) {
            console.log(action.payload)
            state.events = action.payload.events;
            state.resources = action.payload.resources;
            state.assignments = action.payload.assignments;
        },
        updateEvent(state, action: PayloadAction<{ id: number; updates: Partial<Event> }>) {
            const { id, updates } = action.payload;
            console.log('Redux: updateEvent called with:', { id, updates });
            console.log('Redux: Current events before update:', state.events);
            
            const eventIndex = state.events.findIndex(event => event.id === id);
            console.log('Redux: Found event at index:', eventIndex);
            
            if (eventIndex !== -1) {
                // Create a new event object with the updates
                state.events[eventIndex] = {
                    ...state.events[eventIndex],
                    ...updates
                };
                console.log('Redux: Event after update:', state.events[eventIndex]);
                // Increment counter to force re-render
                state.updateCounter += 1;
                console.log('Redux: Update counter:', state.updateCounter);
            } else {
                console.log('Redux: Event not found with id:', id);
            }
        },
        updateSingleEventProperty(state, action: PayloadAction<{ id: number; property: keyof Event; value: any }>) {
            const { id, property, value } = action.payload;
            const eventIndex = state.events.findIndex(event => event.id === id);
            if (eventIndex !== -1) {
                (state.events[eventIndex] as any)[property] = value;
            }
        },
        updateEventAssignment(state, action: PayloadAction<{ eventId: number; resourceId: number }>) {
            const { eventId, resourceId } = action.payload;
            console.log('Redux: updateEventAssignment called with:', { eventId, resourceId });
            console.log('Redux: Current assignments before update:', state.assignments);
            
            // Remove existing assignment for this event
            state.assignments = state.assignments.filter(assignment => assignment.eventId !== eventId);
            // Add new assignment
            state.assignments.push({ eventId, resourceId });
            // Increment counter to force re-render
            state.updateCounter += 1;
            
            console.log('Redux: Assignments after update:', state.assignments);
            console.log('Redux: Update counter:', state.updateCounter);
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

export const { setData, updateEvent, updateSingleEventProperty, updateEventAssignment } = dataSlice.actions;
export default dataSlice.reducer;