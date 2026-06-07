import { Component } from 'react';

function isChunkLoadError(error) {
  return (
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Loading chunk') ||
    error?.name === 'ChunkLoadError'
  );
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem('_chunk_reload');
      if (!alreadyReloaded) {
        sessionStorage.setItem('_chunk_reload', '1');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#16181d',
            color: '#e2e8f0',
            fontFamily: 'Inter, sans-serif',
            padding: '24px',
            textAlign: 'center',
            gap: '16px',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #3f4253', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px' }}>Atualizando...</p>
          </div>
        );
      }

      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#16181d',
          color: '#e2e8f0',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
          textAlign: 'center',
          gap: '16px',
        }}>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Algo deu errado</h2>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px', maxWidth: '320px' }}>
            Ocorreu um erro inesperado. Tente recarregar a página para continuar jogando.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#6aaa64',
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
