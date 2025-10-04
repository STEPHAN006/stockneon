import { Resend } from 'resend'

const resend = new Resend('re_DEJhMSMh_FfovscBRuyWV8hSESsGxnR1v')

export async function sendLowStockAlert(pieceName: string, currentStock: number, minStock: number) {
  try {
    console.log(`📧 Tentative d'envoi d'email pour: ${pieceName} - Stock: ${currentStock}/${minStock}`)

    const { data, error } = await resend.emails.send({
      from: 'GESTION DE STOCK <onboarding@resend.dev>',
      to: ['stephystephan13@gmail.com'], // Email de l'administrateur (doit correspondre au compte Resend)
      subject: `🚨 Alerte Stock Bas - ${pieceName}`,
      html: `
        <h2>🚨 Alerte Stock Bas</h2>
        <p>Le stock de la pièce <strong>${pieceName}</strong> est en dessous du seuil minimum.</p>
        <p><strong>Stock actuel :</strong> ${currentStock} unités</p>
        <p><strong>Stock minimum :</strong> ${minStock} unités</p>
        <p><strong>Déficit :</strong> ${minStock - currentStock} unités</p>
        <p>Veuillez réapprovisionner cette pièce dès que possible.</p>
      `,
    })

    if (error) {
      console.error('❌ Erreur Resend:', error)
      console.error('Détails de l\'erreur:', JSON.stringify(error, null, 2))
      return false
    }

    console.log('✅ Email d\'alerte envoyé avec succès!')
    console.log('📧 Données de réponse:', JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return false
  }
}
