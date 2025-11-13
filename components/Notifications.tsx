
import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';
import { BellIcon } from './Icons';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';


interface NotificationsProps {
    notifications: Notification[];
    onNotificationClick: (expatId: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onNotificationClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const notificationCount = notifications.length;

    const toggleDropdown = () => setIsOpen(!isOpen);
    
    const handleNotificationClick = (expatId: string) => {
        onNotificationClick(expatId);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button onClick={toggleDropdown} className="relative p-2 rounded-full hover:bg-gray-100">
                <BellIcon className="h-6 w-6 text-text-secondary" />
                {notificationCount > 0 && (
                     <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-red text-white text-xs font-bold">
                        {notificationCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-10">
                    <div className="p-3 border-b">
                        <h3 className="font-semibold text-text-primary">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notificationCount > 0 ? (
                            <ul>
                                {notifications.map(notification => (
                                    <li key={notification.id}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleNotificationClick(notification.expatId);}} className="block p-3 hover:bg-gray-50 border-b last:border-b-0">
                                            <p className="text-sm text-text-primary">{notification.message}</p>
                                            <p className="text-xs text-text-secondary mt-1">{formatDistanceToNow(parseISO(notification.date), { addSuffix: true })}</p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-text-secondary">
                                <p>No new notifications.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;