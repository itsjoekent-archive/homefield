import React from 'react';
import { useApplicationContext } from 'ApplicationContext';

export default function useApiFetch(authenticate = true, contentType = 'application/json', circuitBreaker = true) {
  const { authentication: { token } } = useApplicationContext();

  const [hasTrippedCircuit, setHasTrippedCircuit] = React.useState({});

  async function _fetch(_path, _options = {}) {
    const path = `${process.env.REACT_APP_API_URL}${_path}`;
    const options = ({ ...(_options || {}) });

    if (!options.headers) {
      options.headers = {};
    }

    if (contentType) {
      options.headers['Content-Type'] = contentType;
    }

    if (authenticate && token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(path, options);
  }

  _fetch.hasTrippedCircuit = (id) => hasTrippedCircuit[id] || false;
  _fetch.setHasTrippedCircuit = (id) => setHasTrippedCircuit((state) => ({ ...state, [id]: true }));

  return _fetch;
}
