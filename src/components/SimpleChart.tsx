import React from 'react';

interface ChartDataPoint {
  [key: string]: string | number;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  color?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({ data, xKey, yKey, color = '#c22169' }) => {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-hover-color)' }}>Sem dados para exibir</div>;
  }

  const maxValue = Math.max(...data.map(item => Number(item[yKey])));
  const minValue = Math.min(...data.map(item => Number(item[yKey])));
  const range = maxValue - minValue || 1;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Área do gráfico */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-around',
        gap: '8px',
        padding: '20px 10px',
        position: 'relative'
      }}>
        {/* Linhas de grade horizontais */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              style={{
                width: '100%',
                height: '1px',
                background: 'var(--border-color)',
                opacity: 0.3
              }}
            />
          ))}
        </div>

        {/* Barras do gráfico */}
        {data.map((item, index) => {
          const value = Number(item[yKey]);
          const heightPercentage = ((value - minValue) / range) * 100;
          
          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                zIndex: 1
              }}
            >
              {/* Valor acima da barra */}
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--primary-color)',
                marginBottom: '4px'
              }}>
                {value}
              </div>
              
              {/* Barra */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '60px',
                  height: `${heightPercentage}%`,
                  minHeight: '4px',
                  background: `linear-gradient(180deg, ${color}, ${color}dd)`,
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title={`${item[xKey]}: ${value}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Efeito de brilho */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)',
                  borderRadius: '8px 8px 0 0'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels do eixo X */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '2px solid var(--border-color)'
      }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--primary-hover-color)',
              fontWeight: '600'
            }}
          >
            {item[xKey]}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente alternativo para gráfico de rosquinha (mantido para compatibilidade)
interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface DoughnutChartProps {
  data: ChartData[];
  title: string;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart" id="doughnut-chart">
      <h2>{title}</h2>
      <div style={{ 
        width: '120px', 
        height: '120px', 
        borderRadius: '50%', 
        background: `conic-gradient(${data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const prevPercentage = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0);
          return `${item.color} ${prevPercentage}% ${prevPercentage + percentage}%`;
        }).join(', ')})`,
        margin: '20px auto',
        position: 'relative' as const
      }}>
        <div style={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--card-bg-color)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          color: 'var(--primary-color)'
        }}>
          Total<br/>{total}
        </div>
      </div>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <span style={{ 
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: item.color,
              borderRadius: '50%',
              marginRight: '8px'
            }}></span>
            {item.label}: <span className="percentage">{Math.round((item.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
