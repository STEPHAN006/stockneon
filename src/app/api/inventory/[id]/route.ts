import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const piece = await prisma.piece.findUnique({
      where: { id: parseInt(id) },
      include: {
        entries: {
          include: { supplier: true },
          orderBy: { date: 'desc' }
        },
        exits: {
          include: { technician: true },
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!piece) {
      return NextResponse.json(
        { error: 'Pièce non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(piece)
  } catch (error) {
    console.error('Erreur lors de la récupération de la pièce:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, description, location, stock, minStock } = await request.json()

    const piece = await prisma.piece.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        location,
        stock,
        minStock
      }
    })

    return NextResponse.json(piece)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la pièce:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Au lieu de supprimer, on met à jour avec deletedAt
    await prisma.piece.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
        stock: 0 // On met le stock à 0 puisque la pièce est "supprimée"
      }
    })

    return NextResponse.json({ message: 'Pièce supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
