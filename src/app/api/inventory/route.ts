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

    const [pieces, total] = await Promise.all([
      prisma.piece.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.piece.count({ where })
    ])

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
