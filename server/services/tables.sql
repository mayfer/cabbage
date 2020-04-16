CREATE TABLE public.channel_users (
    id integer NOT NULL,
    user_id integer,
    channel_id integer,
    "timestamp" bigint,
    name text
);
ALTER TABLE public.channel_users OWNER TO madeleine;
CREATE SEQUENCE public.channel_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.channel_users_id_seq OWNER TO madeleine;
ALTER SEQUENCE public.channel_users_id_seq OWNED BY public.channel_users.id;
CREATE TABLE public.channels (
    id integer NOT NULL,
    title text,
    slug text,
    "timestamp" bigint,
    last_played bigint,
    settings jsonb,
    user_id integer
);
ALTER TABLE public.channels OWNER TO madeleine;
CREATE SEQUENCE public.channels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.channels_id_seq OWNER TO madeleine;
ALTER SEQUENCE public.channels_id_seq OWNED BY public.channels.id;
CREATE TABLE public.rounds (
    id integer NOT NULL,
    user_id integer,
    "timestamp" bigint,
    channel_id integer,
    status text DEFAULT 'open'::text,
    settings jsonb
);
ALTER TABLE public.rounds OWNER TO madeleine;
CREATE SEQUENCE public.rounds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.rounds_id_seq OWNER TO madeleine;
ALTER SEQUENCE public.rounds_id_seq OWNED BY public.rounds.id;
CREATE TABLE public.turns (
    id integer NOT NULL,
    round_id integer,
    user_id integer,
    previous_turn_id integer,
    "timestamp" bigint,
    type text,
    contents text
);
ALTER TABLE public.turns OWNER TO madeleine;
CREATE SEQUENCE public.turns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.turns_id_seq OWNER TO madeleine;
ALTER SEQUENCE public.turns_id_seq OWNED BY public.turns.id;
CREATE TABLE public.users (
    id integer NOT NULL,
    handle text,
    email text,
    public_id text NOT NULL,
    password text,
    props jsonb DEFAULT '{}'::jsonb,
    deleted boolean DEFAULT false
);
ALTER TABLE public.users OWNER TO madeleine;
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.users_id_seq OWNER TO madeleine;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.channel_users ALTER COLUMN id SET DEFAULT nextval('public.channel_users_id_seq'::regclass);
ALTER TABLE ONLY public.channels ALTER COLUMN id SET DEFAULT nextval('public.channels_id_seq'::regclass);
ALTER TABLE ONLY public.rounds ALTER COLUMN id SET DEFAULT nextval('public.rounds_id_seq'::regclass);
ALTER TABLE ONLY public.turns ALTER COLUMN id SET DEFAULT nextval('public.turns_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.channel_users
    ADD CONSTRAINT channel_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.turns
    ADD CONSTRAINT turns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_handle_key UNIQUE (handle);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_public_id_key UNIQUE (public_id);
CREATE INDEX channel_users_channel_id_idx ON public.channel_users USING btree (channel_id);
CREATE UNIQUE INDEX channel_users_channel_id_user_id_idx ON public.channel_users USING btree (channel_id, user_id);
CREATE INDEX channels_slug_idx ON public.channels USING btree (slug);
CREATE UNIQUE INDEX cspiel_users_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX cspiel_users_handle_key ON public.users USING btree (handle);
CREATE UNIQUE INDEX cspiel_users_pkey ON public.users USING btree (id);
CREATE UNIQUE INDEX cspiel_users_public_id_key ON public.users USING btree (public_id);
CREATE UNIQUE INDEX cusers_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX cusers_handle_key ON public.users USING btree (handle);
CREATE UNIQUE INDEX cusers_pkey ON public.users USING btree (id);
CREATE UNIQUE INDEX cusers_public_id_key ON public.users USING btree (public_id);
CREATE INDEX rounds_channel_id_idx ON public.rounds USING btree (channel_id);
CREATE INDEX rounds_user_id_idx ON public.rounds USING btree (user_id);
CREATE INDEX turns_previous_turn_id_idx ON public.turns USING btree (previous_turn_id);
CREATE INDEX turns_round_id_idx ON public.turns USING btree (round_id);
CREATE INDEX turns_user_id_idx ON public.turns USING btree (user_id);
ALTER TABLE ONLY public.channel_users
    ADD CONSTRAINT channel_users_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id);
ALTER TABLE ONLY public.channel_users
    ADD CONSTRAINT channel_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.turns
    ADD CONSTRAINT turns_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.rounds(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.turns
    ADD CONSTRAINT turns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
