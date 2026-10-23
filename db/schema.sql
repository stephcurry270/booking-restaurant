create extension if not exists btree_gist;

create table if not exists bookings (
                                        id         integer generated always as identity primary key,
                                        name       text        not null,
                                        phone      text        not null,
                                        guests     smallint    not null check (guests between 1 and 12),
    table_id   integer     not null,
    starts_at  timestamp   not null,
    ends_at    timestamp   not null,
    created_at timestamptz not null default now(),
    check (ends_at > starts_at),

    constraint bookings_no_overlap
    exclude using gist (table_id with =, tsrange(starts_at, ends_at) with &&)
    );

create index if not exists bookings_starts_at_idx on bookings (starts_at);