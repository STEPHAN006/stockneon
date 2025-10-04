import { NextResponse } from 'next/server'
import { sendLowStockAlert } from '@/lib/email'

export async function POST() {
  try {
    console.log('🧪 Test d\'envoi d\'email...')
    
    const result = await sendLowStockAlert(
      'Test Pièce',
      2,
      5
    )
    
    if (result) {
      return NextResponse.json({ 
        message: 'Email de test envoyé avec succès !',
        success: true 
      })
    } else {
      return NextResponse.json({ 
        message: 'Erreur lors de l\'envoi de l\'email',
        success: false 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erreur lors du test d\'email:', error)
    return NextResponse.json(
      { error: 'Erreur lors du test d\'email', details: error },
      { status: 500 }
    )
  }
}
