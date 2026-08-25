'use client'

import { useState, useEffect } from 'react'
import { getClients, getAgencies, Client } from '@/lib/store'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ExportPage() {
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

  const handleExport = () => {
    const filtered = clients.filter(c => {
      if (filterAgency && c.agency_id !== filterAgency) return false
      if (filterStatus && c.application_status !== filterStatus) return false
      return true
    })

    const data = filtered.map(c => ({
      'Application ID': c.application_id,
      'Client Name': c.client_name,
      'Agency': c.agencies?.name || '',
      'Country': c.country,
      'Citizenship': c.citizenship,
      'Passport Number': c.passport_number,
      'Mobile Number': c.mobile_number,
      'Job Position': c.job_position,
      'Application Status': c.application_status,
      'Approval Status': c.approval_status,
      'Advance Payment (₹)': c.advance_payment,
      'Due Payment (₹)': c.due_payment,
      'Total Payment (₹)': c.total_payment,
      'Balance (₹)': c.balance,
      'Follow-up Date': c.follow_up_date || '',
      'Remarks': c.remarks || '',
      'Created Date': c.created_date || c.created_at?.split('T')[0] || '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Clients')
    XLSX.writeFile(wb, `visa-clients-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Export Data</h1>
        <p className="text-sm text-gray-500 mt-1">Export client data to Excel</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select value={filterAgency} onChange={e => setFilterAgency(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">All Agencies</option>
            {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">All Statuses</option>
            {['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Approved', 'Visa Issued', 'Rejected', 'Hold', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" /> Export to Excel</button>
      </div>
    </div>
  )
}
