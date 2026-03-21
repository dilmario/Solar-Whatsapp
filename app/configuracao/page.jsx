export default function ConfiguracaoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600 mb-8">Personalize seu consultor automático</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Respostas Automáticas</h3>
              <div className="space-y-3">
                {['Saudação inicial', 'Qualificação de lead', 'Follow-up 1', 'Follow-up 2'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-gray-700">{item}</span>
                    <div className="h-6 w-12 bg-gray-100 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Número do WhatsApp</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <code className="text-sm text-gray-800">+55 21 99999-9999</code>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Serviço</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Online</span>
              </div>
              <p className="text-sm text-gray-500">Consultor ativo há 2 dias</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Leads hoje</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taxa de resposta</p>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
