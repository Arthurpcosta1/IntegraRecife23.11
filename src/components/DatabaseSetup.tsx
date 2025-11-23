import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Loader2, Copy, Check, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

type SchemaType = 'chat' | 'completo';

export const DatabaseSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [schemaType, setSchemaType] = useState<SchemaType>('completo');

  const SQL_SCRIPT_CHAT = `-- =====================================================
-- TABELAS DO SISTEMA DE CHAT/FÓRUM
-- Plataforma de Eventos do Recife
-- =====================================================

-- Tabela de Canais de Chat
CREATE TABLE IF NOT EXISTS canais_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('geral', 'evento', 'projeto')),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Mensagens do Chat
CREATE TABLE IF NOT EXISTS mensagens_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id UUID NOT NULL REFERENCES canais_chat(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  usuario_nome TEXT NOT NULL,
  usuario_avatar TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  fixada BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mensagens_canal_id ON mensagens_chat(canal_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_criado_em ON mensagens_chat(criado_em);
CREATE INDEX IF NOT EXISTS idx_canais_tipo ON canais_chat(tipo);

-- Ativar RLS nas tabelas
ALTER TABLE canais_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_chat ENABLE ROW LEVEL SECURITY;

-- Políticas para canais_chat
DROP POLICY IF EXISTS "Todos podem ler canais" ON canais_chat;
CREATE POLICY "Todos podem ler canais" 
  ON canais_chat FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar canais" ON canais_chat;
CREATE POLICY "Todos podem criar canais" 
  ON canais_chat FOR INSERT 
  WITH CHECK (true);

-- Políticas para mensagens_chat
DROP POLICY IF EXISTS "Todos podem ler mensagens" ON mensagens_chat;
CREATE POLICY "Todos podem ler mensagens" 
  ON mensagens_chat FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar mensagens" ON mensagens_chat;
CREATE POLICY "Todos podem criar mensagens" 
  ON mensagens_chat FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario pode deletar sua mensagem" ON mensagens_chat;
CREATE POLICY "Usuario pode deletar sua mensagem" 
  ON mensagens_chat FOR DELETE 
  USING (true);

-- Dados iniciais - Canais Padrão
INSERT INTO canais_chat (nome, descricao, tipo) VALUES
  ('geral', 'Discussões gerais sobre eventos do Recife', 'geral'),
  ('festival-rec-beat', 'Tudo sobre o Festival Rec-Beat 2025', 'evento'),
  ('projetos-culturais', 'Discussões sobre projetos conjuntos', 'projeto'),
  ('carnaval-olinda', 'Planejamento e dicas para o Carnaval', 'evento'),
  ('gastronomia', 'Eventos gastronômicos e culinária', 'geral')
ON CONFLICT DO NOTHING;`;

  const SQL_SCRIPT_INFO_COMPLETO = `-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS
-- Plataforma Integra Recife - Todas as Tabelas
-- =====================================================
--
-- ⚠️ ESTE SCRIPT É MUITO GRANDE PARA EXIBIR AQUI
-- 
-- O arquivo completo contém:
-- - 10 tabelas: usuarios, eventos, favoritos, avaliacoes, 
--   projetos, membros_projeto, canais_chat, mensagens_chat,
--   notificacoes, inscricoes
-- - Índices para otimização
-- - Políticas RLS (Row Level Security)
-- - Triggers automáticos
-- - Views para relatórios
-- - Dados iniciais
--
-- 📁 LOCALIZAÇÃO DO ARQUIVO:
--    /database/schema-completo.sql
--
-- 📖 DOCUMENTAÇÃO COMPLETA:
--    /documentacao/ESTRUTURA_BANCO_COMPLETA.md
--
-- =====================================================
-- COMO USAR:
-- =====================================================
-- 1. Abra o arquivo /database/schema-completo.sql
-- 2. Copie todo o conteúdo
-- 3. Cole no SQL Editor do Supabase
-- 4. Execute o script
-- =====================================================`;

  const currentScript = schemaType === 'chat' ? SQL_SCRIPT_CHAT : SQL_SCRIPT_INFO_COMPLETO;
  const isCompleteTooLarge = schemaType === 'completo';

  const copySqlScript = async () => {
    if (isCompleteTooLarge) {
      toast.error('O schema completo é muito grande. Use o arquivo /database/schema-completo.sql');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(currentScript);
      setCopied(true);
      toast.success('SQL copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar SQL');
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      // Testar se as tabelas existem
      const { data: canais, error: canaisError } = await supabase
        .from('canais_chat')
        .select('id, nome')
        .limit(10);

      const { data: mensagens, error: mensagensError } = await supabase
        .from('mensagens_chat')
        .select('id')
        .limit(10);

      if (canaisError || mensagensError) {
        setStatus('error');
        setMessage(`❌ Tabelas ainda não foram criadas no banco de dados.\n\n` +
          `Erro: ${canaisError?.message || mensagensError?.message}\n\n` +
          `Por favor, execute o script SQL no console do Supabase primeiro.`);
        toast.error('Tabelas não encontradas');
      } else {
        setStatus('success');
        const canaisCount = canais?.length || 0;
        const mensagensCount = mensagens?.length || 0;
        
        let msg = `✅ Banco de dados configurado com sucesso!\n\n`;
        msg += `📊 Status:\n`;
        msg += `  • ${canaisCount} canais encontrados\n`;
        msg += `  • ${mensagensCount} mensagens encontradas\n\n`;
        
        if (canaisCount === 0) {
          msg += `⚠️ Nenhum canal foi encontrado. Execute a parte de "DADOS INICIAIS" do script SQL.`;
        } else {
          msg += `🎉 Sistema de chat pronto para uso!`;
        }
        
        setMessage(msg);
        toast.success('Conexão com banco OK!');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erro ao conectar com o banco:\n\n${error.message}`);
      toast.error('Erro ao conectar com banco');
    } finally {
      setLoading(false);
    }
  };

  const createChannelsDirectly = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      // Tentar inserir os canais padrão diretamente
      const canais = [
        { nome: 'geral', descricao: 'Discussões gerais sobre eventos do Recife', tipo: 'geral' },
        { nome: 'festival-rec-beat', descricao: 'Tudo sobre o Festival Rec-Beat 2025', tipo: 'evento' },
        { nome: 'projetos-culturais', descricao: 'Discussões sobre projetos conjuntos', tipo: 'projeto' },
        { nome: 'carnaval-olinda', descricao: 'Planejamento e dicas para o Carnaval', tipo: 'evento' },
        { nome: 'gastronomia', descricao: 'Eventos gastronômicos e culinária', tipo: 'geral' }
      ];

      const { error } = await supabase
        .from('canais_chat')
        .insert(canais);

      if (error) {
        throw new Error(error.message);
      }

      setStatus('success');
      setMessage(`✅ Canais criados com sucesso!\n\n5 canais padrão foram adicionados ao banco de dados.`);
      toast.success('Canais criados com sucesso!');
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erro ao criar canais:\n\n${error.message}\n\n` +
        `Certifique-se de que as tabelas foram criadas primeiro usando o script SQL.`);
      toast.error('Erro ao criar canais');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Database size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl">Configuração do Banco de Dados</h2>
            <p className="text-gray-600 dark:text-gray-400">Escolha o schema a ser criado</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Seletor de Schema */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSchemaType('completo')}
              className={`p-4 rounded-lg border-2 transition-all ${
                schemaType === 'completo'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Database size={20} className={schemaType === 'completo' ? 'text-blue-600' : 'text-gray-500'} />
                <h3 className="font-semibold">Schema Completo</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                10 tabelas com todas as funcionalidades (Recomendado)
              </p>
            </button>

            <button
              onClick={() => setSchemaType('chat')}
              className={`p-4 rounded-lg border-2 transition-all ${
                schemaType === 'chat'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} className={schemaType === 'chat' ? 'text-blue-600' : 'text-gray-500'} />
                <h3 className="font-semibold">Apenas Chat</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                2 tabelas para sistema de chat/fórum
              </p>
            </button>
          </div>

          {/* Instruções */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="flex items-center gap-2 mb-3">
              📋 Como configurar:
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-4 list-decimal">
              {schemaType === 'completo' ? (
                <>
                  <li>Abra o arquivo <code className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded">/database/schema-completo.sql</code></li>
                  <li>Copie TODO o conteúdo do arquivo</li>
                  <li>Acesse o <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dashboard do Supabase</a></li>
                  <li>Vá em: <strong>SQL Editor</strong> → <strong>New Query</strong></li>
                  <li>Cole o script SQL e clique em <strong>Run</strong></li>
                  <li>Volte aqui e clique em "Testar Conexão"</li>
                </>
              ) : (
                <>
                  <li>Copie o script SQL abaixo clicando no botão "Copiar SQL"</li>
                  <li>Acesse o <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dashboard do Supabase</a></li>
                  <li>Vá em: <strong>SQL Editor</strong> → <strong>New Query</strong></li>
                  <li>Cole o script SQL e clique em <strong>Run</strong></li>
                  <li>Volte aqui e clique em "Testar Conexão"</li>
                </>
              )}
            </ol>
          </div>

          {/* Documentação do Schema Completo */}
          {schemaType === 'completo' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="flex items-center gap-2 mb-3">
                📚 Documentação Completa:
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Para entender todas as tabelas, campos e relacionamentos, consulte:
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-green-600" />
                  <span className="font-mono text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">/documentacao/ESTRUTURA_BANCO_COMPLETA.md</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-green-600" />
                  <span className="font-mono text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">/database/schema-completo.sql</span>
                </div>
              </div>
            </div>
          )}

          {/* SQL Script */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                {schemaType === 'completo' ? 'Informações do Schema Completo' : 'Script SQL'}
              </h3>
              {!isCompleteTooLarge && (
                <button
                  onClick={copySqlScript}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copiar SQL
                    </>
                  )}
                </button>
              )}
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto border border-gray-700">
              <code>{currentScript}</code>
            </pre>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              status === 'success' 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : status === 'error'
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
            }`}>
              <div className="flex items-start gap-3">
                {status === 'success' && <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />}
                {status === 'error' && <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />}
                <p className="text-sm whitespace-pre-wrap font-mono">{message}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={testConnection}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Testar Conexão
                </>
              )}
            </button>

            <button
              onClick={createChannelsDirectly}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin mx-auto" />
              ) : (
                'Criar Canais Padrão'
              )}
            </button>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Importante:</strong> Execute o script SQL no Supabase apenas uma vez. 
              O botão "Criar Canais Padrão" deve ser usado apenas se os canais não foram criados automaticamente pelo script.
            </p>
          </div>

          {/* O que será criado */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="flex items-center gap-2 mb-2">
              📦 {schemaType === 'completo' ? 'O que será criado (Schema Completo):' : 'O que será criado (Chat):'}
            </h3>
            {schemaType === 'completo' ? (
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 ml-4">
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">usuarios</code> (usuários da plataforma)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">eventos</code> (eventos do Recife)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">favoritos</code> (eventos favoritados)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">avaliacoes</code> (avaliações de eventos)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">projetos</code> (projetos conjuntos)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">membros_projeto</code> (equipes dos projetos)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">canais_chat</code> (canais de discussão)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">mensagens_chat</code> (mensagens dos usuários)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">notificacoes</code> (notificações em tempo real)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">inscricoes</code> (inscrições em eventos)</li>
                <li>• Índices para otimização de consultas</li>
                <li>• Políticas RLS para segurança</li>
                <li>• Triggers para atualização automática</li>
                <li>• Views para relatórios</li>
                <li>• 5 canais padrão de chat</li>
              </ul>
            ) : (
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 ml-4">
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">canais_chat</code> (canais de discussão)</li>
                <li>• Tabela <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">mensagens_chat</code> (mensagens dos usuários)</li>
                <li>• Índices para melhor performance nas consultas</li>
                <li>• Políticas RLS para segurança dos dados</li>
                <li>• 5 canais padrão: geral, festival-rec-beat, projetos-culturais, carnaval-olinda, gastronomia</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};