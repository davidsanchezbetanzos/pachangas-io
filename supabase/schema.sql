-- =====================================================
-- SCHEMA SQL - Pachangas App
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- TABLA: MATCHES (Partidos)
-- =====================================================
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  creator_id text not null,
  title text not null,
  description text,
  location text,
  map_url text,
  match_date timestamptz not null,
  player_limit int default 10,  -- Futbol Sala por defecto
  status text default 'open' check (status in ('open', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- TABLA: PLAYERS (Jugadores)
-- =====================================================
create table public.players (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade,
  user_id text not null,
  name text not null,
  notes text,
  is_guest boolean default false,
  guest_of text,
  status text default 'main' check (status in ('main', 'substitute')),
  position int not null,
  created_at timestamptz default now(),
  unique(match_id, user_id)
);

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================
create index idx_players_match_id on public.players(match_id);
create index idx_players_status on public.players(match_id, status);
create index idx_players_position on public.players(match_id, status, position);
create index idx_matches_created_at on public.matches(created_at desc);
create index idx_matches_match_date on public.matches(match_date);

-- =====================================================
-- FUNCIÓN RPC: promote_substitute
-- Promueve el primer suplente a lista principal
-- Uso atómico para evitar condiciones de carrera
-- =====================================================
create or replace function public.promote_substitute(p_match_id uuid)
returns void
language plpgsql
as $$
declare
  v_substitute record;
begin
  -- Buscar primer suplente por orden FIFO
  select into v_substitute id, user_id, name, notes, is_guest, guest_of
  from public.players
  where match_id = p_match_id
    and status = 'substitute'
  order by position, created_at
  limit 1;

  -- Si hay suplente, promocionarlo
  if v_substitute.id is not null then
    update public.players
    set status = 'main'
    where id = v_substitute.id;
  end if;
end;
$$;

-- =====================================================
-- FUNCIÓN RPC: leave_match
-- Desapunta jugador y promoting suplente si existe
-- =====================================================
create or replace function public.leave_match(p_match_id uuid, p_user_id text)
returns void
language plpgsql
as $$
declare
  v_player record;
begin
  -- Obtener jugador que sedesapunta
  select into v_player id, status
  from public.players
  where match_id = p_match_id and user_id = p_user_id;

  if v_player.id is null then
    raise exception 'Jugador no encontrado' using errcode = 'P0002';
  end if;

  -- Eliminar jugador
  delete from public.players
  where id = v_player.id;

  -- Si era jugador principal, promoting suplente
  if v_player.status = 'main' then
    perform public.promote_substitute(p_match_id);
  end if;
end;
$$;

-- =====================================================
-- FUNCIÓN RPC: join_match
-- Apunta jugador con lógica FIFO
-- =====================================================
create or replace function public.join_match(
  p_match_id uuid,
  p_user_id text,
  p_name text,
  p_notes text default null,
  p_is_guest boolean default false,
  p_guest_of text default null
)
returns text  -- 'joined' o 'waitlisted'
language plpgsql
as $$
declare
  v_match record;
  v_main_count int;
  v_limit int;
  v_result text;
begin
  -- Obtener info del partido
  select into v_match player_limit from public.matches where id = p_match_id;
  
  if v_match is null then
    raise exception 'Partido no encontrado' using errcode = 'P0002';
  end if;

  v_limit := v_match.player_limit;

  -- Contar jugadores principales
  select count(*) into v_main_count
  from public.players
  where match_id = p_match_id and status = 'main';

  -- Si hay límite y está lleno, waitslist
  if v_limit is not null and v_main_count >= v_limit then
    insert into public.players (match_id, user_id, name, notes, is_guest, guest_of, status, position)
    values (p_match_id, p_user_id, p_name, p_notes, p_is_guest, p_guest_of, 'substitute',
      (select coalesce(max(position), 0) + 1 from public.players where match_id = p_match_id and status = 'substitute')
    );
    return 'waitlisted';
  else
    insert into public.players (match_id, user_id, name, notes, is_guest, guest_of, status, position)
    values (p_match_id, p_user_id, p_name, p_notes, p_is_guest, p_guest_of, 'main',
      (select coalesce(max(position), 0) + 1 from public.players where match_id = p_match_id and status = 'main')
    );
    return 'joined';
  end if;
end;
$$;

-- =====================================================
-- RLS POLICIES (Security)
-- =====================================================
alter table public.matches enable row level security;
alter table public.players enable row level security;

-- Cualquiera puede ver partidos
create policy "Anyone can view matches" on public.matches
  for select using (true);

create policy "Anyone can view players" on public.players
  for select using (true);

-- Solo el creador puede editar su partido
create policy "Creator can update match" on public.matches
  for update using (auth.uid() = creator_id);

-- Anyone can insert players
create policy "Anyone can insert players" on public.players
  for insert with check (true);

-- Anyone can update/delete their own player record
create policy "Player can update own record" on public.players
  for update using (auth.uid() = user_id);

create policy "Player can delete own record" on public.players
  for delete using (auth.uid() = user_id);