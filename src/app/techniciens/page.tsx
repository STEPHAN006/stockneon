'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Users, Plus, Edit, Trash2, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface Technician {
  id: number
  name: string
  role: string | null
}

export default function TechniciensPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<Partial<Technician>>({})

  useEffect(() => {
    fetchTechnicians()
  }, [])

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/technicians')
      const data = await response.json()
      setTechnicians(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des techniciens:', error)
      toast.error('Erreur lors du chargement des techniciens')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician)
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const method = editingTechnician.id ? 'PUT' : 'POST'
      const url = editingTechnician.id ? `/api/technicians/${editingTechnician.id}` : '/api/technicians'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingTechnician.name,
          role: editingTechnician.role 
        })
      })

      if (response.ok) {
        const technician = await response.json()
        toast.success(editingTechnician.id ? `Technicien "${technician.name}" mis à jour avec succès !` : `Technicien "${technician.name}" créé avec succès !`)
        setIsEditDialogOpen(false)
        setEditingTechnician({})
        fetchTechnicians()
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
      const response = await fetch(`/api/technicians/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(`Technicien "${technicians.find(t => t.id === id)?.name}" supprimé avec succès !`)
        fetchTechnicians()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Nom', 'Rôle'],
      ...technicians.map(technician => [
        technician.name,
        technician.role || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `techniciens-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Export CSV téléchargé ! ${technicians.length} technicien(s) exporté(s).`)
  }

  const handleExportExcel = () => {
    const worksheetData = [
      ['Nom', 'Rôle'],
      ...technicians.map(technician => [
        technician.name,
        technician.role || ''
      ])
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Techniciens')

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

    XLSX.writeFile(workbook, `techniciens-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success(`Export Excel téléchargé ! ${technicians.length} technicien(s) exporté(s).`)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Titre
    doc.setFontSize(20)
    doc.text('Liste des Techniciens', 14, 22)
    
    // Date de génération
    doc.setFontSize(10)
    doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 30)
    
    // Données du tableau
    const tableData = technicians.map(technician => [
      technician.name,
      technician.role || '-'
    ])

    // Tableau
    doc.autoTable({
      head: [['Nom', 'Rôle']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [230, 230, 250],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 }
      }
    })

    // Statistiques en bas
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Total des techniciens: ${technicians.length}`, 14, finalY)

    doc.save(`techniciens-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success(`Export PDF téléchargé ! ${technicians.length} technicien(s) exporté(s).`)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Techniciens</h1>
            <p className="text-gray-600">Gestion des techniciens</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={technicians.length === 0} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button onClick={handleExportExcel} disabled={technicians.length === 0} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button onClick={handleExportPDF} disabled={technicians.length === 0} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button onClick={() => {
              setEditingTechnician({})
              setIsEditDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Technicien
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Total Techniciens</CardTitle>
              <p className="text-xs text-muted-foreground">
                Techniciens enregistrés
              </p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicians.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Techniciens</CardTitle>
            <CardDescription>Gérez vos techniciens et leurs rôles</CardDescription>
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
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((technician) => (
                    <TableRow key={technician.id}>
                      <TableCell className="font-medium">{technician.name}</TableCell>
                      <TableCell>{technician.role || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(technician)}
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
                                <AlertDialogTitle>Supprimer le technicien</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer "{technician.name}" ? 
                                  Cette action est irréversible et supprimera également toutes les sorties associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(technician.id)}>
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
                {editingTechnician.id ? 'Modifier le technicien' : 'Nouveau technicien'}
              </DialogTitle>
              <DialogDescription>
                {editingTechnician.id ? 'Modifiez les informations du technicien' : 'Ajoutez un nouveau technicien'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={editingTechnician.name || ''}
                  onChange={(e) => setEditingTechnician({ ...editingTechnician, name: e.target.value })}
                  placeholder="Nom du technicien"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rôle</label>
                <Input
                  value={editingTechnician.role || ''}
                  onChange={(e) => setEditingTechnician({ ...editingTechnician, role: e.target.value })}
                  placeholder="Ex: Électricien, Plombier, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  {editingTechnician.id ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
