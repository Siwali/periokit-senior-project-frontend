import { apolloClient } from '../apollo-client'
import { gql } from '@apollo/client/core'

// Types
export interface Visit {
  id: string
  patientId: string
  visitDate: string
  phase: string
  doctorName: string | null
  studentId: number | null
  status: string
  hasChart: boolean
}

export interface Patient {
  id: string
  hn: string
  firstName: string
  lastName: string
  age: number | null
  gender: string | null
  nationality?: string | null
  lastVisitDate: string | null
  visitCount?: number
  visits?: Visit[]
}

export interface PatientListResponse {
  items: Patient[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const MY_PATIENTS = gql`
  query MyPatients($search: String, $dateFrom: String, $dateTo: String, $page: Int, $pageSize: Int) {
    myPatients(search: $search, dateFrom: $dateFrom, dateTo: $dateTo, page: $page, pageSize: $pageSize) {
      items {
        id
        hn
        firstName
        lastName
        age
        gender
        nationality
        lastVisitDate
      }
      total
      page
      pageSize
      totalPages
    }
  }
`

const PATIENT_BY_ID = gql`
  query PatientById($id: ID!) {
    patientById(id: $id) {
      id
      hn
      firstName
      lastName
      age
      gender
      nationality
      visitCount
      lastVisitDate
      visits {
        id
        patientId
        visitDate
        phase
        doctorName
        studentId
        status
        hasChart
      }
    }
  }
`

export const patientApi = {
  // Fetch a single patient by ID
  async getById(id: string): Promise<Patient | null> {
    const { data } = await apolloClient.query({
      query: PATIENT_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only',
    })
    return data?.patientById || null
  },

  // Fetch my patients
  async getMyPatients(
    page: number = 1,
    pageSize: number = 10,
    search: string = '',
    dateFrom: string = '',
    dateTo: string = ''
  ): Promise<PatientListResponse> {
    const variables: Record<string, any> = { page, pageSize }
    if (search) variables.search = search
    if (dateFrom) variables.dateFrom = dateFrom
    if (dateTo) variables.dateTo = dateTo

    const { data } = await apolloClient.query({
      query: MY_PATIENTS,
      variables,
      fetchPolicy: 'network-only',
    })

    const result = data?.myPatients
    return {
      items: result?.items || [],
      total: result?.total || 0,
      page: result?.page || page,
      pageSize: result?.pageSize || pageSize,
      totalPages: result?.totalPages || 0
    }
  },
}

