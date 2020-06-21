//npm install axios
//permite uso de rota base
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3333'
});

export default api;