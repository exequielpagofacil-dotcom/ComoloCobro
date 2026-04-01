create extension if not exists pgcrypto;

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  icono text not null default 'Building2',
  orden integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint categorias_slug_lowercase check (slug = lower(slug))
);

create table if not exists public.metodos_cobro (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  constraint metodos_cobro_slug_lowercase check (slug = lower(slug))
);

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

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  logo_url text,
  descripcion text not null default '',
  como_se_paga text[] not null default '{}',
  acepta_efectivo boolean not null default true,
  acepta_debito boolean not null default true,
  acepta_qr boolean not null default true,
  tags text[] not null default '{}',
  video_url text,
  activa boolean not null default true,
  visitas integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  search_document tsvector generated always as (
    public.build_empresa_search_document(nombre, descripcion, como_se_paga, tags)
  ) stored,
  constraint empresas_slug_lowercase check (slug = lower(slug))
);

create table if not exists public.pasos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  orden integer not null,
  titulo text not null,
  descripcion text,
  imagen_url text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint pasos_orden_unique unique (empresa_id, orden)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists empresas_set_updated_at on public.empresas;
create trigger empresas_set_updated_at
before update on public.empresas
for each row
execute function public.set_updated_at();

create index if not exists categorias_orden_idx on public.categorias (orden asc, nombre asc);
create index if not exists metodos_cobro_nombre_idx on public.metodos_cobro (nombre asc);
create index if not exists empresas_categoria_id_idx on public.empresas (categoria_id);
create index if not exists empresas_activa_idx on public.empresas (activa);
create index if not exists empresas_visitas_desc_idx on public.empresas (visitas desc);
create index if not exists pasos_empresa_orden_idx on public.pasos (empresa_id, orden asc);
create index if not exists empresas_search_document_idx on public.empresas using gin (search_document);

alter table public.categorias enable row level security;
alter table public.metodos_cobro enable row level security;
alter table public.empresas enable row level security;
alter table public.pasos enable row level security;

drop policy if exists "Public can read categorias" on public.categorias;
create policy "Public can read categorias"
on public.categorias
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active empresas" on public.empresas;
create policy "Public can read active empresas"
on public.empresas
for select
to anon, authenticated
using (activa = true);

drop policy if exists "Public can read pasos of active empresas" on public.pasos;
create policy "Public can read pasos of active empresas"
on public.pasos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.empresas e
    where e.id = pasos.empresa_id
      and e.activa = true
  )
);

grant select on public.categorias to anon, authenticated;
grant select on public.empresas to anon, authenticated;
grant select on public.pasos to anon, authenticated;

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
  acepta_efectivo boolean,
  acepta_debito boolean,
  acepta_qr boolean,
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
      e.acepta_efectivo,
      e.acepta_debito,
      e.acepta_qr,
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
      e.acepta_efectivo,
      e.acepta_debito,
      e.acepta_qr,
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

create or replace function public.incrementar_visitas(p_empresa_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_visits integer;
begin
  update public.empresas
  set visitas = visitas + 1
  where id = p_empresa_id
  returning visitas into new_visits;

  return coalesce(new_visits, 0);
end;
$$;

grant execute on function public.search_empresas(text, integer, integer) to anon, authenticated;
grant execute on function public.incrementar_visitas(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set public = excluded.public,
    name = excluded.name;

drop policy if exists "Public can view media" on storage.objects;
create policy "Public can view media"
on storage.objects
for select
to public
using (bucket_id = 'media');

drop policy if exists "Service role can manage media" on storage.objects;
create policy "Service role can manage media"
on storage.objects
for all
to service_role
using (bucket_id = 'media')
with check (bucket_id = 'media');
