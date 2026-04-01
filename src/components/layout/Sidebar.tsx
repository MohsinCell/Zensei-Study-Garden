"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import Icon from "@/components/ui/Icon";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore", icon: "compass" },
  { href: "/achievements", label: "Achievements", icon: "trophy" },
  { href: "/history", label: "Journal", icon: "book-open" },
  { href: "/about", label: "About", icon: "sprout" },
] as const;

const COLLAPSED_W = 72;
const EXPANDED_W = 272;
const MOBILE_BP = 768;
const TRANSITION_MS = 280;
const TRANSITION_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

interface Progression {
  xp: number;
  level: number;
  xpProgress: number;
  rank: { name: string; icon: string };
  currentStreak: number;
  streakMultiplier: number;
  achievementCount: number;
  totalAchievements: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [prog, setProg] = useState<Progression | null>(() => {
    try {
      const cached = sessionStorage.getItem("zensei-sidebar-prog");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [userName, setUserName] = useState<string>(() => {
    try { return sessionStorage.getItem("zensei-sidebar-name") || ""; }
    catch { return ""; }
  });
  const [avatar, setAvatar] = useState<string>(() => {
    try { return sessionStorage.getItem("zensei-sidebar-avatar") || ""; }
    catch { return ""; }
  });
  const [isDevUser, setIsDevUser] = useState(() => {
    try { return sessionStorage.getItem("zensei-sidebar-dev") === "1"; }
    catch { return false; }
  });
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("zensei-sidebar-collapsed");
    if (saved === "1") setCollapsed(true);

    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    setIsMobile(mq.matches);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);

    setMounted(true);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/progression")
      .then((r) => r.json())
      .then((d) => {
        if (d.xp !== undefined) {
          setProg(d);
          try { sessionStorage.setItem("zensei-sidebar-prog", JSON.stringify(d)); } catch {}
        }
      })
      .catch(() => {});
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const av = d.profile?.avatar || "";
        setAvatar(av);
        try { if (av) sessionStorage.setItem("zensei-sidebar-avatar", av); else sessionStorage.removeItem("zensei-sidebar-avatar"); } catch {}
        const nm = d.profile?.name || "";
        if (nm) {
          setUserName(nm);
          try { sessionStorage.setItem("zensei-sidebar-name", nm); } catch {}
        } else {
          setUserName("");
          try { sessionStorage.removeItem("zensei-sidebar-name"); } catch {}
        }
      })
      .catch(() => {});
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        const dev = !!d.isDev;
        setIsDevUser(dev);
        try { if (dev) sessionStorage.setItem("zensei-sidebar-dev", "1"); else sessionStorage.removeItem("zensei-sidebar-dev"); } catch {}
      })
      .catch(() => {
        setIsDevUser(false);
        try { sessionStorage.removeItem("zensei-sidebar-dev"); } catch {}
      });
  }, [session?.user?.email]);

  useEffect(() => {
    const refreshProg = () => {
      fetch("/api/progression")
        .then((r) => r.json())
        .then((d) => {
          if (d.xp !== undefined) {
            setProg(d);
            try { sessionStorage.setItem("zensei-sidebar-prog", JSON.stringify(d)); } catch {}
          }
        })
        .catch(() => {});
    };
    window.addEventListener("zensei-progression-update", refreshProg);
    return () => window.removeEventListener("zensei-progression-update", refreshProg);
  }, []);

  const initialMount = useRef(true);
  useEffect(() => {
    if (initialMount.current) { initialMount.current = false; return; }
    localStorage.setItem("zensei-sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    if (!mounted) return;
    const w = isMobile ? "0px" : collapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`;
    document.documentElement.style.setProperty("--sidebar-width", w);
    if (isMobile) setMobileOpen(false);
  }, [mounted, collapsed, isMobile]);

  useEffect(() => {
    const onAvatarChange = (e: Event) => {
      const url = (e as CustomEvent<string>).detail;
      setAvatar(url);
      try { sessionStorage.setItem("zensei-sidebar-avatar", url); } catch {}
    };
    window.addEventListener("zensei:avatar-changed", onAvatarChange);
    return () => window.removeEventListener("zensei:avatar-changed", onAvatarChange);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    if (!isMobile) return;
    if (mobileOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (top) window.scrollTo(0, -parseInt(top, 10));
    }
    return () => {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (top) window.scrollTo(0, -parseInt(top, 10));
    };
  }, [isMobile, mobileOpen]);

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);

  const expanded = isMobile ? true : !collapsed;
  const sidebarW = isMobile ? EXPANDED_W : collapsed ? COLLAPSED_W : EXPANDED_W;
  const translateX = isMobile && !mobileOpen ? "-100%" : "0%";

  return (
    <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.2s ease" }}>
      {isMobile && (
        <button
          onClick={toggleMobile}
          className="fixed top-4 left-4 z-[60] h-11 w-11 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 hover:shadow-[0_0_20px_rgba(139,171,122,0.15)] active:scale-95 transition-all duration-200 focus-ring"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <div className="relative w-5 h-5">
            <span
              className="absolute left-0 block w-5 h-[2px] rounded-full bg-current transition-all duration-200"
              style={{
                top: mobileOpen ? "9px" : "4px",
                transform: mobileOpen ? "rotate(45deg)" : "none",
              }}
            />
            <span
              className="absolute left-0 top-[9px] block w-5 h-[2px] rounded-full bg-current transition-all duration-200"
              style={{
                opacity: mobileOpen ? 0 : 1,
                transform: mobileOpen ? "translateX(-8px)" : "none",
              }}
            />
            <span
              className="absolute left-0 block w-5 h-[2px] rounded-full bg-current transition-all duration-200"
              style={{
                top: mobileOpen ? "9px" : "14px",
                transform: mobileOpen ? "rotate(-45deg)" : "none",
              }}
            />
          </div>
        </button>
      )}
      {isMobile && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          style={{
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? "auto" : "none",
            transition: `opacity ${TRANSITION_MS}ms ease`,
          }}
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        role="navigation"
        aria-label="Main navigation"
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col select-none"
        style={{
          width: sidebarW,
          transform: `translateX(${translateX})`,
          transition: `width ${TRANSITION_MS}ms ${TRANSITION_EASE}, transform ${TRANSITION_MS}ms ${TRANSITION_EASE}`,
        }}
      >
        <div className="absolute inset-0 bg-bg-card" />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-gold/[0.02] pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-px bg-border" />

        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] blur-sm bg-accent/20 pointer-events-none" />

        <div
          className="relative shrink-0"
          style={{
            padding: expanded
              ? (isMobile ? "68px 16px 12px" : "20px 16px 12px")
              : "16px 0 12px",
          }}
        >
          {expanded ? (
            <div className="flex items-center gap-3">
              <Link href="/explore" className="shrink-0" aria-label="Zensei home">
                <img src="/zensei-logo.png" alt="Zensei" className="w-8 h-8" />
              </Link>

              <div className="flex-1 min-w-0">
                <span
                  className="block text-[16px] uppercase tracking-[0.15em] text-accent leading-tight whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    textShadow: "0 0 10px rgba(139,171,122,0.4), 0 0 20px rgba(139,171,122,0.15)",
                  }}
                >
                  zensei
                </span>
                <span className="block font-pixel text-[9px] text-text-dim tracking-[0.25em] uppercase whitespace-nowrap mt-0.5">
                  study garden
                </span>
              </div>

              {!isMobile && (
                <button
                  onClick={toggleCollapse}
                  className="shrink-0 h-8 w-8 rounded-lg border border-border bg-bg-elevated/50 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 active:scale-90 transition-all duration-200 focus-ring"
                  aria-label="Collapse sidebar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={toggleCollapse}
                className="h-10 w-10 rounded-xl border border-border bg-bg-elevated/50 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 active:scale-90 transition-all duration-200 focus-ring"
                aria-label="Expand sidebar"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div
          className="relative shrink-0"
          style={{ margin: expanded ? "0 16px" : "0 12px" }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <nav className={`relative flex-1 min-h-0 overflow-x-hidden px-2.5 sm:px-3 pt-2 sm:pt-4 pb-1 sm:pb-2 ${isMobile ? "overflow-y-auto sidebar-nav-mobile" : "overflow-y-auto scrollbar-thin"}`}>
          {expanded && (
            <div className="px-3 pb-1.5 sm:pb-2">
              <span className="font-pixel text-[9px] uppercase tracking-[0.25em] text-text-dim">
                Menu
              </span>
            </div>
          )}

          <div className="space-y-0.5 sm:space-y-1">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              const isHovered = hoveredItem === href;

              return (
                <div key={href} className="relative">
                  <Link
                    href={href}
                    onClick={() => isMobile && closeMobile()}
                    onMouseEnter={() => setHoveredItem(href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      group relative flex items-center gap-3 rounded-xl transition-[background-color,color] duration-200 ease-out focus-ring
                      ${expanded ? "px-3 py-2 sm:py-2.5" : "px-0 py-2 sm:py-2.5 justify-center"}
                      ${isActive
                        ? "bg-accent/10 text-accent"
                        : "text-text-muted hover:text-text hover:bg-bg-hover/80"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-accent transition-[opacity,box-shadow] duration-200 ease-out"
                      style={{
                        opacity: isActive ? 1 : 0,
                        boxShadow: isActive ? "0 0 12px rgba(139,171,122,0.4)" : "0 0 0px transparent",
                      }}
                    />
                    <div
                      className={`
                        relative p-1.5 sm:p-2 rounded-lg shrink-0 transition-[background-color,box-shadow] duration-200 ease-out
                        ${isActive
                          ? "bg-accent/15 shadow-[0_0_12px_rgba(139,171,122,0.1)]"
                          : "bg-bg-elevated/60 group-hover:bg-bg-hover"
                        }
                      `}
                    >
                      <NavIcon name={icon} className="w-[18px] h-[18px]" />
                      <div
                        className="absolute inset-0 rounded-lg border border-accent/20 pointer-events-none transition-opacity duration-200 ease-out"
                        style={{ opacity: isActive ? 1 : 0 }}
                      />
                    </div>

                    {expanded && (
                      <span className="text-[13px] font-semibold tracking-tight whitespace-nowrap overflow-hidden">
                        {label}
                      </span>
                    )}

                    {expanded && (
                      <div className="ml-auto flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-accent transition-[opacity,box-shadow] duration-200 ease-out"
                          style={{
                            opacity: isActive ? 1 : 0,
                            boxShadow: isActive ? "0 0 6px rgba(139,171,122,0.5)" : "0 0 0px transparent",
                          }}
                        />
                      </div>
                    )}
                  </Link>

                  {!isMobile && collapsed && isHovered && (
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] pointer-events-none"
                      style={{ animation: "fade-in-scale 120ms ease forwards" }}
                    >
                      <div className="relative px-3 py-1.5 rounded-lg bg-bg-elevated border border-border shadow-elevated whitespace-nowrap">
                        <span className="text-xs font-semibold text-text">{label}</span>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-bg-elevated border-l border-b border-border" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {session?.user && (
          <div className="relative shrink-0 px-2.5 sm:px-3 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2">
            <div className="mx-1">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {expanded ? (
              <div className="relative rounded-xl border border-border-subtle bg-bg-surface/80 overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-gold/60 via-accent/40 to-transparent rounded-l-xl" />
                <div
                  className="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
                  }}
                />

                <div className="relative px-3 py-2.5 sm:px-3.5 sm:py-3">
                  <div className="flex items-center gap-2.5">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-9 h-9 rounded-lg object-cover border border-gold/25 shrink-0 shadow-[0_0_12px_rgba(212,181,125,0.08)]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(212,181,125,0.08)]">
                        <Icon
                          name={prog?.rank.icon || "sprout"}
                          className="w-4 h-4 text-gold"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {userName && (
                        <div className="text-[12px] font-semibold text-text truncate leading-tight">
                          {userName}
                        </div>
                      )}
                      <div className="font-pixel text-[10px] text-gold uppercase tracking-wider leading-tight mt-0.5">
                        {prog?.rank.name || "Seed"}{prog ? ` · Lv ${prog.level}` : ""}
                      </div>
                    </div>
                  </div>

                  {prog && (
                    <div className="mt-3 space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-[9px] text-text-dim uppercase tracking-wider">XP</span>
                          <span className="font-pixel text-[10px] text-accent tabular-nums">{prog.xp}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-bg-inset overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.max(3, prog.xpProgress * 100)}%`,
                              background: "linear-gradient(90deg, var(--color-accent), var(--color-gold))",
                              boxShadow: "0 0 8px rgba(139,171,122,0.3)",
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {prog.currentStreak > 0 && (
                          <span className="font-pixel text-[10px] text-orange-400 flex items-center gap-1">
                            <Icon name="flame" className="w-3.5 h-3.5" />
                            {prog.currentStreak}d
                            {prog.streakMultiplier > 1 && (
                              <span className="text-gold">({prog.streakMultiplier}x)</span>
                            )}
                          </span>
                        )}
                        <span className="font-pixel text-[10px] text-text-dim flex items-center gap-1 ml-auto">
                          <Icon name="medal" className="w-3.5 h-3.5" />
                          {prog.achievementCount}/{prog.totalAchievements}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              !isMobile && (
                <div className="flex justify-center py-1">
                  <div
                    className="relative w-10 h-10 cursor-default"
                    title={prog ? `${prog.rank.name} - Level ${prog.level}` : "Seed"}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden border border-gold/25 flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                          <Icon
                            name={prog?.rank.icon || "sprout"}
                            className="w-4.5 h-4.5 text-gold"
                          />
                        </div>
                      )}
                    </div>
                    {prog && prog.currentStreak > 0 && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-bg-card border border-orange-500/30">
                        <Icon name="flame" className="w-2.5 h-2.5 text-orange-400" />
                        <span className="font-pixel text-[7px] text-orange-400 leading-none">{prog.currentStreak}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            <Link
              href="/profile"
              onClick={() => isMobile && closeMobile()}
              className={`
                group w-full flex items-center gap-3 rounded-xl text-[13px] font-medium
                transition-all duration-150 focus-ring
                ${pathname === "/profile"
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:text-text hover:bg-bg-hover/80"
                }
                ${expanded ? "px-3 py-1.5 sm:py-2.5" : "px-0 py-1.5 sm:py-2.5 justify-center"}
              `}
            >
              <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 transition-colors duration-150 ${
                pathname === "/profile"
                  ? "bg-accent/15"
                  : "bg-bg-elevated/60 group-hover:bg-bg-hover"
              }`}>
                <NavIcon name="user" className="w-[18px] h-[18px]" />
              </div>
              {expanded && (
                <span className="whitespace-nowrap">Profile</span>
              )}
            </Link>

            {isDevUser && (
              <Link
                href="/developer"
                onClick={() => isMobile && closeMobile()}
                className={`
                  group w-full flex items-center gap-3 rounded-xl text-[13px] font-medium
                  transition-all duration-150 focus-ring
                  ${pathname === "/developer"
                    ? "bg-gold/10 text-gold"
                    : "text-text-muted hover:text-gold hover:bg-gold/5"
                  }
                  ${expanded ? "px-3 py-1.5 sm:py-2.5" : "px-0 py-1.5 sm:py-2.5 justify-center"}
                `}
              >
                <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 transition-colors duration-150 ${
                  pathname === "/developer"
                    ? "bg-gold/15"
                    : "bg-bg-elevated/60 group-hover:bg-gold/10"
                }`}>
                  <NavIcon name="cog" className="w-[18px] h-[18px]" />
                </div>
                {expanded && (
                  <span className="whitespace-nowrap">Dashboard</span>
                )}
              </Link>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className={`
                group w-full flex items-center gap-3 rounded-xl text-[13px] font-medium
                text-text-muted hover:text-error hover:bg-error/5
                active:scale-[0.98] transition-all duration-150 focus-ring
                ${expanded ? "px-3 py-1.5 sm:py-2.5" : "px-0 py-1.5 sm:py-2.5 justify-center"}
              `}
              aria-label="Sign out"
            >
              <div className="p-1.5 sm:p-2 rounded-lg bg-bg-elevated/60 group-hover:bg-error/10 transition-colors duration-150 shrink-0">
                <LogoutIcon className="w-[18px] h-[18px]" />
              </div>
              {expanded && (
                <span className="whitespace-nowrap">Sign Out</span>
              )}
            </button>
          </div>
        )}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent pointer-events-none" />
      </aside>
    </div>
  );
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    compass: (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z" />
      </svg>
    ),
    trophy: (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.02 6.02 0 0 1-3.767 1.922m0 0a6.02 6.02 0 0 1-3.767-1.922" />
      </svg>
    ),
    "book-open": (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    user: (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  };
  return <>{icons[name] || <Icon name={name} className={className} />}</>;
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}
