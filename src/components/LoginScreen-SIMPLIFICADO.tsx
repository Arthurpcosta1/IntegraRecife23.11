import React, { useState } from 'react';
import { User, Lock, Mail, UserCog, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface LoginScreenProps {
  onLogin: (user: { email: string; name: string; type: 'admin' | 'cidadao'; accessToken?: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'cidadao'>('cidadao');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (!isLogin) {
      // Cadastro usando Supabase Auth diretamente
      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }

      if (!formData.name) {
        alert('Por favor, preencha seu nome!');
        return;
      }

      setLoading(true);
      try {
        // Criar usuário no Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nome: formData.name,
              tipo: userType
            }
          }
        });

        if (signUpError) {
          console.error('Erro no cadastro:', signUpError);
          alert('Erro ao cadastrar: ' + signUpError.message);
          setLoading(false);
          return;
        }

        if (authData.user) {
          // Salvar dados adicionais na tabela usuarios
          const { error: insertError } = await supabase
            .from('usuarios')
            .upsert({
              id: authData.user.id,
              email: formData.email,
              nome: formData.name,
              tipo: userType
            }, {
              onConflict: 'id'
            });

          if (insertError) {
            console.error('Erro ao salvar dados do usuário:', insertError);
            alert('Aviso: Cadastro realizado mas dados adicionais não foram salvos. Erro: ' + insertError.message);
          }

          alert('Cadastro realizado com sucesso! Faça login para continuar.');
          setIsLogin(true);
          setFormData({ ...formData, password: '', confirmPassword: '' });
        }
      } catch (error) {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao cadastrar. Verifique sua conexão e tente novamente.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login usando Supabase Auth diretamente
      setLoading(true);
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          console.error('Erro no login:', error);
          alert('Erro ao fazer login: ' + error.message);
          setLoading(false);
          return;
        }

        if (authData.session) {
          const userMetadata = authData.user.user_metadata;
          
          // Buscar dados adicionais da tabela usuarios
          const { data: userData } = await supabase
            .from('usuarios')
            .select('nome, tipo')
            .eq('id', authData.user.id)
            .single();

          onLogin({
            email: authData.user.email || formData.email,
            name: userData?.nome || userMetadata?.nome || formData.email.split('@')[0],
            type: userData?.tipo || userMetadata?.tipo || 'cidadao',
            accessToken: authData.session.access_token
          });
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao conectar. Verifique se as tabelas do banco foram criadas.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <MapPin size={32} />
              </div>
              <h1>Integra Recife</h1>
            </div>
            <p className="login-subtitle">
              Conectando você aos eventos e cultura do Recife
            </p>
          </div>

          <div className="auth-tabs">
            <button 
              className={isLogin ? 'active' : ''}
              onClick={() => setIsLogin(true)}
            >
              Entrar
            </button>
            <button 
              className={!isLogin ? 'active' : ''}
              onClick={() => setIsLogin(false)}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  <User size={18} />
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={18} />
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            {!isLogin && (
              <div className="user-type-selector">
                <label>Tipo de Conta:</label>
                <div className="type-options">
                  <button
                    type="button"
                    className={`type-option ${userType === 'cidadao' ? 'active' : ''}`}
                    onClick={() => setUserType('cidadao')}
                  >
                    <User size={24} />
                    <span>Cidadão</span>
                    <small>Explorar e participar de eventos</small>
                  </button>
                  <button
                    type="button"
                    className={`type-option ${userType === 'admin' ? 'active' : ''}`}
                    onClick={() => setUserType('admin')}
                  >
                    <UserCog size={24} />
                    <span>Administrador</span>
                    <small>Criar e gerenciar eventos</small>
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="toggle-auth"
              >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-info">
          <h2>Descubra o Recife</h2>
          <ul>
            <li>🎭 Eventos culturais e festivais</li>
            <li>🗺️ Roteiros turísticos temáticos</li>
            <li>⭐ Avaliações e recomendações</li>
            <li>📱 Notificações personalizadas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};