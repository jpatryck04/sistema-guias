'use client';

import { useEffect, useState } from 'react';
import { Activity, BarChart3, Copy, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Metrics {
  activity: { date: string; label: string; value: number }[];
  topForms: { name: string; value: number }[];
  copies: number;
  users: number;
  prints: number;
  updatedAt: string;
}

export function AdminAnalytics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  async function loadMetrics() {
    const response = await fetch('/api/admin/metricas', { cache: 'no-store' });
    if (!response.ok) return;
    setMetrics((await response.json()) as Metrics);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadMetrics(), 0);
    const interval = window.setInterval(() => void loadMetrics(), 15000);
    const refreshListener = () => void loadMetrics();

    window.addEventListener('dashboard-metrics-refresh', refreshListener);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      window.removeEventListener('dashboard-metrics-refresh', refreshListener);
    };
  }, []);

  if (!metrics) {
    return <div className="h-64 animate-pulse rounded-xl border bg-card/60" />;
  }

  const maxActivity = Math.max(...metrics.activity.map((hour) => hour.value), 1);
  const maxForm = Math.max(...metrics.topForms.map((form) => form.value), 1);
  const candleData = metrics.activity.map((hour, index) => {
    const previous = index === 0 ? hour.value : metrics.activity[index - 1].value;
    const open = previous;
    const close = hour.value;
    const high = Math.max(open, close, hour.value);
    const low = Math.min(open, close, hour.value);
    const isUp = close >= open;
    const x = metrics.activity.length === 1 ? 50 : (index / (metrics.activity.length - 1)) * 100;
    const wickTop = 92 - (high / maxActivity) * 68;
    const wickBottom = 92 - (low / maxActivity) * 68;
    const bodyTop = 92 - (Math.max(open, close) / maxActivity) * 68;
    const bodyBottom = 92 - (Math.min(open, close) / maxActivity) * 68;

    return {
      ...hour,
      open,
      close,
      high,
      low,
      isUp,
      x,
      wickTop,
      wickBottom,
      bodyTop,
      bodyBottom,
      bodyHeight: Math.max(bodyBottom - bodyTop, 2.2),
    };
  });

  return (
    <section className="space-y-4" aria-label="Métricas administrativas">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Actividad</p>
          <h2 className="text-xl font-semibold tracking-tight">Uso del sistema</h2>
        </div>
        <span className="text-xs text-muted-foreground">Actualización automática cada 15 s</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<Activity />} label="Impresiones · 24 horas" value={metrics.prints} tone="teal" />
        <MetricCard icon={<Copy />} label="Copias producidas" value={metrics.copies} tone="blue" />
        <MetricCard icon={<Users />} label="Usuarios activos" value={metrics.users} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden border-primary/20 bg-[#10263a] text-white shadow-lg shadow-primary/10">
          <CardHeader className="flex flex-row items-center justify-between border-b border-primary/10 bg-primary/[0.04]">
            <div>
              <CardTitle className="text-base text-white">Ritmo de impresiones</CardTitle>
              <p className="mt-1 text-xs text-slate-300">Actividad por hora de las últimas 24 horas</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <TrendingUp className="h-4 w-4" /> En vivo
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="relative h-40 overflow-visible rounded-lg border border-white/10 bg-[#0b1c2c] p-2">
              <div className="pointer-events-none absolute inset-x-2 top-2 bottom-6 opacity-15">
                <div className="h-full w-full bg-[linear-gradient(to_top,rgba(148,163,184,0.35)_1px,transparent_1px)] bg-[length:100%_33%]" />
              </div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-2 h-[calc(100%-2.5rem)] w-[calc(100%-1rem)] overflow-visible">
                {candleData.map((hour) => (
                  <g key={hour.date}>
                    <title>{`${hour.label}: ${hour.value} impresiones · apertura ${hour.open} · cierre ${hour.close}`}</title>
                    <line
                      x1={hour.x}
                      x2={hour.x}
                      y1={hour.wickTop}
                      y2={hour.wickBottom}
                      stroke={hour.isUp ? '#22c55e' : '#f87171'}
                      strokeWidth="0.7"
                      vectorEffect="non-scaling-stroke"
                    />
                    <rect
                      x={hour.x - 1.2}
                      y={hour.bodyTop}
                      width="2.4"
                      height={Math.max(hour.bodyHeight, 3.2)}
                      fill={hour.isUp ? '#22c55e' : '#f87171'}
                      opacity="0.95"
                      rx="0.45"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
              </svg>
              <div className="absolute inset-x-2 bottom-1 flex justify-between">
                {metrics.activity.map((hour) => (
                  <div key={hour.date} className="group relative flex flex-1 justify-center">
                    <span className="cursor-help text-[9px] text-slate-300 first-letter:capitalize">{hour.label}</span>
                    <span className="pointer-events-none absolute bottom-5 z-10 rounded-md border border-white/15 bg-[#071522] px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      {hour.value} · {hour.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/[0.08] via-card to-secondary/[0.05]">
          <CardHeader className="border-b border-warning/10 bg-warning/[0.04]">
            <CardTitle className="text-base">Formularios más utilizados</CardTitle>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><BarChart3 className="h-3 w-3" /> Ordenados por copias impresas</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.topForms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
            ) : (
              metrics.topForms.map((form, index) => (
                <div key={form.name} className="group relative space-y-1.5 rounded-md p-1 transition-colors hover:bg-warning/[0.08]">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="min-w-0 truncate font-medium">{index + 1}. {form.name}</span>
                    <span className="shrink-0 text-muted-foreground">{form.value}</span>
                  </div>
                  <span className="pointer-events-none absolute right-2 top-8 z-10 max-w-xs rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {form.name} · {form.value} copias
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-warning/15">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-warning to-secondary transition-all duration-700"
                      style={{ width: `${Math.max((form.value / maxForm) * 100, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'teal' | 'blue' | 'amber' }) {
  const styles = {
    teal: 'bg-secondary/15 text-secondary ring-1 ring-secondary/20',
    blue: 'bg-primary/15 text-primary ring-1 ring-primary/20',
    amber: 'bg-warning/20 text-warning ring-1 ring-warning/25',
  };

  return (
    <Card className="flex items-center gap-4 border-transparent bg-card/80 p-5 shadow-sm backdrop-blur-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles[tone]}`}>
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </Card>
  );
}
