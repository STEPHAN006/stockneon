'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUpFromLine, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

interface Piece {
  id: number
  name: string
  stock: number
}

interface Technician {
  id: number
  name: string
  role: string | null
}

export default function SortiePage() {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16), // Format datetime-local
    pieceId: '',
    technicianId: '',
    qty: '',
    observation: ''
  })
  const [isAddingPiece, setIsAddingPiece] = useState(false)
  const [isAddingTechnician, setIsAddingTechnician] = useState(false)
  const [newPiece, setNewPiece] = useState({ name: '', description: '', location: '' })
  const [newTechnician, setNewTechnician] = useState({ name: '', role: '' })

  useEffect(() => {
    fetchPieces()
    fetchTechnicians()
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

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/technicians')
      const data = await response.json()
      setTechnicians(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des techniciens:', error)
      toast.error('Erreur lors du chargement des techniciens')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/exits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          qty: parseInt(formData.qty)
        }),
      })

      if (response.ok) {
        toast.success(`Sortie enregistrée avec succès ! -${formData.qty} unités retirées du stock.`)
        setFormData({
          date: new Date().toISOString().slice(0, 16),
          pieceId: '',
          technicianId: '',
          qty: '',
          observation: ''
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

  const handleAddTechnician = async () => {
    try {
      const response = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTechnician)
      })

      if (response.ok) {
        const technician = await response.json()
        setTechnicians([...technicians, technician])
        setFormData({ ...formData, technicianId: technician.id.toString() })
        setNewTechnician({ name: '', role: '' })
        setIsAddingTechnician(false)
        toast.success(`Technicien "${technician.name}" ajouté avec succès !`)
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
  const isStockInsufficient = selectedPiece && parseInt(formData.qty) > selectedPiece.stock

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Sortie</h1>
          <p className="text-gray-600">Enregistrer une nouvelle sortie de stock</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpFromLine className="mr-2 h-5 w-5" />
              Formulaire de sortie
            </CardTitle>
            <CardDescription>
              Remplissez les informations pour enregistrer une nouvelle sortie de stock
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
                    <Label htmlFor="technician">Technicien *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingTechnician(true)}
                    >
                      + Ajouter
                    </Button>
                  </div>
                  <Select
                    value={formData.technicianId}
                    onValueChange={(value) => setFormData({ ...formData, technicianId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un technicien" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((technician) => (
                        <SelectItem key={technician.id} value={technician.id.toString()}>
                          {technician.name} {technician.role && `(${technician.role})`}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="observation">Observation</Label>
                <Textarea
                  id="observation"
                  value={formData.observation}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  placeholder="Raison de la sortie, projet, etc."
                  rows={3}
                />
              </div>

              {/* Vérification du stock */}
              {selectedPiece && formData.qty && (
                <div className={`p-4 rounded-lg ${
                  isStockInsufficient 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center">
                    {isStockInsufficient ? (
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    ) : (
                      <div className="mr-2 h-5 w-5 rounded-full bg-green-500" />
                    )}
                    <div>
                      <h3 className={`font-medium ${
                        isStockInsufficient ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {isStockInsufficient ? 'Stock insuffisant' : 'Stock disponible'}
                      </h3>
                      <p className={`text-sm ${
                        isStockInsufficient ? 'text-red-700' : 'text-green-700'
                      }`}>
                        Stock actuel: {selectedPiece.stock} unités
                        {formData.qty && (
                          <>
                            {' • '}Demandé: {formData.qty} unités
                            {' • '}Reste: {selectedPiece.stock - parseInt(formData.qty)} unités
                          </>
                        )}
                      </p>
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
                    pieceId: '',
                    technicianId: '',
                    qty: '',
                    observation: ''
                  })}
                >
                  Réinitialiser
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isStockInsufficient}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer la sortie'}
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

        {/* Dialog pour ajouter un technicien */}
        <Dialog open={isAddingTechnician} onOpenChange={setIsAddingTechnician}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau Technicien</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau technicien
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={newTechnician.name}
                  onChange={(e) => setNewTechnician({ ...newTechnician, name: e.target.value })}
                  placeholder="Nom du technicien"
                />
              </div>
              <div>
                <Label>Rôle</Label>
                <Input
                  value={newTechnician.role}
                  onChange={(e) => setNewTechnician({ ...newTechnician, role: e.target.value })}
                  placeholder="Ex: Électricien, Plombier, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingTechnician(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddTechnician} disabled={!newTechnician.name}>
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
