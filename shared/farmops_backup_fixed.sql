--
-- PostgreSQL database dump
--

\restrict xc1VLbNUjK9AtFE8gXDp8aydyZItwt0I6lK9QKHRnxSZbnngNN2Ij8TlfGyEc0T

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.income_entries DROP CONSTRAINT IF EXISTS income_entries_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expense_entries DROP CONSTRAINT IF EXISTS expense_entries_user_id_fkey;
DROP INDEX IF EXISTS public.users_email_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_pkey;
ALTER TABLE IF EXISTS ONLY public.income_entries DROP CONSTRAINT IF EXISTS income_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.expense_entries DROP CONSTRAINT IF EXISTS expense_entries_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventory_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventory_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.income_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.expense_entries ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.inventory_transactions_id_seq;
DROP TABLE IF EXISTS public.inventory_transactions;
DROP SEQUENCE IF EXISTS public.inventory_items_id_seq;
DROP TABLE IF EXISTS public.inventory_items;
DROP SEQUENCE IF EXISTS public.income_entries_id_seq;
DROP TABLE IF EXISTS public.income_entries;
DROP SEQUENCE IF EXISTS public.expense_entries_id_seq;
DROP TABLE IF EXISTS public.expense_entries;
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."PaymentMethod";
DROP TYPE IF EXISTS public."InventoryType";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: InventoryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InventoryType" AS ENUM (
    'LIVESTOCK',
    'PRODUCE',
    'CONSUMABLES'
);


ALTER TYPE public."InventoryType" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'TRANSFER'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'OWNER',
    'MANAGER',
    'WORKER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: expense_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_entries (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    category text NOT NULL,
    note text,
    date timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    user_id integer NOT NULL,
    merchant text DEFAULT 'Manual Entry'::text,
    "hasReceipt" boolean DEFAULT false NOT NULL,
    "ocrConfidence" integer,
    "ocrSource" text,
    "rawText" text
);


ALTER TABLE public.expense_entries OWNER TO postgres;

--
-- Name: expense_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expense_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_entries_id_seq OWNER TO postgres;

--
-- Name: expense_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_entries_id_seq OWNED BY public.expense_entries.id;


--
-- Name: income_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.income_entries (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    category text NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text,
    quantity numeric(10,2),
    unit_price numeric(10,2),
    enable_vat boolean DEFAULT false,
    vat_rate numeric(5,2) DEFAULT 7.5,
    vat_amount numeric(10,2),
    subtotal numeric(10,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.income_entries OWNER TO postgres;

--
-- Name: income_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.income_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.income_entries_id_seq OWNER TO postgres;

--
-- Name: income_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.income_entries_id_seq OWNED BY public.income_entries.id;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id integer NOT NULL,
    name text NOT NULL,
    type public."InventoryType" NOT NULL,
    unit text NOT NULL,
    quantity numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_items_id_seq OWNER TO postgres;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transactions (
    id integer NOT NULL,
    quantity_change numeric(10,2) NOT NULL,
    reason text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    inventory_item_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.inventory_transactions OWNER TO postgres;

--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_transactions_id_seq OWNER TO postgres;

--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_transactions_id_seq OWNED BY public.inventory_transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'WORKER'::public."UserRole" NOT NULL,
    created_by integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: expense_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_entries ALTER COLUMN id SET DEFAULT nextval('public.expense_entries_id_seq'::regclass);


--
-- Name: income_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.income_entries ALTER COLUMN id SET DEFAULT nextval('public.income_entries_id_seq'::regclass);


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: inventory_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions ALTER COLUMN id SET DEFAULT nextval('public.inventory_transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: expense_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_entries (id, amount, category, note, date, created_at, updated_at, user_id, merchant, "hasReceipt", "ocrConfidence", "ocrSource", "rawText") FROM stdin;
\.


--
-- Data for Name: income_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.income_entries (id, amount, category, payment_method, date, description, quantity, unit_price, enable_vat, vat_rate, vat_amount, subtotal, created_at, updated_at, user_id) FROM stdin;
1	774000.00	Sales	TRANSFER	2026-03-10 00:00:00	50kg Bag of Rice	12.00	60000.00	t	7.50	54000.00	720000.00	2026-03-10 14:53:20.545	2026-03-10 14:53:20.545	1
2	193500.00	Sales	TRANSFER	2026-03-10 00:00:00	Payment for invoice #QWE12333 - John	\N	\N	f	7.50	\N	\N	2026-03-10 15:06:05.566	2026-03-10 15:06:05.566	3
3	3225000.00	Sales	CASH	2026-03-10 00:00:00	Payment for invoice #INV-2234 - Uche Emeka	\N	\N	f	7.50	\N	\N	2026-03-10 15:06:05.714	2026-03-10 15:06:05.714	3
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, name, type, unit, quantity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions (id, quantity_change, reason, date, created_at, updated_at, inventory_item_id, user_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, created_by, created_at, updated_at) FROM stdin;
1	Kelechi Farmer	kelechi@farmer.com	$2b$12$gjAJk52paNO1nwYsNM.GNudn4JIzML/le38lS2fBRpnESaBX0mrkS	OWNER	\N	2026-03-10 14:51:39.191	2026-03-10 14:51:39.191
2	Kelechi Worker	kelechi@worker.com	$2b$12$j01qbmTRwm9wcfAopw0SEuBYefFfE6hlLW293HlEj9efoHD1NPhWi	WORKER	1	2026-03-10 14:52:44.634	2026-03-10 14:52:44.634
3	Nnenna Farmer	nnenna@farmer.com	$2b$12$Skr0fglRN6bTJuB6YTaW0.8kzbKKJDQzTAKKHTWXEuU86OiCAwODW	OWNER	\N	2026-03-10 14:55:06.395	2026-03-10 14:55:06.395
\.


--
-- Name: expense_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_entries_id_seq', 1, false);


--
-- Name: income_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.income_entries_id_seq', 3, true);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 1, false);


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_transactions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: expense_entries expense_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_entries
    ADD CONSTRAINT expense_entries_pkey PRIMARY KEY (id);


--
-- Name: income_entries income_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.income_entries
    ADD CONSTRAINT income_entries_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: expense_entries expense_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_entries
    ADD CONSTRAINT expense_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: income_entries income_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.income_entries
    ADD CONSTRAINT income_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict xc1VLbNUjK9AtFE8gXDp8aydyZItwt0I6lK9QKHRnxSZbnngNN2Ij8TlfGyEc0T

