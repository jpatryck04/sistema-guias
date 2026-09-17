'use client';

import { useMemo, useState } from 'react';
import { useFormularios } from '@/hooks/useFormularios';
import { useSeleccion } from '@/hooks/useSeleccion';
import { useImpresion } from '@/hooks/useImpresion';
import { BuscadorFormularios } from './BuscadorFormularios';
import { FiltrosFormularios } from './FiltrosFormularios';
import { TablaFormularios } from './TablaFormularios';
import { CardFormulario } from './CardFormulario';
import { VistaPreviaDialog } from './VistaPreviaDialog';
import { BarraSeleccion } from './BarraSeleccion';
import { ModalImpresion } from './ModalImpresion';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Formulario } from '@/types/formulario';

export function Catalogo() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [soloActivos, setSoloActivos] = useState(true);

  const { formularios, loading, error, refetch } = useFormularios({
    busqueda,
    categoria,
    soloActivos,
  });
  const seleccion = useSeleccion();
  const { imprimir, imprimiendo, progreso } = useImpresion();

  const [preview, setPreview] = useState<Formulario | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categorias = useMemo(
    () => Array.from(new Set(formularios.map((f) => f.categoria))).sort(),
    [formularios]
  );

  const seleccionados = useMemo(
    () => formularios.filter((f) => seleccion.seleccion.has(f.id)),
    [formularios, seleccion.seleccion]
  );

  function toggleTodos(checked: boolean) {
    if (checked) seleccion.seleccionarTodos(formularios.map((f) => f.id));
    else seleccion.limpiar();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <BuscadorFormularios value={busqueda} onChange={setBusqueda} />
          </div>
          <div className="lg:ml-auto">
            <FiltrosFormularios
              categorias={categorias}
              categoria={categoria}
              onCategoriaChange={setCategoria}
              soloActivos={soloActivos}
              onSoloActivosChange={setSoloActivos}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm">
          <EmptyState
            title="No se pudieron cargar los formularios"
            description={error}
            actionLabel="Reintentar"
            onAction={() => void refetch()}
          />
        </div>
      ) : formularios.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm">
          <EmptyState title="Sin formularios" description="Ajusta los filtros o la búsqueda." />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <TablaFormularios
              formularios={formularios}
              seleccionados={seleccion.seleccion}
              onToggle={seleccion.toggle}
              onToggleTodos={toggleTodos}
              onPreview={setPreview}
            />
          </div>
          <div className="grid gap-3 md:hidden">
            {formularios.map((f) => (
              <CardFormulario
                key={f.id}
                formulario={f}
                seleccionado={seleccion.seleccion.has(f.id)}
                onToggle={seleccion.toggle}
                onPreview={setPreview}
              />
            ))}
          </div>
        </>
      )}

      <BarraSeleccion
        count={seleccion.count}
        onLimpiar={seleccion.limpiar}
        onImprimir={() => setModalOpen(true)}
      />

      <VistaPreviaDialog
        formulario={preview}
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
      />

      <ModalImpresion
        open={modalOpen}
        onOpenChange={setModalOpen}
        formularios={seleccionados}
        onConfirm={imprimir}
        imprimiendo={imprimiendo}
        progreso={progreso}
      />
    </div>
  );
}