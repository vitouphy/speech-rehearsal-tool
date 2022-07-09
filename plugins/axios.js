export default ({ $axios, env }) => {
    $axios.onRequest(config => {
        config.headers['x-api-key'] = env.serverApiKey; 
    });
}