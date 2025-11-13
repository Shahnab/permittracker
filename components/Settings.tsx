
import React, { useState, useEffect } from 'react';
import { NotificationSettings, NotificationChannel, ReminderInterval } from '../types';

interface SettingsProps {
  currentSettings: NotificationSettings;
  onSave: (newSettings: NotificationSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentSettings, onSave }) => {
  const [settings, setSettings] = useState<NotificationSettings>(currentSettings);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);
  
  const handleChannelChange = (channel: NotificationChannel) => {
    const newChannels = settings.channels.includes(channel)
      ? settings.channels.filter(c => c !== channel)
      : [...settings.channels, channel];
    
    // If email is being enabled and emailSettings doesn't exist, initialize it
    if (channel === 'email' && !settings.channels.includes('email')) {
      setSettings({ 
        ...settings, 
        channels: newChannels,
        emailSettings: settings.emailSettings || {
          sendCalendarInvites: true,
          reminderIntervals: ['30days']
        }
      });
    } else {
      setSettings({ ...settings, channels: newChannels });
    }
  };

  const handleReminderIntervalToggle = (interval: ReminderInterval) => {
    if (!settings.emailSettings) return;
    
    const intervals = settings.emailSettings.reminderIntervals;
    const newIntervals = intervals.includes(interval)
      ? intervals.filter(i => i !== interval)
      : [...intervals, interval];
    
    setSettings({
      ...settings,
      emailSettings: {
        ...settings.emailSettings,
        reminderIntervals: newIntervals
      }
    });
  };

  const handleSave = () => {
    onSave(settings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-1">Notification Settings</h2>
        <p className="text-sm md:text-base text-text-secondary mb-4 md:mb-6">Configure how and when you receive reminders.</p>

        {/* Master Toggle */}
        <div className="flex items-center justify-between py-4 border-b">
          <label htmlFor="enable-notifications" className="font-semibold text-text-primary">Enable Notifications</label>
          <div
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${settings.enabled ? 'bg-brand-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </div>
        </div>

        {/* Notification Channels */}
        <div className="py-4 border-b">
            <h3 className="font-semibold text-text-primary mb-2">Notification Channels</h3>
            <div className="space-y-2">
                <div className="flex items-center">
                    <input
                        id="inApp"
                        type="checkbox"
                        checked={settings.channels.includes('inApp')}
                        onChange={() => handleChannelChange('inApp')}
                        className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                        disabled={!settings.enabled}
                    />
                    <label htmlFor="inApp" className="ml-3 block text-sm text-text-primary">
                        In-App Notifications
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        id="email"
                        type="checkbox"
                        checked={settings.channels.includes('email')}
                        onChange={() => handleChannelChange('email')}
                        className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                        disabled={!settings.enabled}
                    />
                    <label htmlFor="email" className="ml-3 block text-sm text-text-primary">
                        Email with Calendar Integration
                    </label>
                </div>
            </div>
        </div>

        {/* Email & Calendar Settings */}
        {settings.channels.includes('email') && settings.emailSettings && (
          <div className="py-4 border-b bg-blue-50 -mx-4 md:-mx-6 px-4 md:px-6">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Email & Calendar Settings
            </h3>
            
            {/* Calendar Invites Toggle */}
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg">
              <div className="flex-1">
                <label htmlFor="calendar-invites" className="font-medium text-text-primary text-sm">Send Calendar Invites</label>
                <p className="text-xs text-text-secondary mt-1">Add permit expiry reminders directly to your calendar</p>
              </div>
              <div
                onClick={() => settings.emailSettings && setSettings({
                  ...settings,
                  emailSettings: {
                    ...settings.emailSettings,
                    sendCalendarInvites: !settings.emailSettings.sendCalendarInvites
                  }
                })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors flex-shrink-0 ml-4 ${settings.emailSettings.sendCalendarInvites ? 'bg-brand-primary' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.emailSettings.sendCalendarInvites ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </div>
            </div>

            {/* Reminder Intervals */}
            {settings.emailSettings.sendCalendarInvites && (
              <div className="bg-white p-3 rounded-lg">
                <label className="font-medium text-text-primary text-sm block mb-2">Calendar Reminder Intervals</label>
                <p className="text-xs text-text-secondary mb-3">Select when you want to receive calendar reminders before permit expiry</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '7days' as ReminderInterval, label: '7 days before' },
                    { value: '14days' as ReminderInterval, label: '14 days before' },
                    { value: '30days' as ReminderInterval, label: '30 days before' },
                    { value: '60days' as ReminderInterval, label: '60 days before' }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center">
                      <input
                        id={`interval-${value}`}
                        type="checkbox"
                        checked={settings.emailSettings!.reminderIntervals.includes(value)}
                        onChange={() => handleReminderIntervalToggle(value)}
                        className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                      />
                      <label htmlFor={`interval-${value}`} className="ml-2 block text-sm text-text-primary">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Calendar invites will be sent as .ics files compatible with Outlook, Google Calendar, and Apple Calendar</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Lead Time */}
        <div className="py-4">
            <h3 className="font-semibold text-text-primary mb-3">Reminder Lead Time</h3>
            <div className="flex space-x-4">
                {([30, 60, 90] as const).map(days => (
                    <button
                        key={days}
                        onClick={() => setSettings({ ...settings, leadTime: days })}
                        disabled={!settings.enabled}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            settings.leadTime === days
                                ? 'bg-brand-primary text-white'
                                : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {days} days
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
            {showSuccess && <p className="text-sm text-status-green mr-4">Settings saved successfully!</p>}
            <button
                onClick={handleSave}
                className="bg-brand-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
                Save
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
