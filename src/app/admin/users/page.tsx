// src/app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Layout } from '@/components/layout'

export default function UsersManagementPage() {
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [router])

  // Charger la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Créer un nouvel utilisateur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsCreating(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })

      if (response.ok) {
        toast.success('Utilisateur créé avec succès')
        setEmail('')
        setPassword('')
        setRole('USER')
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
    } finally {
      setIsCreating(false)
    }
  }

  // Supprimer un utilisateur
  const handleDelete = async (userId: string) => {
    try {
      setDeletingId(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Utilisateur supprimé avec succès')
        fetchUsers()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Layout>
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Créer un nouvel utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? 'Création en cours...' : "Créer l'utilisateur"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500">Rôle: {user.role}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                >
                  {deletingId === user.id ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  )
}