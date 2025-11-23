-- =====================================================
-- CORREÇÃO DE TIPOS DE USUÁRIOS INVÁLIDOS
-- Corrige usuários com tipos diferentes de 'admin' ou 'cidadao'
-- =====================================================

-- 1. VERIFICAR USUÁRIOS COM TIPOS INVÁLIDOS
SELECT 
  id,
  email,
  nome,
  tipo,
  CASE 
    WHEN tipo NOT IN ('admin', 'cidadao') THEN '❌ INVÁLIDO'
    ELSE '✅ OK'
  END as status
FROM usuarios
ORDER BY 
  CASE WHEN tipo NOT IN ('admin', 'cidadao') THEN 0 ELSE 1 END,
  email;

-- 2. CONTAR USUÁRIOS POR TIPO
SELECT 
  tipo,
  COUNT(*) as quantidade,
  CASE 
    WHEN tipo NOT IN ('admin', 'cidadao') THEN '❌ Tipo inválido - precisa correção'
    ELSE '✅ OK'
  END as status
FROM usuarios
GROUP BY tipo
ORDER BY tipo;

-- 3. CORRIGIR USUÁRIOS COM TIPO INVÁLIDO
-- Converter tipos inválidos para 'cidadao'
UPDATE usuarios
SET tipo = 'cidadao',
    atualizado_em = NOW()
WHERE tipo NOT IN ('admin', 'cidadao');

-- 4. VERIFICAR SE FOI CORRIGIDO
SELECT 
  'Após Correção' as momento,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN tipo = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN tipo = 'cidadao' THEN 1 END) as cidadaos,
  COUNT(CASE WHEN tipo NOT IN ('admin', 'cidadao') THEN 1 END) as invalidos
FROM usuarios;

-- Resultado esperado:
-- ✅ invalidos = 0
-- ✅ todos os usuários devem ter tipo 'admin' ou 'cidadao'

-- 5. LISTA FINAL DE USUÁRIOS
SELECT 
  email,
  nome,
  tipo,
  criado_em
FROM usuarios
ORDER BY criado_em DESC
LIMIT 10;

-- =====================================================
-- OBSERVAÇÕES
-- =====================================================

/*
TIPOS VÁLIDOS:
- 'admin'    - Administradores do sistema
- 'cidadao'  - Usuários comuns (cidadãos)

TIPOS INVÁLIDOS ENCONTRADOS ANTERIORMENTE:
- 'usuario'  - ❌ NÃO EXISTE NO SCHEMA
- Qualquer outro valor será convertido para 'cidadao'

IMPORTANTE:
- O check constraint permite apenas 'admin' e 'cidadao'
- Qualquer tentativa de insert com outro valor resultará em erro
*/
