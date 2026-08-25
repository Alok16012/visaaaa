import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Client = {
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

export type Agency = {
  id: string
  name: string
  country: string
  contact_person: string
  phone: string
  email: string
  created_at: string
}

export type AdminUser = {
  id: string
  username: string
  password_hash: string
  full_name: string
}

export const APPLICATION_STATUSES = [
  'New',
  'Documents Pending',
  'Submitted',
  'Processing',
  'Approval Pending',
  'Approved',
  'Visa Issued',
  'Rejected',
  'Hold',
  'Completed',
] as const

export const APPROVAL_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
] as const
