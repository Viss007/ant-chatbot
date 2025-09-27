create table if not exists public.messages (
  id bigserial primary key,
  session_identifier text not null,
  role text not null check (role in ('system','user','assistant')),
  message_text text not null,
  created_time timestamptz not null default now()
);
create index if not exists messages_session_idx on public.messages (session_identifier, created_time desc);
