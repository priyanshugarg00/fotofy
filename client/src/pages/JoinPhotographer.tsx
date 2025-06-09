import { useEffect } from 'react';
import { useLocation } from 'wouter';

const JoinPhotographer = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation('/photographer-signup');
  }, [setLocation]);

  return null; // Redirect handled in useEffect
};

export default JoinPhotographer;