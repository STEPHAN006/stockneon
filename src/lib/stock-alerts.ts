import { prisma } from './prisma'
import { sendLowStockAlert } from './email'
import { toast } from 'sonner'

export async function checkLowStockAlerts() {
  try {
    // Récupérer toutes les pièces et filtrer côté application
    const allPieces = await prisma.piece.findMany()
    const lowStockPieces = allPieces.filter(piece => 
      piece.minStock > 0 && piece.stock <= piece.minStock
    )

    // Envoyer des alertes pour chaque pièce en stock bas
    for (const piece of lowStockPieces) {
      // Envoyer notification toast (côté client)
      if (typeof window !== 'undefined') {
        toast.warning(`Stock bas pour ${piece.name} : ${piece.stock}/${piece.minStock}`, {
          duration: 10000,
          action: {
            label: 'Voir détails',
            onClick: () => {
              // Rediriger vers la page inventaire avec focus sur cette pièce
              window.location.href = `/inventaire?highlight=${piece.id}`
            }
          }
        })
      }

      // Envoyer email d'alerte
      await sendLowStockAlert(piece.name, piece.stock, piece.minStock)
    }

    return lowStockPieces.length
  } catch (error) {
    console.error('Erreur lors de la vérification des stocks bas:', error)
    return 0
  }
}

export async function getLowStockPieces() {
  try {
    // Récupérer toutes les pièces et filtrer côté application
    const allPieces = await prisma.piece.findMany({
      orderBy: {
        stock: 'asc'
      }
    })

    // Filtrer les pièces avec stock <= stock minimum
    return allPieces.filter(piece => 
      piece.minStock > 0 && piece.stock <= piece.minStock
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des stocks bas:', error)
    return []
  }
}
