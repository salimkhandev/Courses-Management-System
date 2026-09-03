'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationManager() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check existing subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // In production, you would use your VAPID public key here
          // For local development, this is a placeholder
          'BEl62iUYgUivxIkv69yViEuiBIa-I4q2vK-SPNvgKYTnMYGzN7JX_9hNvEwJ5XIvWpFwJYFqCWojmKWqKvHjY'
        ),
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      setSubscription(subscription);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      await fetch('/api/notifications/subscribe', { method: 'DELETE' });
      setSubscription(null);
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!session || permission === 'denied') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {permission === 'default' && (
        <button
          onClick={requestPermission}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Bell className="w-4 h-4" />
          {loading ? 'Enabling...' : 'Enable Notifications'}
        </button>
      )}

      {permission === 'granted' && !subscription && (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Bell className="w-4 h-4" />
          {loading ? 'Subscribing...' : 'Subscribe to Updates'}
        </button>
      )}

      {subscription && (
        <button
          onClick={unsubscribeFromPush}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          <BellOff className="w-4 h-4" />
          Unsubscribe
        </button>
      )}
    </div>
  );
}