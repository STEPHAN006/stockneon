import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        entries: {
          select: {
            total: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const suppliersWithStats = suppliers.map(supplier => ({
      ...supplier,
      totalEntries: supplier.entries.length,
      totalRevenue: supplier.entries.reduce((sum, entry) => sum + entry.total, 0)
    }))

    return NextResponse.json(suppliersWithStats)
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error)
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
        { error: 'Le nom du fournisseur est requis' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: { name }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du fournisseur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
