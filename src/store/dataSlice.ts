import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DataState {
    events: any[];
    resources: any[];
    assignments: any[];
}

const initialState: DataState = {
    events: [],
    resources: [],
    assignments: [],
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state, action: PayloadAction<DataState>) {
            state.events = action.payload.events;
            state.resources = action.payload.resources;
            state.assignments = action.payload.assignments;
        },
    },
});

export const { setData } = dataSlice.actions;
export default dataSlice.reducer;