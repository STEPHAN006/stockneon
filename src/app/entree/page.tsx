'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowDownToLine, Calculator } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

interface Piece {
  id: number
  name: string
  stock: number
}

interface Supplier {
  id: number
  name: string
}

export default function EntreePage() {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16), // Format datetime-local
    reference: '',
    pieceId: '',
    supplierId: '',
    qty: '',
    priceUnit: ''
  })
  const [isAddingPiece, setIsAddingPiece] = useState(false)
  const [isAddingSupplier, setIsAddingSupplier] = useState(false)
  const [newPiece, setNewPiece] = useState({ name: '', description: '', location: '' })
  const [newSupplier, setNewSupplier] = useState({ name: '' })

  useEffect(() => {
    fetchPieces()
    fetchSuppliers()
  }, [])

  const fetchPieces = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      setPieces(data.pieces || [])
    } catch (error) {
      console.error('Erreur lors du chargement des pièces:', error)
      toast.error('Erreur lors du chargement des pièces')
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const data = await response.json()
      setSuppliers(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error)
      toast.error('Erreur lors du chargement des fournisseurs')
    }
  }

  const calculateTotal = () => {
    const qty = parseFloat(formData.qty) || 0
    const priceUnit = parseFloat(formData.priceUnit) || 0
    return formatPrice(qty * priceUnit)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          qty: parseInt(formData.qty),
          priceUnit: parseFloat(formData.priceUnit)
        }),
      })

      if (response.ok) {
        const entry = await response.json()
        toast.success(`Entrée enregistrée avec succès ! +${formData.qty} unités ajoutées au stock.`)
        setFormData({
          date: new Date().toISOString().slice(0, 16),
          reference: '',
          pieceId: '',
          supplierId: '',
          qty: '',
          priceUnit: ''
        })
        fetchPieces() // Rafraîchir la liste des pièces pour mettre à jour les stocks
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPiece = async () => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPiece)
      })

      if (response.ok) {
        const piece = await response.json()
        setPieces([...pieces, piece])
        setFormData({ ...formData, pieceId: piece.id.toString() })
        setNewPiece({ name: '', description: '', location: '' })
        setIsAddingPiece(false)
        toast.success(`Pièce "${piece.name}" ajoutée avec succès !`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const handleAddSupplier = async () => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      })

      if (response.ok) {
        const supplier = await response.json()
        setSuppliers([...suppliers, supplier])
        setFormData({ ...formData, supplierId: supplier.id.toString() })
        setNewSupplier({ name: '' })
        setIsAddingSupplier(false)
        toast.success(`Fournisseur "${supplier.name}" ajouté avec succès !`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const selectedPiece = pieces.find(p => p.id.toString() === formData.pieceId)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Entrée</h1>
          <p className="text-gray-600">Enregistrer une nouvelle entrée de stock</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownToLine className="mr-2 h-5 w-5" />
              Formulaire d'entrée
            </CardTitle>
            <CardDescription>
              Remplissez les informations pour enregistrer une nouvelle entrée de stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date et heure *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Référence commande</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ex: CMD-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="piece">Pièce *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingPiece(true)}
                    >
                      + Ajouter
                    </Button>
                  </div>
                  <Select
                    value={formData.pieceId}
                    onValueChange={(value) => setFormData({ ...formData, pieceId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une pièce" />
                    </SelectTrigger>
                    <SelectContent>
                      {pieces.map((piece) => (
                        <SelectItem key={piece.id} value={piece.id.toString()}>
                          {piece.name} (Stock: {piece.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="supplier">Fournisseur *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingSupplier(true)}
                    >
                      + Ajouter
                    </Button>
                  </div>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qty">Quantité *</Label>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceUnit">Prix unitaire (AR) *</Label>
                  <Input
                    id="priceUnit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceUnit}
                    onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Calcul du total */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5 text-gray-500" />
                    <span className="text-lg font-medium">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {calculateTotal()} AR
                  </div>
                </div>
                {formData.qty && formData.priceUnit && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.qty} × {formData.priceUnit} AR = {calculateTotal()} AR
                  </p>
                )}
              </div>

              {/* Informations sur la pièce sélectionnée */}
              {selectedPiece && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Informations sur la pièce</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Stock actuel:</span>
                      <span className="ml-2 font-medium">{selectedPiece.stock}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Nouveau stock:</span>
                      <span className="ml-2 font-medium">
                        {selectedPiece.stock + (parseInt(formData.qty) || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({
                    date: new Date().toISOString().slice(0, 16),
                    reference: '',
                    pieceId: '',
                    supplierId: '',
                    qty: '',
                    priceUnit: ''
                  })}
                >
                  Réinitialiser
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Enregistrement...' : 'Enregistrer l\'entrée'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Dialog pour ajouter une pièce */}
        <Dialog open={isAddingPiece} onOpenChange={setIsAddingPiece}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Pièce</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle pièce à l'inventaire
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={newPiece.name}
                  onChange={(e) => setNewPiece({ ...newPiece, name: e.target.value })}
                  placeholder="Nom de la pièce"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newPiece.description}
                  onChange={(e) => setNewPiece({ ...newPiece, description: e.target.value })}
                  placeholder="Description de la pièce"
                />
              </div>
              <div>
                <Label>Emplacement</Label>
                <Input
                  value={newPiece.location}
                  onChange={(e) => setNewPiece({ ...newPiece, location: e.target.value })}
                  placeholder="Emplacement de la pièce"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingPiece(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddPiece} disabled={!newPiece.name}>
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog pour ajouter un fournisseur */}
        <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau Fournisseur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau fournisseur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingSupplier(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddSupplier} disabled={!newSupplier.name}>
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
