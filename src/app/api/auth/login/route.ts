import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Création d'un token simple (en production, utiliser JWT)
    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64')

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Erreur de connexion:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
