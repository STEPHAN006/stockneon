import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const type = searchParams.get('type') // 'entry' | 'exit' | 'all'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const dateFilter = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) })
    }

    const searchTerm = search?.trim()
    const isNumeric = !isNaN(Number(searchTerm))
    const numberValue = isNumeric ? Number(searchTerm) : null

    let entries : any[] = []
    let exits : any []= []
    let totalEntries = 0
    let totalExits = 0

    if (!type || type === 'all' || type === 'entry') {
      const [entryData, entryCount] = await Promise.all([
        prisma.entry.findMany({
          where: {
            piece: {
              deletedAt: null
            },
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
            ...(searchTerm && {
              OR: [
                { piece: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { supplier: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { reference: { contains: searchTerm, mode: 'insensitive' as const } },
                ...(numberValue ? [
                  { qty: numberValue },
                  { total: numberValue }
                ] : [])
              ]
            })
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
            piece: {
              deletedAt: null
            },
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
            ...(searchTerm && {
              OR: [
                { piece: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { supplier: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { reference: { contains: searchTerm, mode: 'insensitive' as const } },
                ...(numberValue ? [
                  { qty: numberValue },
                  { total: numberValue }
                ] : [])
              ]
            })
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
            piece: {
              deletedAt: null
            },
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
            ...(searchTerm && {
              OR: [
                { piece: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { technician: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { department: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { forUser: { contains: searchTerm, mode: 'insensitive' as const } },
                { observation: { contains: searchTerm, mode: 'insensitive' as const } },
                ...(numberValue ? [
                  { qty: numberValue }
                ] : [])
              ]
            })
          },
          include: {
            piece: true,
            technician: true,
            department: true
          },
          orderBy: { date: 'desc' },
          skip: type === 'exit' ? skip : 0,
          take: type === 'exit' ? limit : undefined
        }),
        prisma.exit.count({
          where: {
            piece: {
              deletedAt: null
            },
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
            ...(searchTerm && {
              OR: [
                { piece: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { technician: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { department: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { forUser: { contains: searchTerm, mode: 'insensitive' as const } },
                { observation: { contains: searchTerm, mode: 'insensitive' as const } },
                ...(numberValue ? [
                  { qty: numberValue }
                ] : [])
              ]
            }),
            ...(searchTerm && {
              OR: [
                { piece: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { technician: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { department: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
                { forUser: { contains: searchTerm, mode: 'insensitive' as const } }
              ]
            })
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
