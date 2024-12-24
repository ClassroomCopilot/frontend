import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('session', session);
        navigate('/'); // or wherever you want to redirect after successful auth
      } else {
        console.log('no session');
        navigate('/login');
      }
    });
  }, [navigate]);

  return <div>Loading...</div>;
} 