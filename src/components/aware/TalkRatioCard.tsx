import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Mic } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { AwareTalkRatio } from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'

export function TalkRatioCard({
  data,
  turns,
}: {
  data?: AwareTalkRatio
  turns?: { avg_turns: number; buckets: { bucket: string; calls: number }[] }
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="size-4" /> Quién habla y cuánto tarda en transferir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data ? (
          <EmptyState icon={Mic} title="Sin transcripciones" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-semibold tabular-nums">{data.ratio ?? '—'}×</p>
                <p className="text-xs text-muted-foreground">SOFIA habla más que el cliente</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-lg font-semibold tabular-nums">{data.avg_agent_words} / {data.avg_user_words}</p>
                <p className="text-xs text-muted-foreground">palabras bot / cliente por llamada</p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">{pct(data.ininteligible_rate)}</p>
                <p className="text-xs text-muted-foreground">llamadas con "audio ininteligible"</p>
              </div>
            </div>

            {turns && turns.buckets.some((b) => b.calls > 0) && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Turnos hasta la transferencia (media {turns.avg_turns})
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={turns.buckets} margin={{ left: 4, right: 8, top: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                    <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                    <Tooltip
                      cursor={{ fill: 'var(--color-muted)' }}
                      contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                      formatter={((v: number) => [`${num(v)} llamadas`, '']) as never}
                    />
                    <Bar dataKey="calls" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
