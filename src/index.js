import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store'; // ✅ Redux Store 추가
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        {/* ✅ Redux Provider 추가 */}
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);

// ✅ 성능 측정
reportWebVitals();
