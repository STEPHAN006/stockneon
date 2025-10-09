import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalPieces,
      totalStock,
      totalValue,
      recentEntries,
      recentExits,
      lowStockPieces
    ] = await Promise.all([
      prisma.piece.count({
        where: {
          deletedAt: null
        }
      }),
      prisma.piece.aggregate({
        where: {
          deletedAt: null
        },
        _sum: { stock: true }
      }),
      prisma.entry.aggregate({
        where: {
          piece: {
            deletedAt: null
          }
        },
        _sum: { total: true }
      }),
      prisma.entry.findMany({
        take: 5,
        include: {
          piece: true,
          supplier: true
        },
        where: {
          piece: {
            deletedAt: null
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.exit.findMany({
        take: 5,
        include: {
          piece: true,
          technician: true
        },
        where: {
          piece: {
            deletedAt: null
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.piece.findMany({
        where: {
          AND: [
            { deletedAt: null },
            {
              stock: {
                lte: 5 // Stock faible si <= 5
              }
            }
          ]
        },
        orderBy: { stock: 'asc' }
      })
    ])

    return NextResponse.json({
      stats: {
        totalPieces,
        totalStock: totalStock._sum.stock || 0,
        totalValue: totalValue._sum.total || 0
      },
      recentEntries,
      recentExits,
      lowStockPieces
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
