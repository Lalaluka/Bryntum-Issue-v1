import React from 'react';

interface ChangeConfirmationModalProps {
    isOpen: boolean;
    eventName: string;
    originalData: {
        startDate: string;
        endDate: string;
        resourceName?: string;
    };
    newData: {
        startDate: string;
        endDate: string;
        resourceName?: string;
    };
    onAccept: () => void;
    onReject: () => void;
}

const ChangeConfirmationModal: React.FC<ChangeConfirmationModalProps> = ({
    isOpen,
    eventName,
    originalData,
    newData,
    onAccept,
    onReject
}) => {
    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '90%'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                    Confirm Event Changes
                </h3>
                
                <p style={{ marginBottom: '20px' }}>
                    Do you want to apply the changes to <strong>"{eventName}"</strong>?
                </p>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '20px',
                    marginBottom: '25px'
                }}>
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '4px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Original</h4>
                        <div><strong>Start:</strong> {formatDate(originalData.startDate)}</div>
                        <div><strong>End:</strong> {formatDate(originalData.endDate)}</div>
                        {originalData.resourceName && (
                            <div><strong>Resource:</strong> {originalData.resourceName}</div>
                        )}
                    </div>
                    
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#e7f3ff', 
                        borderRadius: '4px',
                        border: '1px solid #b3d9ff'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>New</h4>
                        <div><strong>Start:</strong> {formatDate(newData.startDate)}</div>
                        <div><strong>End:</strong> {formatDate(newData.endDate)}</div>
                        {newData.resourceName && (
                            <div><strong>Resource:</strong> {newData.resourceName}</div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        onClick={onReject}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reject
                    </button>
                    <button
                        onClick={onAccept}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeConfirmationModal;
