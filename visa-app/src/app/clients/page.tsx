'use client'

import { useState, useEffect, useCallback } from 'react'
import { Client, Agency, getClients, searchClients, deleteClient, APPLICATION_STATUSES, APPROVAL_STATUSES, getAgencies } from '@/lib/store'
import { Plus, Search, Edit2, Trash2, Filter, X, Eye } from 'lucide-react'
import Link from 'next/link'

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-gray-100 text-gray-700', 'Documents Pending': 'bg-yellow-100 text-yellow-700',
  'Submitted': 'bg-blue-100 text-blue-700', 'Processing': 'bg-indigo-100 text-indigo-700',
  'Approval Pending': 'bg-amber-100 text-amber-700', 'Approved': 'bg-green-100 text-green-700',
  'Visa Issued': 'bg-teal-100 text-teal-700', 'Rejected': 'bg-red-100 text-red-700',
  'Hold': 'bg-orange-100 text-orange-700', 'Completed': 'bg-emerald-100 text-emerald-700',
}

const APPROVAL_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-100 text-amber-700', 'Approved': 'bg-green-100 text-green-700', 'Rejected': 'bg-red-100 text-red-700',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<(Client & { agencies?: Agency | null })[]>([])
  const [filteredClients, setFilteredClients] = useState<(Client & { agencies?: Agency | null })[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('name')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<(Client & { agencies?: Agency | null }) | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = useCallback(async () => {
    const [allClients, allAgencies] = await Promise.all([getClients(), getAgencies()])
    setAgencies(allAgencies)
    const agenciesMap = new Map(allAgencies.map(a => [a.id, a]))
    const enriched = allClients.map(c => ({ ...c, agencies: agenciesMap.get(c.agency_id) || null }))
    setClients(enriched)
    applyFilters(enriched, searchQuery, searchType, statusFilter)
  }, [])

  const applyFilters = (clientList: (Client & { agencies?: Agency | null })[], query: string, type: string, status: string) => {
    let results = [...clientList]
    if (query.trim()) {
      if (type === 'name') results = results.filter(c => c.client_name.toLowerCase().includes(query.toLowerCase()))
      else if (type === 'passport') results = results.filter(c => c.passport_number.toLowerCase().includes(query.toLowerCase()))
      else if (type === 'agency') {
        const agencyIds = agencies.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).map(a => a.id)
        results = results.filter(c => agencyIds.includes(c.agency_id))
      }
      else if (type === 'country') results = results.filter(c => c.country.toLowerCase().includes(query.toLowerCase()))
    }
    if (status) results = results.filter(c => c.application_status === status)
    setFilteredClients(results)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(clients, query, searchType, statusFilter)
  }

  const handleSearchTypeChange = (type: string) => { setSearchType(type); applyFilters(clients, searchQuery, type, statusFilter) }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    applyFilters(clients, searchQuery, searchType, status)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id)
      loadData()
    }
  }

  const viewClient = (client: Client & { agencies?: Agency | null }) => {
    setSelectedClient(client)
    setShowViewModal(true)
  }

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')
  const getAgencyStats = (agencyName: string) => {
    const agencyClients = clients.filter(c => c.agencies?.name === agencyName)
    return { total: agencyClients.length, pending: agencyClients.filter(c => ['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Hold'].includes(c.application_status)).length }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client applications ({clients.length} total)</p>
        </div>
        <Link href="/add-client" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Client</span></Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder={`Search by ${searchType}...`} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <select value={searchType} onChange={e => handleSearchTypeChange(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="name">Name</option>
              <option value="passport">Passport</option>
              <option value="agency">Agency</option>
              <option value="country">Country</option>
            </select>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter {statusFilter && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleStatusFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
              {APPLICATION_STATUSES.map(s => (
                <button key={s} onClick={() => handleStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">App ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Client Name</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Agency</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Country</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Passport</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Approval</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Total Payment</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Balance</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">No clients found. <Link href="/add-client" className="text-primary-600 hover:underline">Add your first client</Link></td></tr>
              ) : filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{client.application_id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{client.client_name}</p>
                      <p className="text-xs text-gray-500 md:hidden">{client.agencies?.name || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{client.agencies?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{client.country}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono hidden xl:table-cell">{client.passport_number}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[client.application_status] || 'bg-gray-100 text-gray-700'}`}>{client.application_status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${APPROVAL_COLORS[client.approval_status] || 'bg-gray-100 text-gray-700'}`}>{client.approval_status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium hidden xl:table-cell">{formatCurrency(client.total_payment)}</td>
                  <td className={`px-4 py-3 font-medium hidden xl:table-cell ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(client.balance)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => viewClient(client)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Eye className="w-4 h-4" /></button>
                      <Link href={`/add-client?id=${client.id}`} className="p-2 hover:bg-green-50 rounded-lg text-green-600"><Edit2 className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length > 0 && (
          <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-500">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Client Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">Application ID</label><p className="font-medium text-gray-800">{selectedClient.application_id}</p></div>
                <div><label className="text-xs text-gray-500">Client Name</label><p className="font-medium text-gray-800">{selectedClient.client_name}</p></div>
                <div><label className="text-xs text-gray-500">Agency</label><p className="font-medium text-gray-800">{selectedClient.agencies?.name || '-'}</p></div>
                <div><label className="text-xs text-gray-500">Country</label><p className="font-medium text-gray-800">{selectedClient.country}</p></div>
                <div><label className="text-xs text-gray-500">Citizenship</label><p className="font-medium text-gray-800">{selectedClient.citizenship}</p></div>
                <div><label className="text-xs text-gray-500">Passport Number</label><p className="font-medium text-gray-800">{selectedClient.passport_number}</p></div>
                <div><label className="text-xs text-gray-500">Mobile</label><p className="font-medium text-gray-800">{selectedClient.mobile_number}</p></div>
                <div><label className="text-xs text-gray-500">Job Position</label><p className="font-medium text-gray-800">{selectedClient.job_position}</p></div>
                <div><label className="text-xs text-gray-500">Application Status</label><p><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedClient.application_status] || 'bg-gray-100'}`}>{selectedClient.application_status}</span></p></div>
                <div><label className="text-xs text-gray-500">Approval Status</label><p><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${APPROVAL_COLORS[selectedClient.approval_status] || 'bg-gray-100'}`}>{selectedClient.approval_status}</span></p></div>
                <div><label className="text-xs text-gray-500">Follow Up Date</label><p className="font-medium text-gray-800">{selectedClient.follow_up_date ? formatDate(selectedClient.follow_up_date) : '-'}</p></div>
                <div><label className="text-xs text-gray-500">Created Date</label><p className="font-medium text-gray-800">{selectedClient.created_date ? formatDate(selectedClient.created_date) : formatDate(selectedClient.created_at)}</p></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-gray-500">Advance Payment</label><p className="font-medium text-gray-800">{formatCurrency(selectedClient.advance_payment)}</p></div>
                  <div><label className="text-xs text-gray-500">Due Payment</label><p className="font-medium text-gray-800">{formatCurrency(selectedClient.due_payment)}</p></div>
                  <div><label className="text-xs text-gray-500">Total Payment</label><p className="font-medium text-gray-800">{formatCurrency(selectedClient.total_payment)}</p></div>
                  <div className="col-span-3"><label className="text-xs text-gray-500">Balance</label><p className={`font-medium ${selectedClient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(selectedClient.balance)}</p></div>
                </div>
              </div>
              {selectedClient.remarks && <div><label className="text-xs text-gray-500">Remarks</label><p className="text-sm text-gray-700 mt-1">{selectedClient.remarks}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
