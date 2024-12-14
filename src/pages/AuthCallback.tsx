import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/'); // or wherever you want to redirect after successful auth
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  return <div>Loading...</div>;
} 