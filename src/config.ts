// En producción usamos ruta relativa '' para aprovechar el proxy de Vercel y evitar Mixed Content.
// En desarrollo usamos la URL directa del Load Balancer.
export const API_BASE_URL = import.meta.env.PROD
    ? ''
    : 'http://drawsync-39121855.us-east-1.elb.amazonaws.com';
