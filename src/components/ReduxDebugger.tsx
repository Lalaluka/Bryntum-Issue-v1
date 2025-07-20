import React from 'react';
import { useAppSelector } from '../store/hooks';

const ReduxDebugger: React.FC = () => {
    const { events, resources, assignments, loading, error, updateCounter } = useAppSelector((state) => state.data);
    
    // Add a timestamp to help debug if the component is re-rendering
    const timestamp = new Date().toLocaleTimeString();

    return (
        <div style={{ 
            padding: '20px', 
            backgroundColor: '#f5f5f5', 
            border: '1px solid #ccc', 
            marginTop: '20px',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <h3>Redux Store Debug (Last updated: {timestamp})</h3>
            
            <div style={{ marginBottom: '15px' }}>
                <strong>Update Counter:</strong> {updateCounter}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <strong>Loading:</strong> {loading ? 'true' : 'false'}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <strong>Error:</strong> {error || 'null'}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <strong>Events ({events.length}):</strong>
                <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
                    {JSON.stringify(events, null, 2)}
                </pre>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <strong>Resources ({resources.length}):</strong>
                <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
                    {JSON.stringify(resources, null, 2)}
                </pre>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <strong>Assignments ({assignments.length}):</strong>
                <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
                    {JSON.stringify(assignments, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default ReduxDebugger;
