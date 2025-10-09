import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(departments)
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du département est requis' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: { name }
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du département:', error)
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