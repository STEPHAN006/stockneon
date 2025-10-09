'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Package, Search, Plus, Edit, Trash2, Eye, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, formatDateTime } from '@/lib/utils'
import * as XLSX from 'xlsx'


interface Entry {
  id: number
  date: string
  qty: number
  priceUnit: number
  total: number
  supplier?: {
    name: string
  }
  reference?: string
}

interface Exit {
  id: number
  date: string
  qty: number
  technician?: {
    name: string
  }
  observation?: string
}

interface Piece {
  id: number
  name: string
  description: string | null
  location: string | null
  stock: number
  minStock: number
  stockValue: number // Valeur totale du stock (calculée côté serveur)
  entries?: Entry[]
  exits?: Exit[]
}

export default function InventairePage() {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingPiece, setEditingPiece] = useState<Partial<Piece>>({})
  const [lowStockPieces, setLowStockPieces] = useState<Piece[]>([])

  useEffect(() => {
    fetchPieces()
    fetchLowStockAlerts()
  }, [])

  const fetchPieces = async () => {
    try {
      const response = await fetch(`/api/inventory?search=${search}`)
      const data = await response.json()
      setPieces(data.pieces || [])
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error)
      toast.error('Erreur lors du chargement de l\'inventaire')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLowStockAlerts = async () => {
    try {
      const response = await fetch('/api/stock-alerts')
      const data = await response.json()
      setLowStockPieces(data.lowStockPieces || [])
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error)
    }
  }

  const triggerStockAlerts = async () => {
    try {
      const response = await fetch('/api/stock-alerts', {
        method: 'POST'
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        fetchLowStockAlerts() // Rafraîchir les alertes
      } else {
        toast.error('Erreur lors de la vérification des alertes')
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes:', error)
      toast.error('Erreur lors de la vérification des alertes')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    fetchPieces()
  }

  const handleEdit = (piece: Piece) => {
    setEditingPiece(piece)
    setIsEditDialogOpen(true)
  }

  const handleView = async (piece: Piece) => {
    try {
      const response = await fetch(`/api/inventory/${piece.id}`)
      const data = await response.json()
      setSelectedPiece(data)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error)
      toast.error('Erreur lors du chargement des détails')
    }
  }

  const handleSave = async () => {
    try {
      const method = editingPiece.id ? 'PUT' : 'POST'
      const url = editingPiece.id ? `/api/inventory/${editingPiece.id}` : '/api/inventory'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPiece)
      })

      if (response.ok) {
        const piece = await response.json()
        toast.success(editingPiece.id ? `Pièce "${piece.name}" mise à jour avec succès !` : `Pièce "${piece.name}" créée avec succès !`)
        setIsEditDialogOpen(false)
        setEditingPiece({})
        fetchPieces()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(`Pièce "${pieces.find(p => p.id === id)?.name}" supprimée avec succès !`)
        fetchPieces()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const filteredPieces = pieces.filter(piece =>
    piece.name.toLowerCase().includes(search.toLowerCase()) ||
    piece.description?.toLowerCase().includes(search.toLowerCase()) ||
    piece.location?.toLowerCase().includes(search.toLowerCase())
  )

  const handleExportCSV = () => {
    const csvContent = [
      ['Nom', 'Description', 'Emplacement', 'Stock', 'Stock Minimum'],
      ...filteredPieces.map(piece => [
        piece.name,
        piece.description || '',
        piece.location || '',
        piece.stock.toString(),
        piece.minStock.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventaire-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Export CSV téléchargé ! ${filteredPieces.length} pièce(s) exportée(s).`)
  }

  const handleExportExcel = () => {
    const worksheetData = [
      ['Nom', 'Description', 'Emplacement', 'Stock', 'Stock Minimum'],
      ...filteredPieces.map(piece => [
        piece.name,
        piece.description || '',
        piece.location || '',
        piece.stock,
        piece.minStock
      ])
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaire')

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

    XLSX.writeFile(workbook, `inventaire-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success(`Export Excel téléchargé ! ${filteredPieces.length} pièce(s) exportée(s).`)
  }

  // Exporter l'historique (entrées + sorties) d'une pièce en Excel
  const exportPieceHistory = (piece: Piece) => {
    try {
      const headers = ['Type', 'Date', 'Quantité', 'Source', 'Total', 'Observation']

      const entryRows = (piece.entries || []).map((e: any) => [
        'Entrée',
        formatDateTime(e.date),
        e.qty,
        e.supplier?.name || e.reference || '',
        formatPrice(e.total || 0),
        ''
      ])

      const exitRows = (piece.exits || []).map((ex: any) => [
        'Sortie',
        formatDateTime(ex.date),
        ex.qty,
        ex.technician?.name || '',
        '',
        ex.observation || ''
      ])

      const worksheetData = [headers, ...entryRows, ...exitRows]
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historique')

      const safeName = (piece.name || 'piece').replace(/[^a-z0-9-_]/gi, '_')
      XLSX.writeFile(workbook, `historique-${safeName}-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Historique exporté !')
    } catch (error) {
      console.error('Erreur export historique:', error)
      toast.error('Erreur lors de l\'export de l\'historique')
    }
  }


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
            <p className="text-gray-600">Gestion des pièces en stock</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={filteredPieces.length === 0} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button onClick={handleExportExcel} disabled={filteredPieces.length === 0} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button onClick={() => {
              setEditingPiece({})
              setIsEditDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Pièce
            </Button>
          </div>
        </div>

        {/* Alertes de stock bas */}
        {lowStockPieces.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-orange-800 flex items-center">
                  🚨 Alertes Stock Bas ({lowStockPieces.length})
                </CardTitle>
                <CardDescription className="text-orange-600">
                  {lowStockPieces.length > 0 
                    ? "Les pièces suivantes ont atteint leur stock minimum"
                    : "Aucune alerte de stock bas pour le moment"
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={triggerStockAlerts}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Vérifier les alertes
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/test-email', { method: 'POST' })
                      const data = await response.json()
                      if (response.ok) {
                        toast.success('Email de test envoyé ! Vérifiez votre boîte mail.')
                      } else {
                        toast.error('Erreur lors de l\'envoi du test')
                      }
                    } catch (error) {
                      toast.error('Erreur lors du test d\'email')
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Test Email
                </Button>
              </div>
            </div>
          </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockPieces.map((piece) => (
                  <div key={piece.id} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-red-800">{piece.name}</h4>
                        <p className="text-sm text-red-600">
                          Stock: {piece.stock} / {piece.minStock}
                        </p>
                        <p className="text-xs text-gray-500">
                          Déficit: {piece.minStock - piece.stock} unités
                        </p>
                      </div>
                      <Badge variant="destructive">Stock Bas</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rechercher</CardTitle>
            <CardDescription>Filtrer les pièces par nom, description ou emplacement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une pièce..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pièces en Stock ({filteredPieces.length})</CardTitle>
                <CardDescription>Liste de toutes les pièces disponibles</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Valeur totale de l'inventaire</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatPrice(filteredPieces.reduce((sum, p) => sum + p.stockValue, 0))}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-lg">Chargement...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Emplacement</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Stock Min</TableHead>
                    <TableHead className="text-right">Valeur Totale</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPieces.map((piece) => (
                    <TableRow key={piece.id} className={piece.stock <= piece.minStock ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{piece.name}</TableCell>
                      <TableCell>{piece.description || '-'}</TableCell>
                      <TableCell>{piece.location || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={piece.stock <= piece.minStock ? 'destructive' : piece.stock <= 5 ? 'secondary' : 'default'}>
                          {piece.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {piece.minStock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(piece.stockValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(piece)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(piece)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la pièce</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer "{piece.name}" ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(piece.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog d'édition/création */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPiece.id ? 'Modifier la pièce' : 'Nouvelle pièce'}
              </DialogTitle>
              <DialogDescription>
                {editingPiece.id ? 'Modifiez les informations de la pièce' : 'Ajoutez une nouvelle pièce à l\'inventaire'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={editingPiece.name || ''}
                  onChange={(e) => setEditingPiece({ ...editingPiece, name: e.target.value })}
                  placeholder="Nom de la pièce"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingPiece.description || ''}
                  onChange={(e) => setEditingPiece({ ...editingPiece, description: e.target.value })}
                  placeholder="Description de la pièce"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Emplacement</label>
                <Input
                  value={editingPiece.location || ''}
                  onChange={(e) => setEditingPiece({ ...editingPiece, location: e.target.value })}
                  placeholder="Emplacement de la pièce"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock initial</label>
                <Input
                  type="number"
                  value={editingPiece.stock || 0}
                  onChange={(e) => setEditingPiece({ ...editingPiece, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock minimum</label>
                <Input
                  type="number"
                  value={editingPiece.minStock || 0}
                  onChange={(e) => setEditingPiece({ ...editingPiece, minStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Seuil d'alerte pour les notifications</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  {editingPiece.id ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualisation */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} >
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Détails de la pièce</DialogTitle>
                  <DialogDescription>
                    Informations complètes et historique de la pièce
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedPiece && exportPieceHistory(selectedPiece)}
                    disabled={!selectedPiece}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exporter l'historique
                  </Button>
                </div>
              </div>
            </DialogHeader>
            {selectedPiece && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Informations de la pièce (gauche - 1/3) */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <p className="text-lg font-bold">{selectedPiece.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stock actuel</label>
                    <p className="text-lg font-bold text-blue-600">{selectedPiece.stock}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stock minimum</label>
                    <p className="text-lg">{selectedPiece.minStock}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-lg">{selectedPiece.description || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emplacement</label>
                    <p className="text-lg">{selectedPiece.location || '-'}</p>
                  </div>
                </div>

                {/* Historique (droite - 2/3) */}
                <div className="md:col-span-2 space-y-6">
                  {selectedPiece.entries && selectedPiece.entries.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Dernières entrées</h3>
                      <div className="space-y-2">
                        {selectedPiece.entries.slice(-2).map((entry: any) => (
                          <div key={`last-${entry.id}`} className="flex justify-between items-center p-2 bg-green-100 rounded">
                            <div>
                              <p className="font-medium">+{entry.qty} unités</p>
                              <p className="text-sm text-gray-600">
                                {entry.supplier?.name} • {formatDateTime(entry.date)}
                              </p>
                            </div>
                            <p className="font-medium">{formatPrice(entry.total)} AR</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPiece.exits && selectedPiece.exits.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Dernières sorties</h3>
                      <div className="space-y-2">
                        {selectedPiece.exits.slice(-2).map((exit: any) => (
                          <div key={`last-ex-${exit.id}`} className="flex justify-between items-center p-2 bg-red-100 rounded">
                            <div>
                              <p className="font-medium">-{exit.qty} unités</p>
                              <p className="text-sm text-gray-600">
                                {exit.technician?.name} • {formatDateTime(exit.date)}
                              </p>
                            </div>
                            {exit.observation && (
                              <p className="text-sm text-gray-600">{exit.observation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
