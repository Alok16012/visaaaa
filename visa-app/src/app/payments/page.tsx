'use client'

import { useState, useEffect } from 'react'
import { getClients, getAgencies, Client } from '@/lib/store'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentsPage() {
  const [clients, setClients] = useState<(Client & { agencies?: any })[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [filterAgency, setFilterAgency] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [clientsData, agenciesData] = await Promise.all([getClients(), getAgencies()])
    setAgencies(agenciesData)
    const agenciesMap = new Map(agenciesData.map(a => [a.id, a]))
    setClients(clientsData.map(c => ({ ...c, agencies: agenciesMap.get(c.agency_id) || null })))
  }

  const filtered = clients.filter(c => {
    if (filterAgency && c.agency_id !== filterAgency) return false
    if (filterStatus && c.application_status !== filterStatus) return false
    return true
  })

  const totalAdvance = filtered.reduce((s, c) => s + (c.advance_payment || 0), 0)
  const totalDue = filtered.reduce((s, c) => s + (c.due_payment || 0), 0)
  const totalPay = filtered.reduce((s, c) => s + (c.total_payment || 0), 0)
  const totalBal = filtered.reduce((s, c) => s + (c.balance || 0), 0)

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payment Report</h1>
        <p className="text-sm text-gray-500 mt-1">Track all payments and balances</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Payment', value: totalPay, color: 'primary' },
          { label: 'Advance Payment', value: totalAdvance, color: 'green' },
          { label: 'Due Payment', value: totalDue, color: 'red' },
          { label: 'Balance Due', value: totalBal, color: 'orange' },
        ].map((item, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-${item.color}-500`}>
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <select value={filterAgency} onChange={e => setFilterAgency(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">All Agencies</option>
            {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">All Statuses</option>
            {['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Approved', 'Visa Issued', 'Rejected', 'Hold', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Agency</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Advance</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Due</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Total</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Balance</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No data found</td></tr> :
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.client_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.agencies?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.application_status}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{formatCurrency(c.advance_payment)}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(c.due_payment)}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">{formatCurrency(c.total_payment)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(c.balance)}</td>
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
