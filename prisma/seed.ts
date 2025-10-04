import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer un utilisateur de test
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Administrateur'
    }
  })

  console.log('✅ Utilisateur créé:', user.email)

  // Créer des fournisseurs
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { name: 'Fournisseur A' },
      update: {},
      create: { name: 'Fournisseur A' }
    }),
    prisma.supplier.upsert({
      where: { name: 'Fournisseur B' },
      update: {},
      create: { name: 'Fournisseur B' }
    }),
    prisma.supplier.upsert({
      where: { name: 'Fournisseur C' },
      update: {},
      create: { name: 'Fournisseur C' }
    })
  ])

  console.log('✅ Fournisseurs créés:', suppliers.length)

  // Créer des techniciens
  const technicians = await Promise.all([
    prisma.technician.create({
      data: { 
        name: 'Jean Dupont',
        role: 'Électricien'
      }
    }),
    prisma.technician.create({
      data: { 
        name: 'Marie Martin',
        role: 'Plombier'
      }
    }),
    prisma.technician.create({
      data: { 
        name: 'Pierre Durand',
        role: 'Technicien général'
      }
    })
  ])

  console.log('✅ Techniciens créés:', technicians.length)

  // Créer des pièces avec stocks minimum pour tester les alertes
  const pieces = await Promise.all([
    prisma.piece.create({
      data: {
        name: 'Interrupteur 2 voies',
        description: 'Interrupteur électrique 2 voies blanc',
        location: 'Rangement A1',
        stock: 15,
        minStock: 10
      }
    }),
    prisma.piece.create({
      data: {
        name: 'Prise de courant 16A',
        description: 'Prise de courant 16A avec terre',
        location: 'Rangement A2',
        stock: 8,
        minStock: 5
      }
    }),
    prisma.piece.create({
      data: {
        name: 'Câble électrique 2.5mm²',
        description: 'Câble électrique rigide 2.5mm² rouge',
        location: 'Rangement B1',
        stock: 3,
        minStock: 5  // Stock bas pour déclencher une alerte
      }
    }),
    prisma.piece.create({
      data: {
        name: 'Robinet thermostatique',
        description: 'Robinet thermostatique chromé',
        location: 'Rangement C1',
        stock: 2,
        minStock: 3  // Stock bas pour déclencher une alerte
      }
    }),
    prisma.piece.create({
      data: {
        name: 'Tuyau PVC 32mm',
        description: 'Tuyau PVC 32mm par 3m',
        location: 'Rangement C2',
        stock: 12,
        minStock: 8
      }
    })
  ])

  console.log('✅ Pièces créées:', pieces.length)

  // Créer des entrées
  const entries = await Promise.all([
    prisma.entry.create({
      data: {
        date: new Date('2024-01-15'),
        reference: 'CMD-2024-001',
        pieceId: pieces[0].id,
        supplierId: suppliers[0].id,
        qty: 20,
        priceUnit: 12.50,
        total: 250
      }
    }),
    prisma.entry.create({
      data: {
        date: new Date('2024-01-20'),
        reference: 'CMD-2024-002',
        pieceId: pieces[1].id,
        supplierId: suppliers[1].id,
        qty: 15,
        priceUnit: 8.75,
        total: 131.25
      }
    }),
    prisma.entry.create({
      data: {
        date: new Date('2024-02-01'),
        reference: 'CMD-2024-003',
        pieceId: pieces[2].id,
        supplierId: suppliers[0].id,
        qty: 50,
        priceUnit: 2.30,
        total: 115
      }
    }),
    prisma.entry.create({
      data: {
        date: new Date('2024-02-10'),
        reference: 'CMD-2024-004',
        pieceId: pieces[3].id,
        supplierId: suppliers[2].id,
        qty: 5,
        priceUnit: 45,
        total: 225
      }
    }),
    prisma.entry.create({
      data: {
        date: new Date('2024-02-15'),
        reference: 'CMD-2024-005',
        pieceId: pieces[4].id,
        supplierId: suppliers[1].id,
        qty: 20,
        priceUnit: 15.80,
        total: 316
      }
    })
  ])

  console.log('✅ Entrées créées:', entries.length)

  // Mettre à jour les stocks des pièces
  await Promise.all([
    prisma.piece.update({
      where: { id: pieces[0].id },
      data: { stock: pieces[0].stock + 20 }
    }),
    prisma.piece.update({
      where: { id: pieces[1].id },
      data: { stock: pieces[1].stock + 15 }
    }),
    prisma.piece.update({
      where: { id: pieces[2].id },
      data: { stock: pieces[2].stock + 50 }
    }),
    prisma.piece.update({
      where: { id: pieces[3].id },
      data: { stock: pieces[3].stock + 5 }
    }),
    prisma.piece.update({
      where: { id: pieces[4].id },
      data: { stock: pieces[4].stock + 20 }
    })
  ])

  // Créer des sorties
  const exits = await Promise.all([
    prisma.exit.create({
      data: {
        date: new Date('2024-01-25'),
        pieceId: pieces[0].id,
        technicianId: technicians[0].id,
        qty: 3,
        observation: 'Installation salle de bain'
      }
    }),
    prisma.exit.create({
      data: {
        date: new Date('2024-01-28'),
        pieceId: pieces[1].id,
        technicianId: technicians[0].id,
        qty: 2,
        observation: 'Rénovation cuisine'
      }
    }),
    prisma.exit.create({
      data: {
        date: new Date('2024-02-05'),
        pieceId: pieces[2].id,
        technicianId: technicians[1].id,
        qty: 10,
        observation: 'Raccordement électrique garage'
      }
    }),
    prisma.exit.create({
      data: {
        date: new Date('2024-02-12'),
        pieceId: pieces[3].id,
        technicianId: technicians[1].id,
        qty: 1,
        observation: 'Remplacement robinet cuisine'
      }
    }),
    prisma.exit.create({
      data: {
        date: new Date('2024-02-18'),
        pieceId: pieces[4].id,
        technicianId: technicians[2].id,
        qty: 5,
        observation: 'Installation évacuation eaux usées'
      }
    })
  ])

  console.log('✅ Sorties créées:', exits.length)

  // Mettre à jour les stocks des pièces après les sorties
  await Promise.all([
    prisma.piece.update({
      where: { id: pieces[0].id },
      data: { stock: { decrement: 3 } }
    }),
    prisma.piece.update({
      where: { id: pieces[1].id },
      data: { stock: { decrement: 2 } }
    }),
    prisma.piece.update({
      where: { id: pieces[2].id },
      data: { stock: { decrement: 10 } }
    }),
    prisma.piece.update({
      where: { id: pieces[3].id },
      data: { stock: { decrement: 1 } }
    }),
    prisma.piece.update({
      where: { id: pieces[4].id },
      data: { stock: { decrement: 5 } }
    })
  ])

  console.log('🎉 Seeding terminé avec succès!')
  console.log(`📊 Résumé:`)
  console.log(`   - ${suppliers.length} fournisseurs`)
  console.log(`   - ${technicians.length} techniciens`)
  console.log(`   - ${pieces.length} pièces`)
  console.log(`   - ${entries.length} entrées`)
  console.log(`   - ${exits.length} sorties`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
