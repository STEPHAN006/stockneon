'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, TrendingUp, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatDateTime } from '@/lib/utils'

interface DashboardData {
  stats: {
    totalPieces: number
    totalStock: number
    totalValue: number
  }
  recentEntries: any[]
  recentExits: any[]
  lowStockPieces: any[]
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des données...</div>
        </div>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Erreur lors du chargement des données</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de votre gestion de stock</p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pièces</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalPieces}</div>
              <p className="text-xs text-muted-foreground">
                Pièces enregistrées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">
                Unités en stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(data.stats.totalValue)} AR</div>
              <p className="text-xs text-muted-foreground">
                Valeur du stock
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>Accès direct aux fonctions principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button asChild>
                  <Link href="/entree">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Nouvelle Entrée
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sortie">
                    <ArrowUpFromLine className="mr-2 h-4 w-4" />
                    Nouvelle Sortie
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/inventaire">
                    <Package className="mr-2 h-4 w-4" />
                    Voir Inventaire
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/historique">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Historique
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stock faible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                Stock Faible
              </CardTitle>
              <CardDescription>Pièces nécessitant un réapprovisionnement</CardDescription>
            </CardHeader>
            <CardContent>
              {data.lowStockPieces.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun stock faible</p>
              ) : (
                <div className="space-y-2">
                  {data.lowStockPieces.slice(0, 5).map((piece) => (
                    <div key={piece.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{piece.name}</span>
                      <Badge variant="destructive">{piece.stock}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dernières entrées */}
          <Card>
            <CardHeader>
              <CardTitle>Dernières Entrées</CardTitle>
              <CardDescription>Les 5 dernières entrées de stock</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune entrée récente</p>
              ) : (
                <div className="space-y-3">
                  {data.recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{entry.piece.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.supplier.name} • {formatDateTime(entry.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">+{entry.qty}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(entry.total)} AR</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dernières sorties */}
          <Card>
            <CardHeader>
              <CardTitle>Dernières Sorties</CardTitle>
              <CardDescription>Les 5 dernières sorties de stock</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentExits.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune sortie récente</p>
              ) : (
                <div className="space-y-3">
                  {data.recentExits.map((exit) => (
                    <div key={exit.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{exit.piece.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exit.technician.name} • {formatDateTime(exit.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">-{exit.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
    </Layout>
  )
}
