import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import type { ImpresionConUsuario } from '@/types/impresion';

interface Props {
  data: ImpresionConUsuario[];
}

export function RecentPrints({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas 10 impresiones</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin impresiones registradas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Formulario</TableHead>
                <TableHead className="text-right">Copias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs">{formatDate(row.created_at)}</TableCell>
                  <TableCell className="text-xs">{row.usuario_nombre ?? '—'}</TableCell>
                  <TableCell className="text-xs">{row.formulario_nombre}</TableCell>
                  <TableCell className="text-right text-xs font-medium">{row.copias}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}