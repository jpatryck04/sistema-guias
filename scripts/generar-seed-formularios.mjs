import fs from 'node:fs';
import path from 'node:path';

const directory = path.resolve('public/formularios');
const output = path.resolve('supabase/seed_formularios.sql');
const files = fs
  .readdirSync(directory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, 'es'));

function sql(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function displayName(filename) {
  return filename;
}

const rows = files.map((filename, index) => {
  const category = 'General';
  const storagePath = `/formularios/${filename}`;

  return `    (${sql(displayName(filename))},\n     ${sql(filename)},\n     ${sql(category)},\n     ${sql(`Guía de inspección de ${displayName(filename).toLowerCase()}.`)},\n     ${sql(storagePath)},\n     ${index + 1}, true)`;
});

const updateRows = files.map((filename, index) => {
  const category = 'General';
  const name = displayName(filename);
  const description = name;
  const storagePath = `/formularios/${filename}`;
  return `    (${sql(name)}, ${sql(filename)}, ${sql(category)}, ${sql(description)}, ${sql(storagePath)}, ${index + 1}, true)`;
});

const content = `-- Generado automáticamente desde public/formularios.\n-- Conserva los nombres originales de los archivos PDF.\n\nUPDATE public.formularios AS current\nSET nombre = incoming.nombre,\n    categoria = incoming.categoria,\n    descripcion = incoming.descripcion,\n    storage_path = incoming.storage_path,\n    orden = incoming.orden,\n    activo = incoming.activo\nFROM (VALUES\n${updateRows.join(',\n')}\n) AS incoming(nombre, nombre_archivo, categoria, descripcion, storage_path, orden, activo)\nWHERE current.nombre_archivo = incoming.nombre_archivo;\n\nINSERT INTO public.formularios (nombre, nombre_archivo, categoria, descripcion, storage_path, orden, activo)\nSELECT incoming.nombre, incoming.nombre_archivo, incoming.categoria, incoming.descripcion, incoming.storage_path, incoming.orden, incoming.activo\nFROM (VALUES\n${rows.join(',\n\n')}\n) AS incoming(nombre, nombre_archivo, categoria, descripcion, storage_path, orden, activo)\nWHERE NOT EXISTS (\n  SELECT 1 FROM public.formularios current\n  WHERE current.nombre_archivo = incoming.nombre_archivo\n);\n`;

fs.writeFileSync(output, content, 'utf8');
console.log(`Generados ${files.length} formularios en ${output}`);
