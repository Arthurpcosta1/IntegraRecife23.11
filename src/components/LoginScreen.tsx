import React, { useState } from 'react';
import { User, Lock, Mail, UserCog, MapPin, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface LoginScreenProps {
  onLogin: (user: { email: string; name: string; type: 'admin' | 'cidadao'; accessToken?: string }) => void;
}

const CATEGORIAS_DISPONIVEIS = [
  { id: 'Música', nome: 'Música', emoji: '🎵' },
  { id: 'Teatro', nome: 'Teatro', emoji: '🎭' },
  { id: 'Gastronomia', nome: 'Gastronomia', emoji: '🍽️' },
  { id: 'Festival', nome: 'Festival', emoji: '🎉' },
  { id: 'Esportes', nome: 'Esportes', emoji: '⚽' },
  { id: 'Arte', nome: 'Arte', emoji: '🎨' }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'cidadao'>('cidadao'); // Sempre cidadão no cadastro público
  const [loading, setLoading] = useState(false);
  const [interesses, setInteresses] = useState<string[]>([]);
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validar força da senha (mínimo 6 caracteres como solicitado)
  const validatePassword = (password: string): string => {
    if (password.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (!isLogin) {
      // Cadastro
      // Validar senha
      const passwordValidation = validatePassword(formData.password);
      if (passwordValidation) {
        setPasswordError(passwordValidation);
        alert(passwordValidation);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }

      if (!formData.name) {
        alert('Por favor, preencha seu nome!');
        return;
      }

      if (userType === 'cidadao' && interesses.length === 0) {
        alert('Por favor, selecione pelo menos um interesse!');
        return;
      }

      setLoading(true);
      try {
        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nome: formData.name,
              tipo: userType
            }
          }
        });

        if (authError) {
          console.error('❌ Erro ao criar usuário no Auth:', authError);
          alert('Erro ao cadastrar: ' + authError.message);
          setLoading(false);
          return;
        }

        if (!authData.user) {
          alert('Erro ao criar usuário. Por favor, tente novamente.');
          setLoading(false);
          return;
        }

        console.log('✅ Usuário criado no Auth:', authData.user.id);

        // Criar registro na tabela usuarios
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            email: formData.email,
            nome: formData.name,
            tipo: userType,
            interesses: userType === 'cidadao' ? interesses : [],
            avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400'
          });

        if (dbError) {
          console.error('❌ Erro ao criar usuário no banco:', dbError);
          // Não mostra erro ao usuário pois o Auth foi criado com sucesso
          // O usuário será criado na tabela no primeiro login
        } else {
          console.log('✅ Usuário criado na tabela usuarios');
        }

        alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
        setIsLogin(true);
        setFormData({ ...formData, password: '', confirmPassword: '' });
        setInteresses([]);
      } catch (error) {
        console.error('❌ Erro ao cadastrar:', error);
        alert('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    } else {
      // Login
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
          onLogin({
            email: authData.user.email || formData.email,
            name: userMetadata?.nome || formData.email.split('@')[0],
            type: userMetadata?.tipo || 'cidadao',
            accessToken: authData.session.access_token
          });
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao conectar com o servidor');
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

  const toggleInteresse = (categoria: string) => {
    setInteresses(prev => 
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
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
              {!isLogin && formData.password && (
                <div className="password-requirements" style={{
                  marginTop: '8px',
                  padding: '10px',
                  background: 'var(--card-bg-color)',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ marginBottom: '6px', fontWeight: '600', color: 'var(--primary-color)' }}>
                    Requisitos da senha:
                  </div>
                  <div style={{ 
                    color: formData.password.length >= 6 ? '#4a920f' : 'var(--primary-color)', 
                    opacity: formData.password.length >= 6 ? 1 : 0.6 
                  }}>
                    {formData.password.length >= 6 ? '✓' : '○'} Mínimo 6 caracteres
                  </div>
                </div>
              )}
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
              <>
                {/* Tipo de conta fixado como Cidadão - Admins são criados internamente */}
                <div className="user-type-info" style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(194, 33, 105, 0.08), rgba(194, 33, 105, 0.12))',
                  borderRadius: '8px',
                  border: '2px solid rgba(194, 33, 105, 0.2)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <User size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--primary-color)', marginBottom: '4px' }}>
                        Conta de Cidadão
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', opacity: 0.8 }}>
                        Explore eventos, roteiros turísticos e conecte-se com o Recife
                      </div>
                    </div>
                  </div>
                </div>

                <div className="interesses-selector">
                  <label>Quais eventos você gostaria de receber notificações?</label>
                  <p className="selector-description">Selecione seus interesses</p>
                  <div className="interesses-grid-login">
                    {CATEGORIAS_DISPONIVEIS.map((categoria) => (
                      <button
                        key={categoria.id}
                        type="button"
                        className={`interesse-chip ${interesses.includes(categoria.id) ? 'selected' : ''}`}
                        onClick={() => toggleInteresse(categoria.id)}
                      >
                        <span className="chip-emoji">{categoria.emoji}</span>
                        <span className="chip-nome">{categoria.nome}</span>
                      </button>
                    ))}
                  </div>
                  {interesses.length > 0 && (
                    <p className="interesses-count">{interesses.length} selecionado{interesses.length > 1 ? 's' : ''}</p>
                  )}
                </div>
              </>
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