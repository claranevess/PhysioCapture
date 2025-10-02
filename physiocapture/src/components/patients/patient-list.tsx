'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Filter } from 'lucide-react'
import { PatientCard } from './patient-card'
import { PatientWithRelations, PatientStatus, PatientSort } from '@/types'
import Link from 'next/link'

interface PatientListProps {
  patients: PatientWithRelations[]
  isLoading?: boolean
  onSearch?: (search: string) => void
  onFilter?: (status: PatientStatus | 'all') => void
  onSort?: (sort: PatientSort) => void
  searchValue?: string
  statusFilter?: PatientStatus | 'all'
  sortValue?: PatientSort
}

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'EVALUATION', label: 'Em Avaliação' },
  { value: 'DISCHARGED', label: 'Alta' },
]

const sortOptions = [
  { value: 'created_desc', label: 'Mais recentes' },
  { value: 'created_asc', label: 'Mais antigos' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'name_desc', label: 'Nome (Z-A)' },
  { value: 'last_visit_desc', label: 'Última consulta' },
]

export function PatientList({
  patients,
  isLoading = false,
  onSearch,
  onFilter,
  onSort,
  searchValue = '',
  statusFilter = 'all',
  sortValue = 'created_desc',
}: PatientListProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(localSearch)
  }

  const handleStatusChange = (value: string) => {
    onFilter?.(value as PatientStatus | 'all')
  }

  const handleSortChange = (value: string) => {
    onSort?.(value as PatientSort)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton dos filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted animate-pulse rounded-md flex-1" />
          <div className="h-10 bg-muted animate-pulse rounded-md w-48" />
          <div className="h-10 bg-muted animate-pulse rounded-md w-48" />
        </div>
        
        {/* Skeleton dos cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Busca */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou telefone..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          
          {/* Filtros */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortValue} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão Novo Paciente */}
        <Button asChild>
          <Link href="/patients/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      {/* Lista de pacientes */}
      {patients.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece cadastrando seu primeiro paciente.'}
          </p>
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Paciente
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
            />
          ))}
        </div>
      )}

      {/* Mostra quantidade de resultados */}
      {patients.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {patients.length} paciente{patients.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}