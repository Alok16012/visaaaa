'use client'

import { useState, useEffect } from 'react'
import { getClients, getAgencies, Client } from '@/lib/store'
import { Calendar, ChevronDown } from 'lucide-react'

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const isToday = (dateStr: string) => {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

const isUpcoming = (dateStr: string, days = 7) => {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0,0,0,0)
  const future = new Date(today)
  future.setDate(future.getDate() + days)
  return d >= today && d <= future
}

export default function FollowUpPage() {
  const [clients, setClients] = useState<(Client & { agencies?: any })[]>([])
  const [dateFilter, setDateFilter] = useState('')
  const [showPast, setShowPast] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [allClients, allAgencies] = await Promise.all([getClients(), getAgencies()])
    const agenciesMap = new Map(allAgencies.map(a => [a.id, a]))
    const enriched = allClients.map(c => ({ ...c, agencies: agenciesMap.get(c.agency_id) || null }))
    setClients(enriched)
  }

  let filtered = clients.filter(c => c.follow_up_date)
  if (dateFilter) {
    filtered = filtered.filter(c => c.follow_up_date === dateFilter)
  } else {
    if (!showPast) filtered = filtered.filter(c => isToday(c.follow_up_date) || isUpcoming(c.follow_up_date) || new Date(c.follow_up_date) >= new Date(new Date().setHours(0,0,0,0)))
  }
  filtered.sort((a, b) => (a.follow_up_date || '').localeCompare(b.follow_up_date || ''))

  const todayFollowUps = filtered.filter(c => isToday(c.follow_up_date)).length
  const upcomingFollowUps = filtered.filter(c => isUpcoming(c.follow_up_date)).length
  const overdue = filtered.filter(c => c.follow_up_date && !isToday(c.follow_up_date) && !isUpcoming(c.follow_up_date) && new Date(c.follow_up_date) < new Date(new Date().setHours(0,0,0,0))).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Follow-up Dates</h1>
        <p className="text-sm text-gray-500 mt-1">Track upcoming and overdue follow-ups</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-500">Today's Follow-ups</p>
          <p className="text-2xl font-bold text-primary-600">{todayFollowUps}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-500">Upcoming (7 days)</p>
          <p className="text-2xl font-bold text-green-600">{upcomingFollowUps}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)} className="rounded border-gray-300" />
            Show past follow-ups
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">Follow-up Date</th>
              <th className="px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Agency</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Passport</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Remarks</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No follow-ups found</td></tr> :
                filtered.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50 ${isToday(c.follow_up_date) ? 'bg-blue-50/30' : isOverdue(c.follow_up_date) ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${isToday(c.follow_up_date) ? 'text-blue-600' : ''}`}>{formatDate(c.follow_up_date)}</span>
                      {isToday(c.follow_up_date) && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Today</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.client_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.agencies?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono hidden lg:table-cell">{c.passport_number}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.application_status === 'Approved' ? 'bg-green-100 text-green-700' : c.application_status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{c.application_status}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{c.remarks ? c.remarks.slice(0, 50) + (c.remarks.length > 50 ? '…' : '') : '-'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const isOverdue = (dateStr: string) => {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0))
}
