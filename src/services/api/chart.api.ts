import { apolloClient } from '@/services/apollo-client'
import { gql } from '@apollo/client/core'
import type {
  ChartByVisitQueryData,
  ChartByVisitQueryVariables,
  SaveChartInput,
  SaveChartMutationData,
  SaveChartMutationVariables,
} from '@/services/api/chart.api.types'

const SAVE_CHART = gql`
  mutation SaveChart($input: SaveChartInput!) {
    saveChart(input: $input) {
      id
      visitId
      patientId
      chartName
      status
      updatedAt
      patientInfo {
        hn
        patientName
        age
        gender
        nationality
        date
        doctor
        studentId
        visitPhase
      }
    }
  }
`
const CHART_BY_VISIT = gql`
  query ChartByVisit($visitId: ID!) {
    chartByVisit(visitId: $visitId) {
      id
      visitId
      patientId
      chartName
      status
      teethData
      summary
      updatedAt
      patientInfo {
        hn
        patientName
        age
        gender
        nationality
        date
        doctor
        studentId
        visitPhase
      }
    }
  }
`

export const chartApi = {
  save: (input: SaveChartInput) =>
    apolloClient.mutate<SaveChartMutationData, SaveChartMutationVariables>({
      mutation: SAVE_CHART,
      variables: { input },
    }),
  getByVisit: (visitId: string) =>
    apolloClient.query<ChartByVisitQueryData, ChartByVisitQueryVariables>({
      query: CHART_BY_VISIT,
      variables: { visitId },
      fetchPolicy: 'network-only',
    }),
}
