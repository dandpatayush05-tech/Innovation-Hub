-- Conversations Table
create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  traveler_id uuid not null references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(traveler_id, business_id)
);

alter table conversations enable row level security;

-- Messages Table
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table messages enable row level security;

-- RLS Policies
-- Allow travelers and business owners to read their conversations
create policy "Users can view their own conversations"
  on conversations for select
  using (
    auth.uid() = traveler_id or 
    auth.uid() in (select user_id from businesses where id = business_id)
  );

-- Allow travelers and business owners to read messages in their conversations
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    conversation_id in (
      select id from conversations
      where traveler_id = auth.uid() or business_id in (select id from businesses where user_id = auth.uid())
    )
  );

-- Enable Realtime for messages table
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
end $$;

