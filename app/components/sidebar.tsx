"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House, Shield,
} from "@gravity-ui/icons";

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <DesktopSidebar />
      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <MobileBottomNav />
    </>
  );
}

// Desktop Sidebar Component
function DesktopSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/assignments", icon: House, label: "Home" },
    { href: "/audit", icon: Shield, label: "Audit" },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-[100] h-screen w-20 flex-col items-center border-r border-border/40 bg-surface/50 backdrop-blur-xl py-6">
      {/* Brand Icon */}
      <Link href="/assignments">
        <div className="mb-8 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80 text-white shadow-md shadow-accent/20 cursor-pointer text-lg font-bold">
          E
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col items-center gap-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all w-full touch-target-min
                  ${isActive
                    ? "bg-accent/20 text-accent shadow-sm"
                    : "text-muted-foreground hover:bg-default/40 hover:text-foreground"
                  }`}
               >
                 <item.icon className="size-5" />
                 <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
               </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="mt-auto flex flex-col items-center gap-4">
          <AvatarPlaceholder />
      </div>
    </aside>
  );
}

// Mobile Bottom Navigation Component
function MobileBottomNav() {
  const pathname = usePathname();

  const iconNavItems = [
    { href: "/assignments", icon: House, label: "Home" },
    { href: "/audit", icon: Shield, label: "Audit" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] h-16 bg-surface/95 backdrop-blur-xl border-t border-border/40 safe-bottom">
      <div className="flex items-center justify-around h-full px-2">
        {iconNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all touch-target-min
                ${isActive
                  ? "text-accent"
                  : "text-muted-foreground"
                }`}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
              )}
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile Avatar */}
        <Link
          href="#profile"
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 touch-target-min"
        >
          <AvatarPlaceholder />
          <span className="text-[10px] font-medium text-muted-foreground">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

const AvatarPlaceholder = () => (
   <div className="size-8 rounded-full border border-border/60 bg-default/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground cursor-pointer hover:border-border transition-colors">
      SK
   </div>
)
