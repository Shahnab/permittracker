
import React, { useState, useEffect } from 'react';
import { NotificationSettings, NotificationChannel } from '../types';

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
    setSettings({ ...settings, channels: newChannels });
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
                        Email (coming soon)
                    </label>
                </div>
            </div>
        </div>
        
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
