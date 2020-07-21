import { useApplicationContext } from 'ApplicationContext';

export default function useApiFetch(authenticate = true, contentType = 'application/json') {
  const { authentication: { token } } = useApplicationContext();

  async function _fetch(_path, _options = {}) {
    const path = `${process.env.REACT_APP_API_URL}${_path}`;
    const options = ({ ...(_options || {}) });

    if (!options.headers) {
      options.headers = {};
    }

    if (contentType) {
      options.headers['Content-Type'] = contentType;
    }

    if (authenticate) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(path, options);
  }

  return _fetch;
}
