# JOBS — gestão financeira

Next.js 14 (App Router) · TailwindCSS · Neon (PostgreSQL serverless).

## Rodar localmente
1. `npm install`
2. Copie `.env.example` para `.env.local` e preencha `DATABASE_URL` (Neon) e `JWT_SECRET`.
3. Crie as tabelas: cole `schema.sql` no SQL Editor do Neon, ou rode `node --env-file=.env.local scripts/init-db.mjs`.
4. `npm run dev` → http://localhost:3000 (crie uma conta em /login).

## Estrutura
- `schema.sql` — tabelas usuarios, entidades, movimentos, metas
- `app/(app)/` — Home (entidades + feed), Dashboard, Metas (protegidas pela barra lateral)
- `app/api/` — rotas REST (auth, me, entidades, movimentos, metas); todas filtram pelo usuário da sessão
- `components/` — Shell (barra lateral), modais, perfil

## Regras de negócio
- ENTRADA soma e SAÍDA subtrai do saldo da entidade (em transação); excluir um movimento reverte o saldo.
- Movimentos não têm edição (sem UPDATE), como pedido.
- Fotos são só links (VARCHAR) para imagens no Cloudinary.
