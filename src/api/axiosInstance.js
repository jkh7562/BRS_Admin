import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080/', //스프링부트 URL
    /*headers: {
        'Content-Type': 'application/json',
    },*/
});