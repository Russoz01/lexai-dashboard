'use client'

import Link from 'next/link'
import { Scale } from 'lucide-react'

const cols = [
  {
    title: 'Produto',
    links: [
      { label: 'Agentes',           href: '#agentes' },
      { label: 'Planos',            href: '#precos' },
      { label: 'Comparativo',       href: '#comparativo' },
      { label: 'Para empresas',     href: '/empresas' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Entrar',            href: '/login' },
      { label: 'Agendar demo',      href: '/login' },
      { label: 'FAQ',               href: '#faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade LGPD',  href: '/privacidade' },
      { label: 'Termos de uso',     href: '/termos' },
    ],
  },
]

export function LexFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <Scale className="size-4 text-[#bfa68e]" strokeWidth={1.75} />
              <span className="text-sm font-medium tracking-tight text-white">LexAI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Inteligencia juridica brasileira. 22 agentes, CRM integrado,
              jurimetria e marketing compliant. Um unico contrato.
            </p>
            <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
              © MMXXVI LexAI · uma marca Vanix Corp
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                {c.title}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-[0.65rem] text-white/35 md:flex-row">
          <span>
            LexAI e ferramenta de apoio. Resultados devem ser revisados por
            profissional habilitado pela OAB.
          </span>
          <span className="font-mono uppercase tracking-[0.15em]">
            v2.0 · 2026
          </span>
        </div>
      </div>
    </footer>
  )
}
