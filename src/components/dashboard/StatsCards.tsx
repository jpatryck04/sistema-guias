import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Printer, CalendarDays, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  totalFormularios: number;
  impresionesHoy: number;
  impresionesMes: number;
  ultimaImpresion: { created_at: string; formulario_nombre: string; usuario?: string | null } | null;
}

export function StatsCards({ totalFormularios, impresionesHoy, impresionesMes, ultimaImpresion }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Formularios activos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFormularios}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Impresiones hoy</CardTitle>
          <Printer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{impresionesHoy}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Impresiones del mes</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{impresionesMes}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Última impresión</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {ultimaImpresion ? (
            <div className="space-y-1">
              <div className="truncate text-sm font-medium">{ultimaImpresion.formulario_nombre}</div>
              <div className="text-xs text-muted-foreground">{formatDate(ultimaImpresion.created_at)}</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Sin registros</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}