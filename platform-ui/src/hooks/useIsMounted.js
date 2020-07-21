import React from 'react';

export default function useIsMounted() {
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => isMounted.current = false;
  }, []);

  return isMounted.current;  
}
