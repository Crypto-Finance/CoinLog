'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/utils';
import { buttonVariants } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, BarChart3, Upload } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trades', label: 'Trades', icon: BookOpen },
  { href: '/stats', label: 'Statistics', icon: BarChart3 },
  { href: '/import', label: 'Import', icon: Upload },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#152031]/95 backdrop-blur border border-white/10 sticky top-4 z-50 mx-4 rounded-[24px]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold text-lg text-[#BFFF00]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <BarChart3 className="h-5 w-5" />
            CoinLog
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full',
                    'hover:bg-white/10 hover:text-foreground',
                    isActive
                      ? buttonVariants({ variant: 'neon' })
                      : 'text-muted-foreground'
                  )}
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
