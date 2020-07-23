import React from 'react';

export default function useClickOutside(onClickOutside) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClickOutside();
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClickOutside]);

  return containerRef;
}
