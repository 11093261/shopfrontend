import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Store } from './Store.js' // Remove if you don't use Redux
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Remove any BrowserRouter/Router wrapper here */}
    <Provider store={Store}> {/* Keep only if you use Redux, otherwise remove this too */}
      <App />
    </Provider>
  </React.StrictMode>,
)