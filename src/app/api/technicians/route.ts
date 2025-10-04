import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const technicians = await prisma.technician.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(technicians)
  } catch (error) {
    console.error('Erreur lors de la récupération des techniciens:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, role } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du technicien est requis' },
        { status: 400 }
      )
    }

    const technician = await prisma.technician.create({
      data: { name, role }
    })

    return NextResponse.json(technician, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du technicien:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
