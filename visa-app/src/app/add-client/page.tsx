'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Client, getClients, addClient, updateClient, generateAppId, getAgencies, Agency, getAgents, Agent, getJobCategories, getVisaTypes } from '@/lib/store'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [agencies, setAgencies] = useState<Agency[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [jobCategories, setJobCategories] = useState<string[]>([])
  const [visaTypes, setVisaTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    application_id: '',
    client_name: '',
    agency_id: '',
    agent_id: '',
    country: '',
    citizenship: '',
    passport_number: '',
    mobile_number: '',
    job_category: '',
    job_position: '',
    visa_type: '',
    application_status: 'New',
    approval_status: 'Pending',
    advance_payment: 0,
    due_payment: 0,
    total_payment: 0,
    balance: 0,
    follow_up_date: '',
    remarks: '',
    created_date: '',
  })

  useEffect(() => {
    async function init() {
      const [agenciesData, agentsData, clientsData, jobCatsData, visaTypesData] = await Promise.all([
        getAgencies(),
        getAgents(),
        getClients(),
        getJobCategories(),
        getVisaTypes(),
      ])
      setAgencies(agenciesData)
      setAgents(agentsData)
      setJobCategories(jobCatsData.map(c => c.name))
      setVisaTypes(visaTypesData.map(v => v.name))

      if (editId) {
        const client = clientsData.find(c => c.id === editId)
        if (client) {
          setFormData({
            application_id: client.application_id,
            client_name: client.client_name,
            agency_id: client.agency_id,
            agent_id: client.agent_id,
            country: client.country,
            citizenship: client.citizenship,
            passport_number: client.passport_number,
            mobile_number: client.mobile_number,
            job_category: client.job_category,
            job_position: client.job_position,
            visa_type: client.visa_type,
            application_status: client.application_status,
            approval_status: client.approval_status,
            advance_payment: client.advance_payment,
            due_payment: client.due_payment,
            total_payment: client.total_payment,
            balance: client.balance,
            follow_up_date: client.follow_up_date,
            remarks: client.remarks,
            created_date: client.created_date,
          })
        }
      } else {
        const appId = await generateAppId()
        setFormData(f => ({ ...f, application_id: appId, created_date: new Date().toISOString().split('T')[0] }))
      }
    }
    init()
  }, [editId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_name.trim() || !formData.agency_id) return

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        total_payment: (formData.advance_payment || 0) + (formData.due_payment || 0),
        balance: formData.due_payment || 0,
      }

      if (editId) {
        await updateClient(editId, submitData)
      } else {
        await addClient(submitData)
      }
      router.push('/clients')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      next.total_payment = (next.advance_payment || 0) + (next.due_payment || 0)
      next.balance = next.due_payment || 0
      return next
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{editId ? 'Edit Client' : 'Add New Client'}</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the client application details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Application ID */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Application Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
              <input type="text" value={formData.application_id} disabled className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.client_name} onChange={e => updateField('client_name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency / Foreign Office <span className="text-red-500">*</span></label>
              <select value={formData.agency_id} onChange={e => updateField('agency_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" required>
                <option value="">Select Agency</option>
                {agencies.map(a => <option key={a.id} value={a.id}>{a.name} – {a.country}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select value={formData.agent_id} onChange={e => updateField('agent_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">Select Agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={formData.country} onChange={e => updateField('country', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Destination country" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
              <input type="text" value={formData.citizenship} onChange={e => updateField('citizenship', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Citizenship" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
              <input type="text" value={formData.passport_number} onChange={e => updateField('passport_number', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Passport number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input type="text" value={formData.mobile_number} onChange={e => updateField('mobile_number', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Mobile number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Category</label>
              <select value={formData.job_category} onChange={e => updateField('job_category', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">Select Job Category</option>
                {jobCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
              <input type="text" value={formData.job_position} onChange={e => updateField('job_position', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., Welder" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
              <select value={formData.visa_type} onChange={e => updateField('visa_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">Select Visa Type</option>
                {visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Status</label>
              <select value={formData.application_status} onChange={e => updateField('application_status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                {['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Approved', 'Visa Issued', 'Rejected', 'Hold', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
              <select value={formData.approval_status} onChange={e => updateField('approval_status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                {['Pending', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Payment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment (₹)</label>
              <input type="number" min="0" value={formData.advance_payment} onChange={e => updateField('advance_payment', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Payment (₹)</label>
              <input type="number" min="0" value={formData.due_payment} onChange={e => updateField('due_payment', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Payment (₹)</label>
              <input type="text" value={formData.total_payment.toLocaleString('en-IN')} disabled className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium" />
              <p className="text-xs text-gray-400 mt-1">Auto-calculated: Advance + Due</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balance (₹)</label>
              <input type="text" value={formData.balance.toLocaleString('en-IN')} disabled className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium" />
            </div>
          </div>
        </div>

        {/* Other */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Additional Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <input type="date" value={formData.follow_up_date} onChange={e => updateField('follow_up_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
              <input type="date" value={formData.created_date} onChange={e => updateField('created_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea value={formData.remarks} onChange={e => updateField('remarks', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Any notes or remarks..." />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  )
}
