'use client'

import { useState, useEffect } from 'react'
import { getVisaTypes, addVisaType, updateVisaType, deleteVisaType } from '@/lib/store'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

export default function VisaTypesPage() {
  const [items, setItems] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [name, setName] = useState('')

  useEffect(() => { load() }, [])
  const load = async () => setItems(await getVisaTypes())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (editing) await updateVisaType(editing.id, name)
    else await addVisaType(name)
    close()
  }
  const handleEdit = (item: any) => { setEditing(item); setName(item.name); setShowModal(true) }
  const handleDelete = async (id: string) => { if (confirm('Delete this visa type?')) { await deleteVisaType(id); load() } }
  const close = () => { setShowModal(false); setEditing(null); setName('') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visa Types</h1>
          <p className="text-sm text-gray-500 mt-1">Manage visa types</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Type</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left"><th className="px-4 py-3 font-medium text-gray-600">Visa Type</th><th className="px-4 py-3 font-medium text-gray-600 text-center">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? <tr><td colSpan={2} className="px-4 py-12 text-center text-gray-400">No visa types yet</td></tr> :
                items.map(item => <tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-800">{item.name}</td><td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-2"><button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button></div></td></tr>)
              }
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between"><h2 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Visa Type</h2><button onClick={close} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Visa Type Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={close} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">{editing ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
