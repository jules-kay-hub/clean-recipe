// src/hooks/useNetworkStatus.ts
// Hook for monitoring network connectivity

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    isInternetReachable: null,
    connectionType: null,
  });

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isOnline: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isOnline: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}
