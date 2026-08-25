'use client'

import { useState, useEffect } from 'react'
import { getClients, getAgencies, getJobCategories, getVisaTypes } from '@/lib/store'
import { Download, Upload, Shield, HardDrive } from 'lucide-react'

export default function BackupPage() {
  const [stats, setStats] = useState({ clients: 0, agencies: 0, jobCategories: 0, visaTypes: 0 })

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    const [clients, agencies, jobs, visas] = await Promise.all([getClients(), getAgencies(), getJobCategories(), getVisaTypes()])
    setStats({ clients: clients.length, agencies: agencies.length, jobCategories: jobs.length, visaTypes: visas.length })
  }

  const handleBackup = () => {
    const data = localStorage.getItem('visa_management_data')
    if (!data) { alert('No data to backup!'); return }
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visa-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('This will replace all current data. Are you sure?')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        localStorage.setItem('visa_management_data', JSON.stringify(data))
        alert('Backup restored successfully!')
        loadStats()
      } catch { alert('Invalid backup file!') }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Database Backup</h1>
        <p className="text-sm text-gray-500 mt-1">Backup and restore your data</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Data Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-primary-50 rounded-lg p-4"><p className="text-xs text-gray-500">Clients</p><p className="text-2xl font-bold text-primary-700">{stats.clients}</p></div>
          <div className="bg-green-50 rounded-lg p-4"><p className="text-xs text-gray-500">Agencies</p><p className="text-2xl font-bold text-green-700">{stats.agencies}</p></div>
          <div className="bg-blue-50 rounded-lg p-4"><p className="text-xs text-gray-500">Job Categories</p><p className="text-2xl font-bold text-blue-700">{stats.jobCategories}</p></div>
          <div className="bg-amber-50 rounded-lg p-4"><p className="text-xs text-gray-500">Visa Types</p><p className="text-2xl font-bold text-amber-700">{stats.visaTypes}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Backup Actions</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><Download className="w-5 h-5 text-blue-600" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800">Export Backup</h3>
              <p className="text-xs text-gray-500 mt-1">Download all data as JSON file. Keep it safe.</p>
              <button onClick={handleBackup} className="mt-3 btn-primary text-sm">Download Backup</button>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"><Upload className="w-5 h-5 text-green-600" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800">Restore Backup</h3>
              <p className="text-xs text-gray-500 mt-1">Import data from a previous backup. This replaces current data.</p>
              <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-700">
                <Upload className="w-4 h-4" /> Choose Backup File
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
          <div><h3 className="text-sm font-medium text-amber-800">Important</h3>
          <p className="text-xs text-amber-700 mt-1">Data is stored in your browser's localStorage. If you clear browser data or use a different browser, your data will be lost. Always keep regular backups!</p></div>
        </div>
      </div>
    </div>
  )
}
