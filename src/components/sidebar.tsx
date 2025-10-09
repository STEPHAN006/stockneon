'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Truck, 
  Users, 
  History,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventaire', href: '/inventaire', icon: Package },
  { name: 'Entrée', href: '/entree', icon: ArrowDownToLine },
  { name: 'Sortie', href: '/sortie', icon: ArrowUpFromLine },
  { name: 'Fournisseurs', href: '/fournisseurs', icon: Truck },
  { name: 'Techniciens', href: '/techniciens', icon: Users },
  { name: 'Départements', href: '/departements', icon: Users },
  { name: 'Historique', href: '/historique', icon: History },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{role?: string}>({})

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Gestion Stock</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {item.name}
            </Link>
          )
        })}

        {/* Gestion utilisateurs seulement pour ADMIN */}
        {user.role === 'ADMIN' && (() => {
          const isActive = pathname === '/admin/users'
          return (
            <Link
              href="/admin/users"
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <Users
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              Gestion Utilisateurs
            </Link>
          )
        })()}
      </nav>
      
      <div className="p-3">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
