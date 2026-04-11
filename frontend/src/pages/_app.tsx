import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useEffect } from 'react';
import { initializeAuth } from '../store/slices/authSlice';
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}

export default MyApp;
