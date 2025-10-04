import { NextResponse } from 'next/server'
import { checkLowStockAlerts, getLowStockPieces } from '@/lib/stock-alerts'

export async function GET() {
  try {
    const lowStockPieces = await getLowStockPieces()
    return NextResponse.json({ lowStockPieces })
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const alertCount = await checkLowStockAlerts()
    return NextResponse.json({ 
      message: `${alertCount} alerte(s) de stock bas envoyée(s)`,
      alertCount 
    })
  } catch (error) {
    console.error('Erreur lors de la vérification des alertes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des alertes' },
      { status: 500 }
    )
  }
}
