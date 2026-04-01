alter table public.empresas
add column if not exists como_se_paga text[] not null default '{}';

create or replace function public.build_empresa_search_document(
  p_nombre text,
  p_descripcion text,
  p_como_se_paga text[],
  p_tags text[]
)
returns tsvector
language sql
immutable
as $$
  select
    setweight(to_tsvector('spanish', coalesce(p_nombre, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(p_descripcion, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(array_to_string(p_como_se_paga, ' '), '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(array_to_string(p_tags, ' '), '')), 'C');
$$;

drop index if exists empresas_search_document_idx;

alter table public.empresas
drop column if exists search_document;

alter table public.empresas
add column search_document tsvector generated always as (
  public.build_empresa_search_document(nombre, descripcion, como_se_paga, tags)
) stored;

create index if not exists empresas_search_document_idx on public.empresas using gin (search_document);

create or replace function public.search_empresas(
  search_term text,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  id uuid,
  nombre text,
  slug text,
  categoria_id uuid,
  categoria_nombre text,
  categoria_slug text,
  categoria_icono text,
  logo_url text,
  descripcion text,
  como_se_paga text[],
  tags text[],
  video_url text,
  activa boolean,
  visitas integer,
  created_at timestamptz,
  updated_at timestamptz,
  rank real
)
language plpgsql
stable
as $$
declare
  normalized_term text := nullif(btrim(search_term), '');
begin
  if normalized_term is null then
    return query
    select
      e.id,
      e.nombre,
      e.slug,
      e.categoria_id,
      c.nombre as categoria_nombre,
      c.slug as categoria_slug,
      c.icono as categoria_icono,
      e.logo_url,
      e.descripcion,
      e.como_se_paga,
      e.tags,
      e.video_url,
      e.activa,
      e.visitas,
      e.created_at,
      e.updated_at,
      0::real as rank
    from public.empresas e
    inner join public.categorias c on c.id = e.categoria_id
    where e.activa = true
    order by e.visitas desc, e.nombre asc
    limit result_limit
    offset result_offset;
  else
    return query
    with parsed_query as (
      select websearch_to_tsquery('spanish', normalized_term) as query
    )
    select
      e.id,
      e.nombre,
      e.slug,
      e.categoria_id,
      c.nombre as categoria_nombre,
      c.slug as categoria_slug,
      c.icono as categoria_icono,
      e.logo_url,
      e.descripcion,
      e.como_se_paga,
      e.tags,
      e.video_url,
      e.activa,
      e.visitas,
      e.created_at,
      e.updated_at,
      ts_rank(e.search_document, parsed_query.query) as rank
    from public.empresas e
    inner join public.categorias c on c.id = e.categoria_id
    cross join parsed_query
    where e.activa = true
      and e.search_document @@ parsed_query.query
    order by rank desc, e.visitas desc, e.nombre asc
    limit result_limit
    offset result_offset;
  end if;
end;
$$;
