import React from 'react';
import { Bell } from 'lucide-react';
import useNotificationStore from '../store/notificationStore';

const NotificationBell = () => {
  const unreadCount = useNotificationStore(state => state.unreadCount);
  return (
    <button className="relative p-2 hover:text-blue-500 transition-colors">
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
