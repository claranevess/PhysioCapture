'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PatientList } from '@/components/patients/patient-list'
import { PatientWithRelations, PatientStatus, PatientSort } from '@/types'

async function fetchPatients(params: {
  search?: string
  status?: PatientStatus | 'all'
  sort?: PatientSort
  page?: number
}) {
  const searchParams = new URLSearchParams()
  
  if (params.search) searchParams.set('search', params.search)
  if (params.status && params.status !== 'all') searchParams.set('status', params.status)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.page) searchParams.set('page', params.page.toString())

  const response = await fetch(`/api/patients?${searchParams}`)
  
  if (!response.ok) {
    throw new Error('Erro ao buscar pacientes')
  }
  
  return response.json()
}

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PatientStatus | 'all'>('all')
  const [sort, setSort] = useState<PatientSort>('created_desc')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', { search, status, sort, page }],
    queryFn: () => fetchPatients({ search, status, sort, page }),
    staleTime: 30000, // Cache por 30 segundos
  })

  const patients: PatientWithRelations[] = data?.data || []

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Erro ao carregar pacientes
        </h2>
        <p className="text-muted-foreground">
          Tente recarregar a página ou entre em contato com o suporte.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground">
          Gerencie todos os seus pacientes e prontuários
        </p>
      </div>

      <PatientList
        patients={patients}
        isLoading={isLoading}
        onSearch={setSearch}
        onFilter={setStatus}
        onSort={setSort}
        searchValue={search}
        statusFilter={status}
        sortValue={sort}
      />
    </div>
  )
}