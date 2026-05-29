'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Sparkles,
  ListOrdered,
  Monitor,
  Lock,
  Save,
  Camera,
  Mail,
  Phone,
  Globe,
  Check,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';

/* ── Settings Sections ─────────────────────────────────────── */

type Section = 'profile' | 'notifications' | 'ai' | 'queue' | 'system' | 'security';

const sections: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" />, desc: 'Manage your personal information' },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, desc: 'Configure alert preferences' },
  { id: 'ai', label: 'AI Settings', icon: <Sparkles className="h-4 w-4" />, desc: 'AI routing configuration' },
  { id: 'queue', label: 'Queue Settings', icon: <ListOrdered className="h-4 w-4" />, desc: 'Request queue behavior' },
  { id: 'system', label: 'System Preferences', icon: <Monitor className="h-4 w-4" />, desc: 'General system settings' },
  { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" />, desc: 'Password and access control' },
];

/* ── Toggle Switch ─────────────────────────────────────────── */

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={clsx(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
        enabled ? 'bg-indigo-600' : 'bg-gray-300'
      )}
    >
      <span
        className={clsx(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-4.5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [saved, setSaved] = useState(false);

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [requestNotifs, setRequestNotifs] = useState(true);
  const [agentNotifs, setAgentNotifs] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminPageGuard>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your preferences and system configuration</p>
        </div>
        <button
          onClick={handleSave}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm',
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section Navigation */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={clsx(
                  'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0',
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <span className={clsx(
                  'p-1.5 rounded-md',
                  activeSection === section.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-400'
                )}>
                  {section.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{section.label}</p>
                  <p className="text-[11px] text-gray-400 truncate">{section.desc}</p>
                </div>
                <ChevronRight className={clsx(
                  'h-3.5 w-3.5 shrink-0',
                  activeSection === section.id ? 'text-indigo-400' : 'text-gray-300'
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Profile Settings</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    A
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@airouter.io</p>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1">Change Avatar</button>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" defaultValue="Admin" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" defaultValue="User" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-gray-400" /> Email</span>
                  </label>
                  <input type="email" defaultValue="admin@airouter.io" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-gray-400" /> Phone</span>
                  </label>
                  <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-gray-400" /> Timezone</span>
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                    <option>IST (India Standard Time)</option>
                    <option>GMT (Greenwich Mean Time)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea rows={3} defaultValue="System administrator for AI Request Routing System." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Notification Settings</h2>
              <div className="space-y-0">
                {[
                  { label: 'Email Notifications', desc: 'Receive email alerts for important updates', enabled: emailNotifs, setter: setEmailNotifs },
                  { label: 'Push Notifications', desc: 'Browser push notifications for real-time events', enabled: pushNotifs, setter: setPushNotifs },
                  { label: 'New Request Alerts', desc: 'Get notified when a new request is submitted', enabled: requestNotifs, setter: setRequestNotifs },
                  { label: 'Agent Status Changes', desc: 'Alerts when agents go online/offline', enabled: agentNotifs, setter: setAgentNotifs },
                  { label: 'Weekly Report', desc: 'Receive a weekly summary of system activity', enabled: weeklyReport, setter: setWeeklyReport },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle enabled={item.enabled} onChange={item.setter} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Settings */}
          {activeSection === 'ai' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">AI Settings</h2>
              <p className="text-xs text-gray-400 mb-6">Configure AI-powered request classification and routing</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classification Model</label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                    <option>GPT-4 Turbo (Recommended)</option>
                    <option>GPT-3.5 Turbo</option>
                    <option>Custom Model</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Threshold</label>
                  <input type="range" min="0" max="100" defaultValue="80" className="w-full accent-indigo-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low (0%)</span>
                    <span>80%</span>
                    <span>High (100%)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Routing</label>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm text-gray-700">Enable automatic request routing</p>
                      <p className="text-xs text-gray-400">AI will automatically assign requests to the best available agent</p>
                    </div>
                    <Toggle enabled={true} onChange={() => {}} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment Analysis</label>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm text-gray-700">Enable sentiment analysis on requests</p>
                      <p className="text-xs text-gray-400">Detect and prioritize urgent or negative sentiment</p>
                    </div>
                    <Toggle enabled={true} onChange={() => {}} />
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-indigo-800">AI Engine Status</p>
                      <p className="text-xs text-indigo-600 mt-0.5">Model running normally · Last trained: May 28, 2026 · Accuracy: 94.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Queue Settings */}
          {activeSection === 'queue' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Queue Settings</h2>
              <p className="text-xs text-gray-400 mb-6">Configure request queue behavior and priorities</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Queue Size</label>
                  <input type="number" defaultValue={500} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                  <p className="text-xs text-gray-400 mt-1">Maximum number of requests allowed in the queue</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Timeout (minutes)</label>
                  <input type="number" defaultValue={30} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                  <p className="text-xs text-gray-400 mt-1">Auto-escalate unresponded requests after this duration</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority Levels</label>
                  <div className="space-y-2">
                    {['Critical', 'High', 'Normal', 'Low'].map((priority) => (
                      <div key={priority} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-sm text-gray-700">{priority}</span>
                        <input type="number" defaultValue={priority === 'Critical' ? 5 : priority === 'High' ? 15 : priority === 'Normal' ? 30 : 60} className="w-20 px-2 py-1 text-sm text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">SLA response time in minutes for each priority level</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Queue Distribution</label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                    <option>Round Robin</option>
                    <option>Least Busy</option>
                    <option>Skill-Based</option>
                    <option>AI-Optimized (Recommended)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* System Preferences */}
          {activeSection === 'system' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">System Preferences</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <button
                        key={theme}
                        className={clsx(
                          'p-3 rounded-lg border text-sm font-medium text-center transition-colors',
                          theme === 'Light'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm text-gray-700">Compact Mode</p>
                    <p className="text-xs text-gray-400">Use condensed UI layout with smaller spacing</p>
                  </div>
                  <Toggle enabled={false} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm text-gray-700">Sound Effects</p>
                    <p className="text-xs text-gray-400">Play notification sounds for events</p>
                  </div>
                  <Toggle enabled={true} onChange={() => {}} />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Security Options</h2>
                <div className="space-y-0">
                  {[
                    { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security with 2FA', enabled: false },
                    { label: 'Session Timeout', desc: 'Automatically log out after 30 minutes of inactivity', enabled: true },
                    { label: 'Login Notifications', desc: 'Get notified when someone logs into your account', enabled: true },
                    { label: 'API Access', desc: 'Allow third-party API access with token authentication', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle enabled={item.enabled} onChange={() => {}} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                <h2 className="text-base font-semibold text-red-900 mb-2">Danger Zone</h2>
                <p className="text-xs text-red-600 mb-4">These actions are irreversible. Please proceed with caution.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="px-4 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                    Delete Account
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                    Reset All Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminPageGuard>
  );
}
