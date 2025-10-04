import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const type = searchParams.get('type') // 'entry' | 'exit' | 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const dateFilter = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) })
    }

    let entries = []
    let exits = []
    let totalEntries = 0
    let totalExits = 0

    if (!type || type === 'all' || type === 'entry') {
      const [entryData, entryCount] = await Promise.all([
        prisma.entry.findMany({
          where: {
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
          },
          include: {
            piece: true,
            supplier: true
          },
          orderBy: { date: 'desc' },
          skip: type === 'entry' ? skip : 0,
          take: type === 'entry' ? limit : undefined
        }),
        prisma.entry.count({
          where: {
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
          }
        })
      ])
      entries = entryData
      totalEntries = entryCount
    }

    if (!type || type === 'all' || type === 'exit') {
      const [exitData, exitCount] = await Promise.all([
        prisma.exit.findMany({
          where: {
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
          },
          include: {
            piece: true,
            technician: true
          },
          orderBy: { date: 'desc' },
          skip: type === 'exit' ? skip : 0,
          take: type === 'exit' ? limit : undefined
        }),
        prisma.exit.count({
          where: {
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
          }
        })
      ])
      exits = exitData
      totalExits = exitCount
    }

    // Combiner et trier par date
    const allHistory = [
      ...entries.map(entry => ({ ...entry, type: 'entry' })),
      ...exits.map(exit => ({ ...exit, type: 'exit' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination pour 'all'
    const paginatedHistory = type === 'all' 
      ? allHistory.slice(skip, skip + limit)
      : allHistory

    const total = totalEntries + totalExits

    return NextResponse.json({
      history: paginatedHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
