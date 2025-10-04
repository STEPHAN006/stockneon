import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        skip,
        take: limit,
        include: {
          piece: true,
          supplier: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.entry.count()
    ])

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des entrées:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, reference, pieceId, supplierId, qty, priceUnit } = await request.json()

    if (!pieceId || !supplierId || !qty || !priceUnit) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (qty <= 0 || priceUnit < 0) {
      return NextResponse.json(
        { error: 'La quantité doit être positive et le prix unitaire positif ou nul' },
        { status: 400 }
      )
    }

    const total = qty * priceUnit

    // Créer l'entrée et mettre à jour le stock en une transaction
    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.entry.create({
        data: {
          date: new Date(date),
          reference,
          pieceId: parseInt(pieceId),
          supplierId: parseInt(supplierId),
          qty: parseInt(qty),
          priceUnit: parseFloat(priceUnit),
          total
        }
      })

      await tx.piece.update({
        where: { id: parseInt(pieceId) },
        data: {
          stock: {
            increment: parseInt(qty)
          }
        }
      })

      return entry
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'entrée:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
