import React, { useState, useEffect } from 'react';
import { Users, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'cidadao';
  criado_em: string;
}

interface UserManagementProps {
  accessToken?: string;
}

export const UserManagement: React.FC<UserManagementProps> = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      
      // Buscar usuários diretamente da tabela usuarios do Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao carregar usuários: ' + error.message);
        return;
      }

      if (data) {
        setUsuarios(data);
        console.log('✅ Usuários carregados:', data.length);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao conectar com o banco de dados');
    } finally {
      setCarregando(false);
    }
  };

  const excluirUsuario = async (usuarioId: string, nomeUsuario: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nomeUsuario}"?\n\nEsta ação não pode ser desfeita e todos os dados do usuário serão permanentemente removidos.`)) {
      return;
    }

    try {
      setExcluindo(usuarioId);
      
      // Excluir usuário da tabela usuarios
      // O CASCADE no banco vai deletar automaticamente avaliacoes, favoritos, etc.
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuarioId);

      if (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário: ' + error.message);
        return;
      }

      alert('✅ Usuário excluído com sucesso!');
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao conectar com o banco de dados');
    } finally {
      setExcluindo(null);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <div>
          <h2 className="management-title">
            <Users size={24} />
            Gerenciamento de Usuários
          </h2>
          <p className="management-subtitle">
            Visualize e gerencie todos os usuários cadastrados na plataforma
          </p>
        </div>
        <button 
          className="refresh-btn"
          onClick={carregarUsuarios}
          disabled={carregando}
        >
          <RefreshCw size={18} className={carregando ? 'spinning' : ''} />
          Atualizar
        </button>
      </div>

      {carregando ? (
        <div className="loading-message">
          <RefreshCw size={32} className="spinning" />
          <p>Carregando usuários...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="empty-message">
          Nenhum usuário cadastrado ainda.
        </div>
      ) : (
        <>
          <div className="users-stats">
            <div className="stat-item">
              <span className="stat-label">Total de usuários:</span>
              <span className="stat-value">{usuarios.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Administradores:</span>
              <span className="stat-value">{usuarios.filter(u => u.tipo === 'admin').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cidadãos:</span>
              <span className="stat-value">{usuarios.filter(u => u.tipo === 'cidadao').length}</span>
            </div>
          </div>

          <div className="alert-warning">
            <AlertTriangle size={20} />
            <div>
              <strong>Atenção:</strong> A exclusão de um usuário é permanente e irá remover todos os seus dados, incluindo avaliações e comentários.
            </div>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Data de Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`tipo-badge ${usuario.tipo}`}>
                        {usuario.tipo === 'admin' ? 'Administrador' : 'Cidadão'}
                      </span>
                    </td>
                    <td>{formatarData(usuario.criado_em)}</td>
                    <td>
                      <button
                        className="delete-user-btn"
                        onClick={() => excluirUsuario(usuario.id, usuario.nome)}
                        disabled={excluindo === usuario.id}
                      >
                        {excluindo === usuario.id ? (
                          <>
                            <RefreshCw size={16} className="spinning" />
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Excluir
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};