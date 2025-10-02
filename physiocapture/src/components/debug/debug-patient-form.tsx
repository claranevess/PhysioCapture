'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DebugPatientForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testCreatePatient = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test data with valid Brazilian format
      const testData = {
        fullName: 'João da Silva Teste',
        cpf: '123.456.789-00', // This is a test CPF, not real
        dateOfBirth: '1990-01-01',
        phone: '(11) 99999-9999',
        phoneSecondary: '',
        email: 'joao.teste@email.com',
        zipCode: '01234-567',
        street: 'Rua de Teste',
        number: '123',
        complement: '',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        occupation: 'Testador',
        insurance: 'SUS',
        insuranceNumber: '',
        generalNotes: 'Paciente de teste para debug'
      }

      console.log('Enviando dados de teste:', testData)

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      
      setResult({
        success: response.ok,
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      console.log('Resultado:', {
        success: response.ok,
        status: response.status,
        data
      })
      
    } catch (error) {
      console.error('Erro no teste:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  const testApi = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      
      setResult({
        success: response.ok,
        status: response.status,
        data
      })
      
    } catch (error) {
      console.error('Erro no teste da API:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug - Teste de Criação de Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testApi}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testando...' : 'Testar API Básica'}
          </Button>
          
          <Button 
            onClick={testCreatePatient}
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Testar Criação de Paciente'}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}