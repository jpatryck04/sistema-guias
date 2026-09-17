import type { ItemImpresion, ProgresoImpresion } from '@/types/impresion';

const PDF_LOAD_TIMEOUT = 8000;
const PRINT_DIALOG_TIMEOUT = 15000;

/**
 * Imprime una lista de formularios de forma secuencial.
 *
 * LIMITACIÓN IMPORTANTE:
 * Los navegadores modernos NO permiten abrir múltiples diálogos de impresión
 * de forma automatizada. Por cada PDF, se abre el diálogo nativo y el usuario
 * debe confirmar/cerrar antes de continuar con el siguiente.
 *
 * No es posible imprimir silenciosamente ni seleccionar impresora desde JS.
 */
export async function printFormularios(
  items: ItemImpresion[],
  onProgress?: (p: ProgresoImpresion) => void
): Promise<void> {
  // Expandir copias
  const cola: { storagePath: string; nombre: string }[] = [];
  for (const item of items) {
    for (let i = 0; i < item.copias; i++) {
      cola.push({ storagePath: item.storagePath, nombre: item.formularioNombre });
    }
  }

  const total = cola.length;

  for (let i = 0; i < cola.length; i++) {
    const item = cola[i];
    onProgress?.({ actual: i + 1, total, formularioNombre: item.nombre });

    try {
      await imprimirUno(item.storagePath, item.nombre, PRINT_DIALOG_TIMEOUT);
    } catch (err) {
      console.error(`Error imprimiendo ${item.nombre}:`, err);
    }

    // Reducimos el tiempo de transición para acelerar la cola de impresión.
    await sleep(40);
  }
}

function imprimirUno(storagePath: string, formularioNombre: string, printTimeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const previousTitle = document.title;
    const printTitle = formularioNombre.replace(/\.pdf$/i, '');
    document.title = printTitle;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = encodeURI(storagePath);
    iframe.title = formularioNombre;

    let resolved = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let removePrintListeners = () => {};

    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallbackTimer);
      removePrintListeners();
      try {
        document.body.removeChild(iframe);
      } catch {
        // Ignorar
      }
      document.title = previousTitle;
      resolve();
    };

    const loadTimer = setTimeout(() => {
      if (!resolved) {
        console.warn(`PDF tardó más de ${PDF_LOAD_TIMEOUT}ms: ${storagePath}`);
        cleanup();
      }
    }, PDF_LOAD_TIMEOUT);

    iframe.onload = () => {
      clearTimeout(loadTimer);
      setTimeout(() => {
        try {
          const win = iframe.contentWindow;
          if (!win) {
            cleanup();
            return;
          }

          const finishAfterPrint = () => {
            cleanup();
          };

          win.addEventListener('afterprint', finishAfterPrint);
          window.addEventListener('afterprint', finishAfterPrint);

          removePrintListeners = () => {
            win.removeEventListener('afterprint', finishAfterPrint);
            window.removeEventListener('afterprint', finishAfterPrint);
          };

          win.focus();
          win.print();

          // Fallback si afterprint no dispara.
          fallbackTimer = setTimeout(cleanup, printTimeoutMs);
        } catch (err) {
          console.error('Error en print:', err);
          cleanup();
        }
      }, 50);
    };

    iframe.onerror = () => {
      clearTimeout(loadTimer);
      document.title = previousTitle;
      reject(new Error(`Error cargando PDF: ${storagePath}`));
    };

    document.body.appendChild(iframe);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}