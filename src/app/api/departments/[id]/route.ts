import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    const department = await prisma.department.findUnique({
      where: { 
        id: id,
        deletedAt: null
      }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Département non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erreur lors de la récupération du département:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du département est requis' },
        { status: 400 }
      )
    }

    const department = await prisma.department.update({
      where: { 
        id: id,
        deletedAt: null
      },
      data: { name }
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du département:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Un département avec ce nom existe déjà' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    const department = await prisma.department.update({
      where: { 
        id: id,
        deletedAt: null
      },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erreur lors de la suppression du département:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}