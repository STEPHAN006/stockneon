'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { History, Download, Filter, ArrowDownToLine, ArrowUpFromLine, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, formatDateTime } from '@/lib/utils'
import * as XLSX from 'xlsx'


interface HistoryItem {
  id: number
  type: 'entry' | 'exit'
  date: string
  piece: {
    name: string
  }
  qty: number
  total?: number
  supplier?: {
    name: string
  }
  technician?: {
    name: string
  }
  observation?: string
  reference?: string
}

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    type: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchHistory()
  }, [filters, currentPage])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)
      if (filters.type !== 'all') params.append('type', filters.type)

      const response = await fetch(`/api/history?${params}`)
      const data = await response.json()
      setHistory(data.history || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
      toast.error('Erreur lors du chargement de l\'historique')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Type', 'Date', 'Pièce', 'Quantité', 'Total', 'Fournisseur/Technicien', 'Observation', 'Référence'],
      ...history.map(item => [
        item.type === 'entry' ? 'Entrée' : 'Sortie',
        formatDateTime(item.date),
        item.piece.name,
        item.qty.toString(),
        item.total ? formatPrice(item.total) : '',
        item.supplier?.name || item.technician?.name || '',
        item.observation || '',
        item.reference || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historique-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Export CSV téléchargé ! ${history.length} opération(s) exportée(s).`)
  }

  const handleExportExcel = () => {
    const worksheetData = [
      ['Type', 'Date', 'Pièce', 'Quantité', 'Total', 'Fournisseur/Technicien', 'Observation', 'Référence'],
      ...history.map(item => [
        item.type === 'entry' ? 'Entrée' : 'Sortie',
        formatDateTime(item.date),
        item.piece.name,
        item.qty,
        item.total || 0,
        item.supplier?.name || item.technician?.name || '',
        item.observation || '',
        item.reference || ''
      ])
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historique')

    // Styling pour l'en-tête
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6E6FA' } }
      }
    }

    XLSX.writeFile(workbook, `historique-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success(`Export Excel téléchargé ! ${history.length} opération(s) exportée(s).`)
  }

  const getTypeIcon = (type: string) => {
    return type === 'entry' ? (
      <ArrowDownToLine className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpFromLine className="h-4 w-4 text-red-600" />
    )
  }

  const getTypeBadge = (type: string) => {
    return type === 'entry' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Entrée
      </Badge>
    ) : (
      <Badge variant="destructive">
        Sortie
      </Badge>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique</h1>
            <p className="text-gray-600">Historique des entrées et sorties de stock</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={history.length === 0} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button onClick={handleExportExcel} disabled={history.length === 0} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtres
            </CardTitle>
            <CardDescription>Filtrez l'historique par date et type d'opération</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Date de début</label>
                <Input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date de fin</label>
                <Input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="entry">Entrées</SelectItem>
                    <SelectItem value="exit">Sorties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setFilters({ from: '', to: '', type: 'all' })}
                  variant="outline"
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des Opérations</CardTitle>
            <CardDescription>
              {history.length} opération(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-lg">Chargement...</div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <History className="h-8 w-8 mb-2" />
                <p>Aucune opération trouvée</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Pièce</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fournisseur/Technicien</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={`${item.type}-${item.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            {getTypeBadge(item.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(item.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.piece.name}
                        </TableCell>
                        <TableCell>
                          <span className={item.type === 'entry' ? 'text-green-600' : 'text-red-600'}>
                            {item.type === 'entry' ? '+' : '-'}{item.qty}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.total ? `${formatPrice(item.total)} AR` : '-'}
                        </TableCell>
                        <TableCell>
                          {item.supplier?.name || item.technician?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {item.reference && (
                              <div>Réf: {item.reference}</div>
                            )}
                            {item.observation && (
                              <div>{item.observation}</div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
