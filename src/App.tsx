import { FunctionComponent, useRef, useEffect } from 'react';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerproProps } from './SchedulerProConfig';
import { fetchData } from './store/dataSlice';
import EventChangeManager from './components/EventChangeManager';
import './App.scss';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

const App: FunctionComponent = () => {
    const schedulerpro = useRef<BryntumSchedulerPro>(null);
    const dispatch = useDispatch<ThunkDispatch<any, undefined, AnyAction>>();
    
    // Get data from Redux store
    const { events, resources, assignments, loading, error, updateCounter } = useSelector((state: any) => state.data);

    useEffect(() => {
        dispatch(fetchData());
    }, [dispatch]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const configs = {
        ...schedulerproProps,
        events,
        resources,
        assignments,
        nestedEventsFeature: true
    };

    return (
        <div className="App">
            <h1>Event Management Scheduler</h1>
            
            <EventChangeManager schedulerproRef={schedulerpro} />
            
            <BryntumSchedulerPro
                ref={schedulerpro}
                {...configs}
            />
        </div>
    );
};

export default App;
