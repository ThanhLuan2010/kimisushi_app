import { useCallback, useEffect, useState } from 'react';
import { ordersApi } from '@/services/api';
import type { Reservation, ReservationStatus } from '@/types';
import { addNotificationListener } from '@/services/notifications';

import moment from 'moment';

function parseDateTime(dateStr?: string, timeStr?: string, createdAtStr?: string): string {
  if (dateStr) {
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const cleanTime = timeStr || '00:00';
    const combined = `${cleanDate} ${cleanTime}`;

    const parsed = moment(combined, [
      'YYYY-MM-DD HH:mm',
      'YYYY-MM-DD HH:mm:ss',
      'DD.MM.YYYY HH:mm',
      'DD/MM/YYYY HH:mm',
      'YYYY-MM-DD',
    ]);

    if (parsed.isValid()) {
      return parsed.toISOString();
    }
  }

  if (createdAtStr && moment(createdAtStr).isValid()) {
    return moment(createdAtStr).toISOString();
  }

  return moment().toISOString();
}

function apiToAppReservation(apiItem: any): Reservation {
  const dateStr = apiItem.date || apiItem.pickupDate || apiItem.reservationDate;
  const timeStr = apiItem.time || apiItem.pickupTime || apiItem.reservationTime;
  const createdAtStr = apiItem.createdAt || apiItem.created_at;

  const arrivalTime = parseDateTime(dateStr, timeStr, createdAtStr);

  return {
    id: apiItem.id || apiItem._id,
    customerName: apiItem.name || apiItem.customerName || 'Khách hàng',
    customerPhone: apiItem.phone || apiItem.customerPhone || '',
    arrivalTime,
    partySize: parseInt(apiItem.guests || apiItem.persons || '1', 10),
    note: apiItem.message || apiItem.notes || '',
    status: apiItem.status === 'neu' ? 'pending' : (apiItem.status as ReservationStatus),
    createdAt: createdAtStr || arrivalTime,
  };
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getAll({ type: 'reservation' });
      setReservations((res.items ?? []).map(apiToAppReservation));
    } catch (e: any) {
      console.warn('[useReservations] fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // ─── Real-time: Refresh on Push Notification ──────────────────────────────
  useEffect(() => {
    const sub = addNotificationListener((notification) => {
      console.log('[useReservations] Push notification received, refreshing reservations...');
      fetchReservations();
    });
    
    return () => { 
      sub.remove();
    };
  }, [fetchReservations]);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: ReservationStatus, tableId?: string) => {
    const backendStatus = status === 'pending' ? 'neu' : status;
    
    // Optimistic update
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status, tableId } : r));
    
    try {
      await ordersApi.updateStatus(id, backendStatus, tableId);
    } catch (e) {
      console.warn('[useReservations] Update status failed:', e);
      // Revert on failure by refetching
      fetchReservations();
    }
  };

  const acceptReservation = (id: string, tableId?: string) => updateStatus(id, 'confirmed', tableId);
  const cancelReservation = (id: string) => updateStatus(id, 'cancelled');

  return {
    reservations,
    loading,
    acceptReservation,
    cancelReservation,
    refresh: fetchReservations,
  };
}
