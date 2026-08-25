'use client'

import { useState } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [adminName, setAdminName] = useState('Ratan Mondal')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { alert('Passwords do not match'); return }
    setSaved(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
        <div><h1 className="text-xl font-semibold text-gray-800">Settings</h1><p className="text-sm text-gray-500">Manage your account and preferences</p></div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Profile Settings</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Admin Name</label>
              <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
              <input type="text" value="admin" disabled className="input-field bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" />Save Profile</button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary"><Save className="w-4 h-4" />Change Password</button>
          </form>
        </div>

        {/* Application Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Application Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Application ID Format</p>
              <p className="text-sm font-medium text-gray-800">ETVC-001, ETVC-002, ...</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Currency</p>
              <p className="text-sm font-medium text-gray-800">Indian Rupee (₹)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Version</p>
              <p className="text-sm font-medium text-gray-800">VMS v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
