import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Actors', href: '/actors' },
    { name: 'Contexts', href: '/contexts' },
    { name: 'Tools', href: '/tools' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pantheon</h1>
            <nav className="flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default Layout;
