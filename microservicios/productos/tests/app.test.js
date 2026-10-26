const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

jest.mock('../src/db', () => ({
    query: jest.fn()
}));

describe('API de Productos', () => {
    it('Debería responder correctamente el endpoint /health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('estado', 'ok');
    });

    it('Debería obtener una lista de productos (GET /productos)', async () => {
        pool.query.mockResolvedValue({ 
            rows: [{ id: 1, nombre: 'Teclado Tester', precio: 50.00 }] 
        });

        const res = await request(app).get('/productos');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].nombre).toBe('Teclado Tester');
    });
});
