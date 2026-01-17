import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './style.css';

console.log('🚀 Popup Main Script Started');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('❌ Failed to mount React App:', error);
  const root = document.getElementById('root');
  if (root) {
    // Safe DOM manipulation to avoid XSS
    root.textContent = ''; // Clear existing content

    const container = document.createElement('div');
    Object.assign(container.style, {
      color: 'red',
      padding: '20px',
      fontSize: '14px',
      whiteSpace: 'pre-wrap', // Improve stack trace readability
      wordBreak: 'break-word',
    });

    const title = document.createElement('h1');
    title.textContent = 'Something went wrong';

    const messagePre = document.createElement('pre');
    messagePre.style.marginTop = '10px';
    messagePre.style.fontWeight = 'bold';
    messagePre.textContent = error instanceof Error ? error.message : String(error);

    const stackPre = document.createElement('pre');
    stackPre.style.marginTop = '10px';
    stackPre.style.fontSize = '12px';
    stackPre.style.opacity = '0.8';
    stackPre.textContent = error instanceof Error ? error.stack || '' : '';

    const footer = document.createElement('p');
    footer.style.marginTop = '20px';
    footer.textContent = 'Check console for more details.';

    container.appendChild(title);
    container.appendChild(messagePre);
    container.appendChild(stackPre);
    container.appendChild(footer);

    root.appendChild(container);
  }
}
