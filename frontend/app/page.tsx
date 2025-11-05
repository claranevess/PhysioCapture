import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏥 PhysioCapture
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de Gestão de Prontuários e Documentos Médicos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            href="/patients"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-blue-500"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pacientes
            </h2>
            <p className="text-gray-600">
              Gerencie pacientes e seus prontuários médicos
            </p>
          </Link>

          <Link
            href="/documents"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-green-500"
          >
            <div className="text-4xl mb-4">📁</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Documentos
            </h2>
            <p className="text-gray-600">
              Upload e gestão de documentos digitalizados
            </p>
          </Link>
        </div>

        <div className="mt-16 max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 Configuração da API
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Backend:</strong> http://127.0.0.1:8000</p>
            <p><strong>Admin:</strong> http://127.0.0.1:8000/admin/</p>
            <p><strong>Usuário:</strong> admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
