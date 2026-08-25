// LocalStorage-based data layer (works without Supabase)

const STORAGE_KEY = 'visa_management_data'

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

function getData(): AppData {
  if (typeof window === 'undefined') return emptyData()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const data = getDefaultData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  }
  return JSON.parse(raw)
}

function saveData(data: AppData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function emptyData(): AppData {
  return { clients: [], agencies: [], jobCategories: [], visaTypes: [] }
}

function getDefaultData(): AppData {
  return {
    agencies: [
      { id: '1', name: 'OPUS VIS', country: 'Croatia', contact_person: 'John Smith', phone: '+385-1-1234567', email: 'info@opusvis.hr', created_at: new Date().toISOString() },
      { id: '2', name: 'ABC RECRUITMENT', country: 'Serbia', contact_person: 'Milan Petrovic', phone: '+381-11-1234567', email: 'contact@abcrecruitment.rs', created_at: new Date().toISOString() },
      { id: '3', name: 'BALKAN HIRING', country: 'Slovenia', contact_person: 'Ana Novak', phone: '+386-1-2345678', email: 'info@balkanhiring.si', created_at: new Date().toISOString() },
      { id: '4', name: 'EURO JOB CENTER', country: 'Romania', contact_person: 'George Popescu', phone: '+40-21-1234567', email: 'office@eurojobcenter.ro', created_at: new Date().toISOString() },
      { id: '5', name: 'FUTURE EMPLOYMENT', country: 'Moldova', contact_person: 'Ion Ivanov', phone: '+373-22-123456', email: 'info@futureemployment.md', created_at: new Date().toISOString() },
    ],
    jobCategories: [
      { id: '1', name: 'Construction', created_at: new Date().toISOString() },
      { id: '2', name: 'Factory Worker', created_at: new Date().toISOString() },
      { id: '3', name: 'Healthcare', created_at: new Date().toISOString() },
      { id: '4', name: 'Hospitality', created_at: new Date().toISOString() },
      { id: '5', name: 'Engineering', created_at: new Date().toISOString() },
      { id: '6', name: 'Agriculture', created_at: new Date().toISOString() },
      { id: '7', name: 'Driver', created_at: new Date().toISOString() },
      { id: '8', name: 'Security', created_at: new Date().toISOString() },
    ],
    visaTypes: [
      { id: '1', name: 'Work Visa', created_at: new Date().toISOString() },
      { id: '2', name: 'Employment Visa', created_at: new Date().toISOString() },
      { id: '3', name: 'Business Visa', created_at: new Date().toISOString() },
      { id: '4', name: 'Tourist Visa', created_at: new Date().toISOString() },
    ],
    clients: [],
  }
}

// ===== AGENCIES =====
export async function getAgencies(): Promise<Agency[]> {
  const data = getData()
  return data.agencies.sort((a, b) => a.name.localeCompare(b.name))
}

export async function addAgency(agency: Omit<Agency, 'id' | 'created_at'>): Promise<Agency> {
  const data = getData()
  const newAgency: Agency = {
    ...agency,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }
  data.agencies.push(newAgency)
  saveData(data)
  return newAgency
}

export async function updateAgency(id: string, updates: Partial<Agency>): Promise<void> {
  const data = getData()
  const idx = data.agencies.findIndex(a => a.id === id)
  if (idx >= 0) {
    data.agencies[idx] = { ...data.agencies[idx], ...updates }
    saveData(data)
  }
}

export async function deleteAgency(id: string): Promise<void> {
  const data = getData()
  data.agencies = data.agencies.filter(a => a.id !== id)
  saveData(data)
}

// ===== CLIENTS =====
export async function getClients(): Promise<Client[]> {
  const data = getData()
  return data.clients.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function addClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  const data = getData()
  const newClient: Client = {
    ...client,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }
  data.clients.push(newClient)
  saveData(data)
  return newClient
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  const data = getData()
  const idx = data.clients.findIndex(c => c.id === id)
  if (idx >= 0) {
    data.clients[idx] = { ...data.clients[idx], ...updates }
    saveData(data)
  }
}

export async function deleteClient(id: string): Promise<void> {
  const data = getData()
  data.clients = data.clients.filter(c => c.id !== id)
  saveData(data)
}

export async function searchClients(query: string, type: string, statusFilter?: string): Promise<Client[]> {
  const data = getData()
  let results = [...data.clients]

  if (query.trim()) {
    if (type === 'name') {
      results = results.filter(c => c.client_name.toLowerCase().includes(query.toLowerCase()))
    } else if (type === 'passport') {
      results = results.filter(c => c.passport_number.toLowerCase().includes(query.toLowerCase()))
    } else if (type === 'agency') {
      const agencyIds = data.agencies.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).map(a => a.id)
      results = results.filter(c => agencyIds.includes(c.agency_id))
    } else if (type === 'country') {
      results = results.filter(c => c.country.toLowerCase().includes(query.toLowerCase()))
    }
  }

  if (statusFilter) {
    results = results.filter(c => c.application_status === statusFilter)
  }

  return results.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

// ===== JOB CATEGORIES =====
export async function getJobCategories(): Promise<JobCategory[]> {
  const data = getData()
  return data.jobCategories.sort((a, b) => a.name.localeCompare(b.name))
}

export async function addJobCategory(name: string): Promise<JobCategory> {
  const data = getData()
  const item: JobCategory = { id: Date.now().toString(), name, created_at: new Date().toISOString() }
  data.jobCategories.push(item)
  saveData(data)
  return item
}

export async function updateJobCategory(id: string, name: string): Promise<void> {
  const data = getData()
  const idx = data.jobCategories.findIndex(c => c.id === id)
  if (idx >= 0) { data.jobCategories[idx].name = name; saveData(data) }
}

export async function deleteJobCategory(id: string): Promise<void> {
  const data = getData()
  data.jobCategories = data.jobCategories.filter(c => c.id !== id)
  saveData(data)
}

// ===== VISA TYPES =====
export async function getVisaTypes(): Promise<VisaType[]> {
  const data = getData()
  return data.visaTypes.sort((a, b) => a.name.localeCompare(b.name))
}

export async function addVisaType(name: string): Promise<VisaType> {
  const data = getData()
  const item: VisaType = { id: Date.now().toString(), name, created_at: new Date().toISOString() }
  data.visaTypes.push(item)
  saveData(data)
  return item
}

export async function updateVisaType(id: string, name: string): Promise<void> {
  const data = getData()
  const idx = data.visaTypes.findIndex(c => c.id === id)
  if (idx >= 0) { data.visaTypes[idx].name = name; saveData(data) }
}

export async function deleteVisaType(id: string): Promise<void> {
  const data = getData()
  data.visaTypes = data.visaTypes.filter(c => c.id !== id)
  saveData(data)
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

export async function generateAppId(): Promise<string> {
  const clients = await getClients()
  const num = clients.length + 1
  return `ETVC-${String(num).padStart(3, '0')}`
}

// Export for use in components
export { getData, saveData }

export const APPLICATION_STATUSES = ['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Approved', 'Visa Issued', 'Rejected', 'Hold', 'Completed']
export const APPROVAL_STATUSES = ['Pending', 'Approved', 'Rejected']
