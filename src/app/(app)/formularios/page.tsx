import { Catalogo } from '@/components/formularios/Catalogo';

export const dynamic = 'force-dynamic';

export default function FormulariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">Catálogo de Formularios</h1>
      <Catalogo />
    </div>
  );
}