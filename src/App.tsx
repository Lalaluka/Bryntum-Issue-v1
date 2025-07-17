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


const App: FunctionComponent = () => {
    const schedulerpro = useRef<BryntumSchedulerPro>(null);
    const [data, setData] = useState<{
        events: Event[];
        resources: Resource[];
    }>({
        events: [],
        resources: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data.json');
                const jsonData = await response.json();

                console.log(jsonData);

                setData({
                    events: jsonData.events,
                    resources: jsonData.resources,
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
                    // when activating the nested events feature no assignments are shown on the gantt anymore
                    // nestedEventsFeature={true}
                />
    );
};

export default App;