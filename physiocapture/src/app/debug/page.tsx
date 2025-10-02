import { DebugPatientForm } from '@/components/debug/debug-patient-form'

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Debug - Teste de API</h1>
      <DebugPatientForm />
    </div>
  )
}