import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [exits, total] = await Promise.all([
      prisma.exit.findMany({
        skip,
        take: limit,
        include: {
          piece: true,
          technician: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.exit.count()
    ])

    return NextResponse.json({
      exits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des sorties:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, pieceId, technicianId, departmentId, forUser, qty, observation } = await request.json()

    if (!pieceId || !technicianId || !departmentId || !forUser || !qty) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (qty <= 0) {
      return NextResponse.json(
        { error: 'La quantité doit être positive' },
        { status: 400 }
      )
    }

    // Vérifier le stock disponible
    const piece = await prisma.piece.findUnique({
      where: { id: parseInt(pieceId) }
    })

    if (!piece) {
      return NextResponse.json(
        { error: 'Pièce non trouvée' },
        { status: 404 }
      )
    }

    if (piece.stock < parseInt(qty)) {
      return NextResponse.json(
        { error: 'Stock insuffisant' },
        { status: 400 }
      )
    }

    // Créer la sortie et mettre à jour le stock en une transaction
    const result = await prisma.$transaction(async (tx : any) => {
      const exit = await tx.exit.create({
        data: {
          date: new Date(date),
          pieceId: parseInt(pieceId),
          technicianId: parseInt(technicianId),
          departmentId: parseInt(departmentId),
          forUser,
          qty: parseInt(qty),
          observation
        }
      })

      await tx.piece.update({
        where: { id: parseInt(pieceId) },
        data: {
          stock: {
            decrement: parseInt(qty)
          }
        }
      })

      return exit
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la sortie:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
