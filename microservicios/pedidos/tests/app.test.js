const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');
const axios = require('axios');

// Simulamos la base de datos
jest.mock('../src/db', () => ({
    query: jest.fn()
}));

// Simulamos las peticiones de red
jest.mock('axios');

describe('API de Pedidos', () => {
    it('Debería responder correctamente el endpoint /health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('estado', 'ok');
    });

    it('Debería obtener una lista de pedidos (GET /pedidos)', async () => {
        // Simulamos la respuesta de la base de datos
        pool.query.mockResolvedValue({ 
            rows: [{ id: 1, usuario_id: 1, producto_id: 2, cantidad: 5 }] 
        });
        
        const res = await request(app).get('/pedidos');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].cantidad).toBe(5);
    });
});
