// Supabase-backed data layer.
//
// Every call goes through /api/data/*, which runs on the server and holds the
// database key. The exported function signatures are unchanged from the old
// localStorage implementation, so pages consume this module the same way.

export interface Client {
  id: string
  application_id: string
  client_name: string
  agency_id: string
  country: string
  citizenship: string
  passport_number: string
  mobile_number: string
  job_position: string
  application_status: string
  approval_status: string
  advance_payment: number
  due_payment: number
  total_payment: number
  balance: number
  follow_up_date: string
  remarks: string
  created_date: string
  created_at: string
}

export interface Agency {
  id: string
  name: string
  country: string
  contact_person: string
  phone: string
  email: string
  created_at: string
}

export interface JobCategory {
  id: string
  name: string
  created_at: string
}

export interface VisaType {
  id: string
  name: string
  created_at: string
}

export interface AppData {
  clients: Client[]
  agencies: Agency[]
  jobCategories: JobCategory[]
  visaTypes: VisaType[]
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/data/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }

  return body.data as T
}

// ===== AGENCIES =====
export async function getAgencies(): Promise<Agency[]> {
  return api<Agency[]>('agencies')
}

export async function addAgency(agency: Omit<Agency, 'id' | 'created_at'>): Promise<Agency> {
  return api<Agency>('agencies', { method: 'POST', body: JSON.stringify(agency) })
}

export async function updateAgency(id: string, updates: Partial<Agency>): Promise<void> {
  await api(`agencies/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
}

export async function deleteAgency(id: string): Promise<void> {
  await api(`agencies/${id}`, { method: 'DELETE' })
}

// ===== CLIENTS =====
export async function getClients(): Promise<Client[]> {
  return api<Client[]>('clients')
}

export async function addClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  return api<Client>('clients', { method: 'POST', body: JSON.stringify(client) })
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  await api(`clients/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
}

export async function deleteClient(id: string): Promise<void> {
  await api(`clients/${id}`, { method: 'DELETE' })
}

export async function searchClients(query: string, type: string, statusFilter?: string): Promise<Client[]> {
  const params = new URLSearchParams()
  if (query.trim()) {
    params.set('q', query.trim())
    params.set('type', type)
  }
  if (statusFilter) params.set('status', statusFilter)

  const qs = params.toString()
  return api<Client[]>(qs ? `clients?${qs}` : 'clients')
}

// ===== JOB CATEGORIES =====
export async function getJobCategories(): Promise<JobCategory[]> {
  return api<JobCategory[]>('job-categories')
}

export async function addJobCategory(name: string): Promise<JobCategory> {
  return api<JobCategory>('job-categories', { method: 'POST', body: JSON.stringify({ name }) })
}

export async function updateJobCategory(id: string, name: string): Promise<void> {
  await api(`job-categories/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
}

export async function deleteJobCategory(id: string): Promise<void> {
  await api(`job-categories/${id}`, { method: 'DELETE' })
}

// ===== VISA TYPES =====
export async function getVisaTypes(): Promise<VisaType[]> {
  return api<VisaType[]>('visa-types')
}

export async function addVisaType(name: string): Promise<VisaType> {
  return api<VisaType>('visa-types', { method: 'POST', body: JSON.stringify({ name }) })
}

export async function updateVisaType(id: string, name: string): Promise<void> {
  await api(`visa-types/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
}

export async function deleteVisaType(id: string): Promise<void> {
  await api(`visa-types/${id}`, { method: 'DELETE' })
}

// ===== DASHBOARD STATS =====
export async function getDashboardStats() {
  const clients = await getClients()
  const totalAdvance = clients.reduce((s, c) => s + (c.advance_payment || 0), 0)
  const totalDue = clients.reduce((s, c) => s + (c.due_payment || 0), 0)
  const totalPay = clients.reduce((s, c) => s + (c.total_payment || 0), 0)
  const totalBal = clients.reduce((s, c) => s + (c.balance || 0), 0)

  return {
    totalClients: clients.length,
    pending: clients.filter(c => ['New', 'Documents Pending'].includes(c.application_status)).length,
    approvalPending: clients.filter(c => c.application_status === 'Approval Pending').length,
    approved: clients.filter(c => c.application_status === 'Approved').length,
    visaIssued: clients.filter(c => c.application_status === 'Visa Issued').length,
    rejected: clients.filter(c => c.application_status === 'Rejected').length,
    totalAdvancePayment: totalAdvance,
    totalDuePayment: totalDue,
    totalPayment: totalPay,
    totalBalance: totalBal,
  }
}

export async function getAgencyOverview() {
  const clients = await getClients()
  const agencies = await getAgencies()
  const agencyMap = new Map<string, { total: number; pending: number; approved: number; completed: number }>()

  agencies.forEach(a => {
    const agencyClients = clients.filter(c => c.agency_id === a.id)
    const pending = agencyClients.filter(c => ['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Hold'].includes(c.application_status)).length
    const approved = agencyClients.filter(c => c.application_status === 'Approved').length
    const completed = agencyClients.filter(c => ['Visa Issued', 'Completed'].includes(c.application_status)).length
    agencyMap.set(a.name, { total: agencyClients.length, pending, approved, completed })
  })

  return Array.from(agencyMap.entries()).map(([name, counts]) => ({ name, ...counts })).sort((a, b) => b.total - a.total)
}

// Continues from the highest ETVC number already used rather than from the row
// count, so deleting a client cannot hand out an application id twice.
export async function generateAppId(): Promise<string> {
  const clients = await getClients()
  const highest = clients.reduce((max, c) => {
    const match = /^ETVC-(\d+)$/.exec(c.application_id || '')
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `ETVC-${String(highest + 1).padStart(3, '0')}`
}

export const APPLICATION_STATUSES = ['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Approved', 'Visa Issued', 'Rejected', 'Hold', 'Completed']
export const APPROVAL_STATUSES = ['Pending', 'Approved', 'Rejected']
