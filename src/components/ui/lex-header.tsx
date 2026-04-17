'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon'
import { createPortal } from 'react-dom'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import type { LucideIcon } from 'lucide-react'
import {
  Flame,
  Users,
  Sparkles,
  TrendingUp,
  Megaphone,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  FileText,
  Phone,
} from 'lucide-react'

type LinkItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export function LexHeader() {
  const [open, setOpen] = React.useState(false)
  const scrolled = useScroll(10)

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border backdrop-blur-lg':
          scrolled,
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <a href="/" className="hover:bg-accent -ml-2 flex items-center gap-2 rounded-md px-2 py-1.5">
            <LexMark className="h-5 w-5 text-foreground" />
            <span className="font-semibold tracking-tight text-foreground">LexAI</span>
          </a>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  Plataforma
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background p-1 pr-1.5">
                  <ul className="bg-popover grid w-[32rem] grid-cols-2 gap-2 rounded-md border p-2 shadow">
                    {productLinks.map((item, i) => (
                      <li key={i}>
                        <ListItem {...item} />
                      </li>
                    ))}
                  </ul>
                  <div className="p-2">
                    <p className="text-muted-foreground text-sm">
                      Quer ver em ação?{' '}
                      <a
                        href="#demo"
                        className="text-foreground font-medium hover:underline"
                      >
                        Agendar demonstração
                      </a>
                    </p>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  Recursos
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background p-1 pr-1.5 pb-1.5">
                  <div className="grid w-[32rem] grid-cols-2 gap-2">
                    <ul className="bg-popover space-y-2 rounded-md border p-2 shadow">
                      {resourceLinks.map((item, i) => (
                        <li key={i}>
                          <ListItem {...item} />
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-2 p-3">
                      {resourceLinks2.map((item, i) => (
                        <li key={i}>
                          <NavigationMenuLink
                            href={item.href}
                            className="flex flex-row items-center gap-x-2 rounded-md p-2 hover:bg-accent"
                          >
                            <item.icon className="text-foreground size-4" />
                            <span className="font-medium">{item.title}</span>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuLink className="px-4" asChild>
                <a href="#precos" className="hover:bg-accent rounded-md p-2 text-sm font-medium">
                  Preços
                </a>
              </NavigationMenuLink>
              <NavigationMenuLink className="px-4" asChild>
                <a
                  href="#comparativo"
                  className="hover:bg-accent rounded-md p-2 text-sm font-medium"
                >
                  Comparativo
                </a>
              </NavigationMenuLink>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" asChild>
            <a href="/login">Entrar</a>
          </Button>
          <Button asChild>
            <a href="#demo">Agendar demo</a>
          </Button>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Abrir menu"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>
      <MobileMenu
        open={open}
        className="flex flex-col justify-between gap-2 overflow-y-auto"
      >
        <NavigationMenu className="max-w-full">
          <div className="flex w-full flex-col gap-y-2">
            <span className="text-sm text-muted-foreground">Plataforma</span>
            {productLinks.map((link) => (
              <ListItem key={link.title} {...link} />
            ))}
            <span className="mt-2 text-sm text-muted-foreground">Recursos</span>
            {resourceLinks.map((link) => (
              <ListItem key={link.title} {...link} />
            ))}
            {resourceLinks2.map((link) => (
              <ListItem key={link.title} {...link} />
            ))}
          </div>
        </NavigationMenu>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <a href="/login">Entrar</a>
          </Button>
          <Button className="w-full" asChild>
            <a href="#demo">Agendar demo</a>
          </Button>
        </div>
      </MobileMenu>
    </header>
  )
}

type MobileMenuProps = React.ComponentProps<'div'> & { open: boolean }

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') return null

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-lg',
        'fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden',
      )}
    >
      <div
        data-slot={open ? 'open' : 'closed'}
        className={cn(
          'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
          'size-full p-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

function ListItem({
  title,
  description,
  icon: Icon,
  className,
  href,
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
  return (
    <NavigationMenuLink
      className={cn(
        'w-full flex flex-row gap-x-2 rounded-sm p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...props}
      asChild
    >
      <a href={href}>
        <div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border shadow-sm">
          <Icon className="text-foreground size-5" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
      </a>
    </NavigationMenuLink>
  )
}

const productLinks: LinkItem[] = [
  {
    title: 'Leads & Qualificacao',
    href: '#leads',
    description: 'Captura multicanal com triagem automatica por prioridade',
    icon: Flame,
  },
  {
    title: 'CRM de Clientes',
    href: '#crm',
    description: 'Timeline completa + monitoramento processual integrado',
    icon: Users,
  },
  {
    title: '14 Agentes Especializados',
    href: '#agentes',
    description: 'Redator, Pesquisador, Estrategista, Compliance e mais',
    icon: Sparkles,
  },
  {
    title: 'Jurimetria',
    href: '#jurimetria',
    description: 'Probabilidade de êxito + tempo + valor esperado',
    icon: TrendingUp,
  },
  {
    title: 'Marketing Juridico',
    href: '#marketing',
    description: 'Conteudo para redes sociais validado contra Provimento 205',
    icon: Megaphone,
  },
  {
    title: 'Compliance OAB',
    href: '#compliance',
    description: 'Todas as saídas validadas contra Provimento 205',
    icon: ShieldCheck,
  },
]

const resourceLinks: LinkItem[] = [
  {
    title: 'Comparativo',
    href: '#comparativo',
    description: 'LexAI vs AdvHub, Lexter, ChatADV, Turivius',
    icon: BookOpen,
  },
  {
    title: 'Como funciona',
    href: '#como',
    description: 'Do primeiro lead à sentença, ponta a ponta',
    icon: HelpCircle,
  },
]

const resourceLinks2: LinkItem[] = [
  { title: 'Documentação', href: '#docs',    icon: FileText },
  { title: 'Falar com consultor', href: '#demo', icon: Phone },
]

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false)

  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold)
  }, [threshold])

  React.useEffect(() => {
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  React.useEffect(() => {
    onScroll()
  }, [onScroll])

  return scrolled
}

function LexMark(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 28 24" fill="none" {...props}>
      <path
        d="M3 3 L3 21 L11 21"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 3 L25 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M25 3 L13 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
