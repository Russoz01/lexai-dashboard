'use client'

// Last-resort error boundary for the root layout.
// Fires when even error.tsx failed (e.g. layout itself threw during render).
// Must render its own <html>/<body> because the root layout didn't run.

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import NextError from 'next/error'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { source: 'root-global-error' },
      extra: { digest: error.digest },
      level: 'fatal',
    })
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        {/* NextError renders a minimal 500 shell without depending on the app shell */}
        <NextError statusCode={500} />
      </body>
    </html>
  )
}
