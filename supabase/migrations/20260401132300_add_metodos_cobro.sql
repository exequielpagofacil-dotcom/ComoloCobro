create table if not exists public.metodos_cobro (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  constraint metodos_cobro_slug_lowercase check (slug = lower(slug))
);

create index if not exists metodos_cobro_nombre_idx on public.metodos_cobro (nombre asc);

alter table public.metodos_cobro enable row level security;

insert into public.metodos_cobro (nombre, slug)
select distinct
  metodo as nombre,
  lower(
    regexp_replace(
      regexp_replace(
        translate(metodo, 'ÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛáàäâéèëêíìïîóòöôúùüûÑñ', 'AAAAEEEEIIIIOOOOUUUUaaaaeeeeiiiioooouuuuNn'),
        '[^a-zA-Z0-9\s-]',
        '',
        'g'
      ),
      '\s+',
      '-',
      'g'
    )
  ) as slug
from public.empresas e
cross join lateral unnest(e.como_se_paga) as metodo
where btrim(metodo) <> ''
on conflict (slug) do update
set nombre = excluded.nombre;
