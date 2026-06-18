export type Categoria = 'obra_construida' | 'proyecto' | 'peritaje' | 'licitacion';
export type Estado = 'en_curso' | 'finalizada';

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'obra_construida', label: 'Obra construida' },
  { value: 'proyecto', label: 'Proyecto' },
  { value: 'peritaje', label: 'Peritaje' },
  { value: 'licitacion', label: 'Licitación' },
];

export const ESTADOS: { value: Estado; label: string }[] = [
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
];

export function categoriaLabel(value: string): string {
  return CATEGORIAS.find((c) => c.value === value)?.label ?? value;
}

export function estadoLabel(value: string): string {
  return ESTADOS.find((e) => e.value === value)?.label ?? value;
}

export interface ObraFoto { id: string; obra_id: string; url: string; alt: string | null; orden: number; }

export interface Obra {
  id: string; slug: string; titulo: string; categoria: Categoria;
  descripcion: string | null; ubicacion: string | null; anio: number | null;
  cliente: string | null; estado: Estado | null; portada_url: string | null;
  destacada: boolean; orden: number; created_at: string;
  obra_fotos?: ObraFoto[];
}

export interface Contacto {
  id: number; razon_social: string; direccion: string | null; telefono: string | null;
  email: string | null; horario: string | null; redes: Record<string, string> | null;
  mapa_embed: string | null;
}
