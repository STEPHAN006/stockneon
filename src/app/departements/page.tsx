'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { Building2, Download, FileSpreadsheet, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface Department {
  id: number
  name: string
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Partial<Department>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/departments')
      const data = await response.json()
      setDepartments(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error)
      toast.error('Erreur lors du chargement des départements')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingDepartment.name?.trim()) {
      toast.error('Le nom du département est requis')
      return
    }

    setIsSaving(true)
    try {
      const method = editingDepartment.id ? 'PUT' : 'POST'
      const url = editingDepartment.id 
        ? `/api/departments/${editingDepartment.id}` 
        : '/api/departments'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingDepartment.name.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingDepartment.id 
          ? `Département "${data.name}" mis à jour avec succès !` 
          : `Département "${data.name}" créé avec succès !`
        )
        setIsEditDialogOpen(false)
        setEditingDepartment({})
        fetchDepartments()
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success(`Département "${departments.find(d => d.id === id)?.name}" supprimé avec succès !`)
        fetchDepartments()
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
      ['Nom'],
      ...departments.map(d => [d.name])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `departements-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Export CSV téléchargé ! ${departments.length} département(s) exporté(s).`)
  }

  const handleExportExcel = () => {
    const worksheetData = [
      ['Nom'],
      ...departments.map(d => [d.name])
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Départements')

    // Mettre en gras l'en-tête
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { font: { bold: true } }
      }
    }

    XLSX.writeFile(workbook, `departements-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success(`Export Excel téléchargé ! ${departments.length} département(s) exporté(s).`)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Départements</h1>
            <p className="text-gray-600">Gestion des départements</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={!departments.length} variant="outline">
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button onClick={handleExportExcel} disabled={!departments.length} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button onClick={() => { setEditingDepartment({}); setIsEditDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Nouveau Département
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Total Départements</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Départements enregistrés</CardDescription>
            </div>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>

        {/* Table des départements */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Départements</CardTitle>
            <CardDescription>Gérez les départements de votre organisation</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-lg">Chargement...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map(department => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(department)}>
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
                                <AlertDialogTitle>Supprimer le département</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer "{department.name}" ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(department.id)}>Supprimer</AlertDialogAction>
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

        {/* Dialog Création / Édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDepartment.id ? 'Modifier le département' : 'Nouveau département'}</DialogTitle>
              <DialogDescription>
                {editingDepartment.id ? 'Modifiez le nom du département' : 'Ajoutez un nouveau département'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={editingDepartment.name || ''}
                  onChange={e => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                  placeholder="Nom du département"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>Annuler</Button>
                <Button onClick={handleSave} disabled={isSaving || !editingDepartment.name?.trim()}>
                  {isSaving ? 'Enregistrement...' : (editingDepartment.id ? 'Mettre à jour' : 'Créer')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
