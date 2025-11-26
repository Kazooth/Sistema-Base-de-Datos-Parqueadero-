import React from 'react'
import { Car, Clock, Calendar, Home, Plus } from 'lucide-react'

type Props = {
  activeView: string
  setActiveView: (v: any) => void
}

export default function Header({ activeView, setActiveView }: Props){
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
                <Car className="text-white" size={32} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ParqueoSmart Pro</h1>
              <p className="text-sm text-gray-500">Sistema de Gestión Avanzada</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-xl px-3 py-2">
            <Clock className="text-gray-500" size={18} />
            <span className="text-sm font-medium text-gray-700">{new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span>
            <Calendar className="text-gray-500 ml-3" size={18} />
            <span className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('es-CO')}</span>
          </div>
        </div>
        <div className="flex space-x-1 pb-4 overflow-x-auto">
          {(
            [
              {id:'dashboard',label:'Dashboard',icon:Home},
              {id:'entrada',label:'Nueva Entrada',icon:Plus},
              {id:'vehiculos',label:'Vehículos Activos',icon:Car},
              {id:'mapa',label:'Mapa de Espacios',icon:Home}
            ] as const
          ).map(({id,label,icon:Icon}) => (
            <button key={id} onClick={()=>setActiveView(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${activeView===id? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50':'text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={18}/><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
