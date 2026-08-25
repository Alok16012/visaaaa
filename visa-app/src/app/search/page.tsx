'use client'

import { useState, useEffect, useCallback } from 'react'
import { Client, Agency, getClients, getAgencies, APPLICATION_STATUSES, APPROVAL_STATUSES, searchClients as searchClientsLocal } from '@/lib/store'
import { Plus, Search, Edit2, Trash2, Filter, X, Eye } from 'lucide-react'
import Link from 'next/link'

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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function SearchPage() {
  const [clients, setClients] = useState<(Client & { agencies?: Agency | null })[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('name')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = useCallback(async () => {
    const [allClients, allAgencies] = await Promise.all([getClients(), getAgencies()])
    setAgencies(allAgencies)
    const agenciesMap = new Map(allAgencies.map(a => [a.id, a]))
    const enriched = allClients.map(c => ({ ...c, agencies: agenciesMap.get(c.agency_id) || null }))
    setClients(enriched)
  }, [])

  const applyFilters = useCallback((query: string, type: string, status: string) => {
    if (!query.trim() && !status) {
      loadData()
      return
    }
    searchClientsLocal(query, type, status || undefined).then(results => {
      const agenciesMap = new Map(agencies.map(a => [a.id, a]))
      setClients(results.map(c => ({ ...c, agencies: agenciesMap.get(c.agency_id) || null })))
    })
  }, [agencies, loadData, searchClientsLocal])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Advanced Search</h1>
        <p className="text-sm text-gray-500 mt-1">Search clients by name, passport, agency, or country</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); applyFilters(e.target.value, searchType, statusFilter) }}
                placeholder={`Search by ${searchType}...`}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select value={searchType} onChange={e => { setSearchType(e.target.value); applyFilters(searchQuery, e.target.value, statusFilter) }} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="name">Name</option>
              <option value="passport">Passport</option>
              <option value="agency">Agency</option>
              <option value="country">Country</option>
            </select>
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); applyFilters(searchQuery, searchType, e.target.value) }} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">All Statuses</option>
            {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">App ID</th>
              <th className="px-4 py-3 font-medium text-gray-600">Client Name</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Agency</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Country</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Passport</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Approval</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-center">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {clients.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No results found</td></tr> :
                clients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.application_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.client_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.agencies?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.country}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono hidden xl:table-cell">{c.passport_number}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.application_status] || 'bg-gray-100'}`}>{c.application_status}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${APPROVAL_COLORS[c.approval_status] || 'bg-gray-100'}`}>{c.approval_status}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/add-client?id=${c.id}`} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 className="w-4 h-4" /></Link>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-500">
          Found {clients.length} results
        </div>
      </div>
    </div>
  )
}
