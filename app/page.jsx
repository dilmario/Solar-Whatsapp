'use client'

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
 CheckCircle, 
 Zap, 
 MessageCircle, 
 Users, 
 Clock, 
 Shield,
 ChevronRight,
 Star,
 TrendingUp,
 Smartphone,
 Sun,
 Battery,
 Home,
 DollarSign,
 BarChart3,
 HelpCircle,
 Menu,
 X
} from 'lucide-react'

function Badge({ children, variant = "default" }) {
 const variants = {
   default: "bg-white/90 text-gray-800 border-gray-200",
   primary: "bg-emerald-100 text-emerald-800 border-emerald-200",
   solar: "bg-amber-100 text-amber-800 border-amber-200",
   dark: "bg-gray-800 text-white border-gray-700"
 }
 
 return (
   <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]}`}>
     <Zap size={12} />
     {children}
   </span>
 )
}

function SectionTitle({ eyebrow, title, subtitle, centered = true }) {
 return (
   <div className={`${centered ? 'text-center' : ''} animate-fade-up`}>
     {eyebrow && (
       <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 mb-4">
         <span className="text-sm font-semibold text-emerald-700">{eyebrow}</span>
       </div>
     )}
     <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
       {title}
     </h2>
     {subtitle && (
  <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-900">{subtitle}</p>
)}
   </div>
 )
}

function Card({ title, children, footer, icon: Icon, highlight = false, price, period }) {
 const DefaultIcon = Icon || CheckCircle
 
 return (
   <div className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${highlight ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-200'}`}>
     {highlight && (
       <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10"></div>
     )}
     
     <div className="relative">
       <div className={`inline-flex rounded-lg p-2 ${highlight ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
         <DefaultIcon size={20} />
       </div>
       
       <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
       
       {price && (
         <div className="mt-2">
           <span className="text-2xl font-bold text-gray-900">{price}</span>
           {period && <span className="text-sm text-gray-500">/{period}</span>}
         </div>
       )}
       
       <div className="mt-3 text-gray-600">{children}</div>
       
       {footer && (
         <div className="mt-6">
           {footer}
         </div>
       )}
     </div>
   </div>
 )
}

function Feature({ icon: Icon, title, description }) {
 return (
   <div className="group">
     <div className="flex items-start gap-4">
       <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
         <Icon size={20} />
       </div>
       <div>
         <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
         <p className="mt-1 text-gray-600">{description}</p>
       </div>
     </div>
   </div>
 )
}

function Testimonial({ name, role, content, rating = 5 }) {
 return (
   <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
     <div className="flex items-center gap-1 mb-3">
       {Array.from({ length: rating }).map((_, i) => (
         <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
       ))}
       {Array.from({ length: 5 - rating }).map((_, i) => (
         <Star key={i} size={16} className="text-gray-300" />
       ))}
     </div>
     <p className="text-gray-700 italic">"{content}"</p>
     <div className="mt-4 flex items-center gap-3">
       <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700"></div>
       <div>
         <p className="font-semibold text-gray-900">{name}</p>
         <p className="text-sm text-gray-500">{role}</p>
       </div>
     </div>
   </div>
 )
}

function FAQ({ question, answer }) {
 const [isOpen, setIsOpen] = useState(false)
 
 return (
   <div className="border border-gray-200 rounded-xl overflow-hidden">
     <button
       onClick={() => setIsOpen(!isOpen)}
       className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
     >
       <span className="font-semibold text-gray-900">{question}</span>
       <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
     </button>
     {isOpen && (
       <div className="p-5 pt-0 text-gray-600 bg-white">
         {answer}
       </div>
     )}
   </div>
 )
}

function StatCard({ icon: Icon, value, label }) {
 return (
   <div className="text-center">
     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
       <Icon size={24} />
     </div>
     <div className="text-2xl font-bold text-gray-900">{value}</div>
     <div className="text-sm text-gray-900">{label}</div>
   </div>
 )
}

export default function Landing() { 
 const router = useRouter() 
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
 const [selectedPlan, setSelectedPlan] = useState('mensal')
 const [leadsCount, setLeadsCount] = useState(0)
 const [economiaCount, setEconomiaCount] = useState(0)
 
 const whatsappLink = useMemo(() => {
   // ⚠️ SUBSTITUA PELO SEU NÚMERO REAL
   const phone = "5522992885061"
   const text = encodeURIComponent(
     "Olá! Gostaria de conhecer o Consultor Solar Automatizado para WhatsApp."
   )
   return `https://wa.me/${phone}?text=${text}`
 }, [])

 // Contador animado
 useEffect(() => {
   const interval = setInterval(() => {
     setLeadsCount(prev => prev < 2500 ? prev + 5 : 2500)
     setEconomiaCount(prev => prev < 600 ? prev + 2 : 600)
   }, 30)
   
   return () => clearInterval(interval)
 }, [])

 const scrollToSection = (id) => {
   setMobileMenuOpen(false)
   const element = document.getElementById(id)
   if (element) {
     element.scrollIntoView({ behavior: 'smooth' })
   }
 }

 return (
   <div className="min-h-screen bg-white">
     {/* Header */}
     <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-lg">
       <div className="mx-auto max-w-7xl px-4 py-3">
         <div className="flex items-center justify-between">
           {/* Logo */}
           <Link href="/" className="flex items-center gap-2">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
               <Sun className="text-white" size={20} />
             </div>
             <div className="hidden sm:block">
               <p className="text-sm font-bold text-gray-900">Consultor Solar</p>
               <p className="text-xs text-gray-500">Automação para WhatsApp</p>
             </div>
           </Link>

           {/* Desktop Navigation */}
           <nav className="hidden md:flex items-center gap-8">
             {[
               { name: 'Como funciona', id: 'como-funciona' },
               { name: 'Resultados', id: 'resultados' },
               { name: 'Planos', id: 'planos' },
               { name: 'FAQ', id: 'faq' }
             ].map((item) => (
               <button
                 key={item.id}
                 onClick={() => scrollToSection(item.id)}
                 className="text-sm font-medium text-gray-700 transition-colors hover:text-emerald-600"
               >
                 {item.name}
               </button>
             ))}
           </nav>

           {/* Desktop CTA */}
           <div className="hidden md:flex items-center gap-3">
             <Link
               href="/cliente"
               className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
             >
               Entrar
             </Link>
             <a
               href={whatsappLink}
               className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
               target="_blank"
               rel="noopener noreferrer"
             >
               <MessageCircle size={16} className="mr-2" />
               Teste Grátis
             </a>
           </div>

           {/* Mobile Menu Button */}
           <button
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             className="md:hidden p-2 rounded-lg hover:bg-gray-100"
           >
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
         </div>

         {/* Mobile Menu */}
         {mobileMenuOpen && (
           <div className="md:hidden pt-4 pb-3 border-t border-gray-100 mt-3">
             <nav className="flex flex-col space-y-3">
               {[
                 { name: 'Como funciona', id: 'como-funciona' },
                 { name: 'Resultados', id: 'resultados' },
                 { name: 'Planos', id: 'planos' },
                 { name: 'FAQ', id: 'faq' }
               ].map((item) => (
                 <button
                   key={item.id}
                   onClick={() => scrollToSection(item.id)}
                   className="text-left px-2 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600"
                 >
                   {item.name}
                 </button>
               ))}
               <div className="pt-3 flex flex-col gap-2">
                 <Link
                   href="/cliente"
                   className="text-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                 >
                   Entrar
                 </Link>
                 <a
                   href={whatsappLink}
                   className="text-center inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   <MessageCircle size={16} className="mr-2" />
                   Teste Grátis
                 </a>
               </div>
             </nav>
           </div>
         )}
       </div>
     </header>

     {/* Hero Section */}
     <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-white py-16 md:py-24">
       <div className="absolute inset-0 -z-10">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-white to-white"></div>
       </div>
       
       <div className="mx-auto max-w-7xl px-4">
         <div className="grid items-center gap-8 lg:grid-cols-2">
           {/* Left Column */}
           <div className="text-center lg:text-left">
             <div className="inline-flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
               <Badge variant="primary">+2.500 leads gerados</Badge>
               <Badge variant="solar">Ativação em 24h</Badge>
               <Badge>Sem contrato anual</Badge>
             </div>

             <h1 className="text-4xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
               Enquanto você dorme, seu consultor inteligente já está qualificando clientes de energia solar no WhatsApp.
             </h1>

             <p className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl">
               Ele responde automaticamente, faz perguntas estratégicas, identifica interesse real e só te chama quando o cliente está pronto para fechar.
             </p>

             {/* Stats */}
             <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
               <div className="rounded-xl border border-gray-200 bg-white p-4">
                 <div className="text-2xl font-bold text-emerald-600">{leadsCount}+</div>
                 <div className="text-sm text-gray-500">Leads qualificados</div>
               </div>
               <div className="rounded-xl border border-gray-200 bg-white p-4">
                 <div className="text-2xl font-bold text-emerald-600">{economiaCount}k</div>
                 <div className="text-sm text-gray-500">Economia em contas</div>
               </div>
             </div>

             {/* CTA Buttons */}
             <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
               <a
                 href={whatsappLink}
                 className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 <MessageCircle className="mr-2" size={20} />
                 Teste Grátis
               </a>
               <button
                 onClick={() => scrollToSection('planos')}
                 className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
               >
                 Ver Plano Premium
                 <ChevronRight className="ml-2" size={16} />
               </button>
             </div>
           </div>

           {/* Right Column - Chat Preview */}
           <div className="relative">
             <div className="absolute inset-0 -z-10">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
             </div>
             
             <div className="relative mx-auto max-w-sm">
               <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
                 {/* Chat Header */}
                 <div className="bg-emerald-600 p-4 text-white">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                       <Sun size={20} />
                     </div>
                     <div>
                       <p className="font-semibold">Consultor Solar Premium</p>
                       <p className="text-xs opacity-90">Atendimento 24h • Qualificação Inteligente</p>
                     </div>
                   </div>
                 </div>

                 {/* Chat Messages */}
                 <div className="p-4 space-y-4">
                   <div className="flex items-start gap-2">
                     <div className="h-8 w-8 rounded-full bg-emerald-100 flex-shrink-0"></div>
                     <div className="bg-gray-100 rounded-2xl p-3 max-w-[80%]">
                       <p className="text-sm text-gray-800">
                         Olá! Sou o consultor solar automatizado. 
                         Para começar, qual o valor médio da sua conta de luz?
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-2 justify-end">
                     <div className="bg-emerald-100 rounded-2xl p-3 max-w-[80%]">
                       <p className="text-sm text-gray-800">R$ 350</p>
                     </div>
                     <div className="h-8 w-8 rounded-full bg-emerald-600 flex-shrink-0"></div>
                   </div>

                   <div className="flex items-start gap-2">
                     <div className="h-8 w-8 rounded-full bg-emerald-100 flex-shrink-0"></div>
                     <div className="bg-gray-100 rounded-2xl p-3 max-w-[80%]">
                       <p className="text-sm text-gray-800">
                         Perfeito! Com R$ 350 você pode economizar até R$ 315/mês. 
                         Sua rede é monofásica, bifásica ou trifásica?
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-2 justify-end">
                     <div className="bg-emerald-100 rounded-2xl p-3 max-w-[80%]">
                       <p className="text-sm text-gray-800">Bifásica</p>
                     </div>
                     <div className="h-8 w-8 rounded-full bg-emerald-600 flex-shrink-0"></div>
                   </div>

                   <div className="flex items-start gap-2">
                     <div className="h-8 w-8 rounded-full bg-emerald-100 flex-shrink-0"></div>
                     <div className="bg-gray-100 rounded-2xl p-3 max-w-[80%]">
                       <p className="text-sm text-gray-800">
                         📅 Reunião agendada! 
                         <br />
                         Link: https://calendly.com/consultor-solar/30min
                         <br />
                         Horário: 15/03 10h30
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Chat Input */}
                 <div className="border-t border-gray-200 p-4">
                   <div className="flex items-center gap-2">
                     <input
                       type="text"
                       placeholder="Digite sua resposta..."
                       className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                       disabled
                     />
                     <button className="rounded-full bg-emerald-600 p-2 text-white">
                       <MessageCircle size={18} />
                     </button>
                   </div>
                 </div>
               </div>

               {/* Floating Badge */}
               <div className="absolute -bottom-4 -right-4 bg-white rounded-full shadow-lg p-3">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span className="text-xs font-semibold">Responde em <span className="text-emerald-600">2 segundos</span></span>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </section>

     {/* Resultados Section */}
     <section id="resultados" className="py-16 md:py-24 bg-emerald-600">
       <div className="mx-auto max-w-7xl px-4">
         <SectionTitle
           eyebrow="Resultados"
           title="O que nossos clientes estão conquistando"
           subtitle="Dados reais de empresas que já automatizaram suas vendas"
         />

         <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
           <StatCard icon={Users} value="+2.500" label="Leads qualificados/mês" />
           <StatCard icon={TrendingUp} value="+50%" label="Aumento em conversões" />
           <StatCard icon={Clock} value="-70%" label="Tempo de resposta" />
           <StatCard icon={DollarSign} value="R$ 600k" label="Economia acumulada" />
         </div>

         <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
           <Testimonial
             name="João Silva"
             role="Solar Energy SP"
             content="Aumentamos nossa conversão em 50% no primeiro mês. O bot qualifica tão bem que nosso time só foca em fechar!"
             rating={5}
           />
           <Testimonial
             name="Maria Santos"
             role="EcoPower Solutions"
             content="Atendemos 3x mais leads com a mesma equipe. O retorno sobre investimento veio em menos de 30 dias."
             rating={5}
           />
           <Testimonial
             name="Carlos Oliveira"
             role="Solar Tech Brasil"
             content="A integração foi super simples e o suporte é excelente. Recomendo para todas empresas do setor."
             rating={5}
           />
         </div>
       </div>
     </section>

     {/* Plano Premium Section */}
     <section id="planos" className="py-16 md:py-24 bg-white">
       <div className="mx-auto max-w-7xl px-4">
         <SectionTitle
           eyebrow="Plano Premium"
           title="Comercial Solar Automatizado"
           subtitle="O consultor inteligente que transforma seu WhatsApp em uma ferramenta de vendas 24h"
         />

         <div className="mt-12 text-center">
           <div className="inline-flex rounded-lg bg-gray-100 p-1">
             {['mensal', 'trimestral', 'anual'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setSelectedPlan(tab)}
                 className={`rounded-md px-6 py-2 text-sm font-medium capitalize transition-all ${
                   selectedPlan === tab 
                     ? 'bg-white text-emerald-600 shadow' 
                     : 'text-gray-600 hover:text-gray-900'
                 }`}
               >
                 {tab}
                 {tab === 'anual' && (
                   <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                     -20%
                   </span>
                 )}
               </button>
             ))}
           </div>
         </div>

         <div className="mt-8">
           <Card
             title="Plano Premium — Comercial Solar Automatizado"
             icon={TrendingUp}
             highlight={true}
             price={selectedPlan === 'anual' ? "R$ 477" : selectedPlan === 'trimestral' ? "R$ 1.491" : "R$ 497"}
             period="mês"
           >
             <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
               +50% de ROI
             </div>
             <ul className="space-y-3 mt-4">
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Consultor Solar com IA treinada</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Qualificação inteligente de leads</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Agendamento automático de reuniões</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Follow-up automático em 3 etapas</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Integração com Calendly / Google Agenda</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Dashboard com KPIs em tempo real</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Suporte prioritário 24/7</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Taxa de implementação: R$ 1.497 (pagamento único)</span>
               </li>
               <li className="flex items-center gap-2">
                 <CheckCircle size={16} className="text-emerald-500" />
                 <span className="text-gray-600">Sem taxa por venda gerada</span>
               </li>
             </ul>
             <div className="mt-6">
               <a
                 href={whatsappLink}
                 className="block w-full rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Teste Grátis por 7 dias
               </a>
             </div>
           </Card>
         </div>

         <p className="mt-6 text-center text-sm text-gray-500">
           *Ative agora • Sem fidelidade • Suporte especializado
         </p>
       </div>
     </section>

     {/* Como Funciona Section */}
     <section id="como-funciona" className="py-16 md:py-24 bg-gray-50">
       <div className="mx-auto max-w-7xl px-4">
         <SectionTitle
           eyebrow="Como Funciona"
           title="Transforme seu WhatsApp em um consultor solar 24h"
           subtitle="Configuração rápida e automação total"
         />

         <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card
             title="1. Conecte seu WhatsApp"
             icon={MessageCircle}
           >
             <p className="text-gray-600">
               Conecte seu WhatsApp Business em minutos. 
               Nenhuma instalação complexa ou conhecimento técnico necessário.
             </p>
           </Card>

           <Card
             title="2. Configure as regras"
             icon={Zap}
             highlight={true}
           >
             <p className="text-gray-600">
               Defina perguntas de qualificação, respostas automáticas 
               e regras para agendamento automático.
             </p>
           </Card>

           <Card
             title="3. Acompanhe os resultados"
             icon={BarChart3}
           >
             <p className="text-gray-600">
               Receba relatórios diários com leads qualificados, 
               taxa de conversão e economia gerada.
             </p>
           </Card>
         </div>

         <div className="mt-12 text-center">
           <a
             href={whatsappLink}
             className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
             target="_blank"
             rel="noopener noreferrer"
           >
             Começar Agora
             <ChevronRight className="ml-2" size={18} />
           </a>
         </div>
       </div>
     </section>

     {/* FAQ Section */}
     <section id="faq" className="py-16 md:py-24 bg-gray-50">
       <div className="mx-auto max-w-3xl px-4">
         <SectionTitle
           eyebrow="FAQ"
           title="Perguntas Frequentes"
           subtitle="Tire suas dúvidas sobre o Consultor Solar Automatizado"
         />

         <div className="mt-12 space-y-3">
           <FAQ
             question="Como funciona o agendamento automático?"
             answer="O sistema integra com Calendly ou Google Agenda. Após a qualificação, o consultor envia um link de agendamento e envia lembretes automaticamente."
           />
           <FAQ
             question="Posso cancelar a qualquer momento?"
             answer="Sim! Nossos planos são mensais e você pode cancelar quando quiser, sem multa ou burocracia."
           />
           <FAQ
             question="Como é a integração com WhatsApp?"
             answer="Disponibilizamos um QR Code que você escaneia com o WhatsApp do seu negócio. Em segundos a integração é feita e o bot começa a funcionar."
           />
           <FAQ
             question="O bot entende diferentes tipos de resposta?"
             answer="Sim! O consultor foi treinado para entender variações nas respostas dos clientes, como 'minha conta é 350', 'pago cerca de R$350', '350 reais', etc."
           />
           <FAQ
             question="O que acontece se o bot não souber responder?"
             answer="O bot transfere automaticamente a conversa para um atendente humano, sem que o cliente perceba a transição."
           />
         </div>
       </div>
     </section>

     {/* CTA Final */}
     <section className="py-16 md:py-24 bg-white">
       <div className="mx-auto max-w-4xl px-4">
         <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 md:p-12 text-center text-white">
           <h2 className="text-3xl md:text-4xl font-bold mb-4">
             Pronto para transformar suas vendas?
           </h2>
           <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
             Junte-se a mais de 2.500 empresas de energia solar que já automatizaram 
             seu atendimento no WhatsApp.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a
               href={whatsappLink}
               className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-sm transition-all hover:bg-gray-100"
               target="_blank"
               rel="noopener noreferrer"
             >
               <MessageCircle className="mr-2" size={20} />
               Teste Grátis
             </a>
             <button
               onClick={() => scrollToSection('planos')}
               className="inline-flex items-center justify-center rounded-xl border-2 border-white bg-transparent px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
             >
               Ver Plano Premium
             </button>
           </div>
           <p className="mt-6 text-sm text-emerald-200">
             Ative agora • Sem fidelidade • Suporte especializado
           </p>
         </div>
       </div>
     </section>

     {/* Footer */}
     <footer className="border-t border-gray-200 bg-gray-50 py-12">
       <div className="mx-auto max-w-7xl px-4">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {/* Company Info */}
           <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                 <Sun className="text-white" size={20} />
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-900">Consultor Solar</p>
                 <p className="text-xs text-gray-500">Automação para WhatsApp</p>
               </div>
             </div>
             <p className="text-sm text-gray-600">
               Automatize suas vendas de energia solar no WhatsApp com nosso consultor inteligente.
             </p>
           </div>

           {/* Links */}
           <div>
             <h4 className="font-semibold text-gray-900 mb-4">Produto</h4>
             <ul className="space-y-2">
               {['Como funciona', 'Resultados', 'Planos', 'FAQ'].map((item) => (
                 <li key={item}>
                   <button
                     onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                     className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                   >
                     {item}
                   </button>
                 </li>
               ))}
             </ul>
           </div>

           <div>
             <h4 className="font-semibold text-gray-900 mb-4">Empresa</h4>
             <ul className="space-y-2">
               {['Sobre', 'Cases', 'Blog', 'Contato'].map((item) => (
                 <li key={item}>
                   <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                     {item}
                   </a>
                 </li>
               ))}
             </ul>
           </div>

           <div>
             <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
             <ul className="space-y-2">
               {['Termos', 'Privacidade', 'Cookies', 'Segurança'].map((item) => (
                 <li key={item}>
                   <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                     {item}
                   </a>
                 </li>
               ))}
             </ul>
           </div>
         </div>

         <div className="mt-8 pt-8 border-t border-gray-200">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-sm text-gray-500">
               © {new Date().getFullYear()} Consultor Solar. Todos os direitos reservados.
             </p>
             <div className="flex items-center gap-4">
               <a
                 href={whatsappLink}
                 className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 WhatsApp
               </a>
               <Link href="/cliente" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                 Área do Cliente
                </Link>
             </div>
           </div>
         </div>
       </div>
     </footer>
   </div>
 )
}
