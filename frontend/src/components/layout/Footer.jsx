import React from 'react';

function Footer() {
  return (
    <footer className="footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
      © {new Date().getFullYear()} Constructora Del Valle S.A. — Sistema Integrado de Control de Inventario y Detección de Fugas v2.4
    </footer>
  );
}

export default Footer;

