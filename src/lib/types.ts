export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  icono: string | null;
  orden: number;
  created_at: string;
};

export type MetodoCobroSugerido = {
  id: string;
  nombre: string;
  slug: string;
  created_at: string;
};

export type Paso = {
  id: string;
  empresa_id: string;
  orden: number;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  created_at: string;
};

export type Empresa = {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: string;
  logo_url: string | null;
  descripcion: string;
  como_se_paga: string[];
  acepta_efectivo: boolean;
  acepta_debito: boolean;
  acepta_qr: boolean;
  tags: string[];
  video_url: string | null;
  activa: boolean;
  visitas: number;
  created_at: string;
  updated_at: string;
  categoria: Categoria | null;
  pasos: Paso[];
};

export type SearchEmpresaRow = {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: string;
  categoria_nombre: string;
  categoria_slug: string;
  categoria_icono: string | null;
  logo_url: string | null;
  descripcion: string;
  como_se_paga: string[] | null;
  acepta_efectivo: boolean;
  acepta_debito: boolean;
  acepta_qr: boolean;
  tags: string[] | null;
  video_url: string | null;
  activa: boolean;
  visitas: number;
  created_at: string;
  updated_at: string;
  rank: number;
};

export type SearchEmpresa = Omit<Empresa, "categoria" | "pasos"> & {
  categoria: Categoria | null;
  pasos: Paso[];
  rank?: number | undefined;
};

export type DashboardSummary = {
  totalEmpresas: number;
  ultimasEditadas: Empresa[];
  topVisitadas: Empresa[];
};

export type EmpresaFormStepInput = {
  id?: string | undefined;
  orden: number;
  titulo: string;
  descripcion?: string | null | undefined;
  imagen_url?: string | null | undefined;
};

export type EmpresaFormInput = {
  nombre: string;
  slug: string;
  categoria_id: string;
  logo_url?: string | null | undefined;
  descripcion: string;
  como_se_paga: string[];
  acepta_efectivo?: boolean | undefined;
  acepta_debito?: boolean | undefined;
  acepta_qr?: boolean | undefined;
  tags: string[];
  video_url?: string | null | undefined;
  activa?: boolean | undefined;
  pasos: EmpresaFormStepInput[];
};

export type CategoriaInput = {
  nombre: string;
  slug: string;
  icono: string;
  orden: number;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};
