import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } }
      ]
    } : {}

    const [piecesRaw, total] = await Promise.all([
      prisma.piece.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          entries: {
            select: {
              qty: true,
              priceUnit: true,
              date: true
            },
            orderBy: { date: 'asc' }
          },
          exits: {
            select: {
              qty: true,
              date: true
            },
            orderBy: { date: 'asc' }
          }
        }
      }),
      prisma.piece.count({ where })
    ])

    // Calcul de la valeur exacte du stock pour chaque pièce
    const pieces = piecesRaw.map(piece => {
      // On va suivre les entrées et sorties chronologiquement pour calculer la valeur exacte
      let remainingStock = piece.stock
      let stockValue = 0

      if (remainingStock > 0) {
        // On part des entrées les plus récentes et on remonte
        const entries = [...piece.entries].reverse()
        
        for (const entry of entries) {
          const qtyFromThisEntry = Math.min(remainingStock, entry.qty)
          if (qtyFromThisEntry > 0) {
            stockValue += qtyFromThisEntry * entry.priceUnit
            remainingStock -= qtyFromThisEntry
          }
          if (remainingStock <= 0) break
        }
      }

      return {
        ...piece,
        stockValue,
        entries: undefined, // On ne renvoie pas les entrées/sorties dans la liste
        exits: undefined
      }
    })

    return NextResponse.json({
      pieces,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, location, stock, minStock } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de la pièce est requis' },
        { status: 400 }
      )
    }

    const piece = await prisma.piece.create({
      data: {
        name,
        description,
        location,
        stock: stock || 0,
        minStock: minStock || 0
      }
    })

    return NextResponse.json(piece, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la pièce:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
