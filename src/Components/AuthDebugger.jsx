
import React from 'react';
import { useAuth } from './context/AuthContext';

export const AuthDebugger = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    authError, 
    lastVerified,
    getAuthStatus,
    verifyTokenValidity,
    forceRecheck 
  } = useAuth();

  const handleVerify = async () => {
    console.log('🔍 Verifying token validity...');
    const result = await verifyTokenValidity();
    console.log('Token verification result:', result);
    alert(`Token valid: ${result.valid}`);
  };

  const handleStatus = () => {
    const status = getAuthStatus();
    console.log('📊 Auth status:', status);
    alert('Check console for detailed auth status');
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shopspher.com';

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#f5f5f5',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4>🔐 Auth Debugger</h4>
      <div>
        <strong>API Base:</strong> {API_BASE_URL}
      </div>
      <div>
        <strong>Status:</strong> {isLoading ? '⏳ Loading' : isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
      </div>
      {user && (
        <div>
          <strong>User:</strong> {user.email}
        </div>
      )}
      {authError && (
        <div>
          <strong>Error:</strong> {authError}
        </div>
      )}
      {lastVerified && (
        <div>
          <strong>Last verified:</strong> {new Date(lastVerified).toLocaleTimeString()}
        </div>
      )}
      <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexDirection: 'column' }}>
        <button onClick={handleVerify} style={{ padding: '2px 5px', fontSize: '10px' }}>
          Verify Token
        </button>
        <button onClick={handleStatus} style={{ padding: '2px 5px', fontSize: '10px' }}>
          Get Status
        </button>
        <button onClick={forceRecheck} style={{ padding: '2px 5px', fontSize: '10px' }}>
          Force Recheck
        </button>
      </div>
    </div>
  );
};