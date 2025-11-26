import React from 'react'

type Props = {
  page: number
  setPage: (p:number)=>void
  pageSize: number
  setPageSize: (s:number)=>void
  totalItems: number
  totalPages: number
}

export default function Pagination({ page, setPage, pageSize, setPageSize, totalItems, totalPages }: Props){
  if (totalItems <= pageSize) return null
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Anterior</button>
        <span className="text-sm text-gray-600">Página <strong>{page}</strong> de {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">Siguiente</button>
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">Items por página:</label>
        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
          {[5,10,20,50].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}
