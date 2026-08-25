'use client'

import { useState, useEffect } from 'react'
import { Agency, getAgencies, addAgency, updateAgency, deleteAgency } from '@/lib/store'
import { Plus, Edit2, Trash2, Globe, Search, X } from 'lucide-react'

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null)
  const [formData, setFormData] = useState({ name: '', country: '', contact_person: '', phone: '', email: '' })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { loadAgencies() }, [])

  const loadAgencies = async () => { setAgencies(await getAgencies()) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingAgency) {
      await updateAgency(editingAgency.id, formData)
    } else {
      await addAgency(formData)
    }
    setShowModal(false)
    setEditingAgency(null)
    setFormData({ name: '', country: '', contact_person: '', phone: '', email: '' })
    loadAgencies()
  }

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency)
    setFormData({ name: agency.name, country: agency.country, contact_person: agency.contact_person, phone: agency.phone, email: agency.email })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this agency?')) {
      await deleteAgency(id)
      loadAgencies()
    }
  }

  const filteredAgencies = agencies.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agencies / Foreign Offices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your foreign office agencies and recruitment partners</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingAgency(null); setFormData({ name: '', country: '', contact_person: '', phone: '', email: '' }) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Agency
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or country..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Agency Name</th>
                <th className="px-4 py-3 font-medium text-gray-600">Country</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Contact Person</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAgencies.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No agencies found. Add your first agency!</td></tr>
              ) : filteredAgencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center"><Globe className="w-4 h-4 text-primary-600" /></div>
                      <span className="font-medium text-gray-800">{agency.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{agency.country}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{agency.contact_person || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{agency.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{agency.email || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(agency)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(agency.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingAgency ? 'Edit Agency' : 'Add New Agency'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., OPUS VIS" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., Croatia" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input type="text" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">{editingAgency ? 'Update' : 'Add'} Agency</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
