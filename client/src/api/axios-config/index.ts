import axios from 'axios';
import { Environment } from './environment';
import { errorInterceptor, responseInterceptor } from './interceptors/ResponseInterceptor';
import { requestInterceptor } from './interceptors/RequestInterceptor';

const Api = axios.create({
  baseURL: Environment.URL_BASE,
  withCredentials: true, // garante que os cookies sejam enviados/recebidos
});

// Registra os interceptors
Api.interceptors.request.use(requestInterceptor);
Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error)
);

export { Api };
