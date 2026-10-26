const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

// ¡Aquí está la magia! Simulamos la base de datos
jest.mock('../src/db', () => ({
    query: jest.fn()
}));

describe('API de Usuarios', () => {
    it('Debería responder correctamente el endpoint /health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('estado', 'ok');
    });

    it('Debería obtener una lista de usuarios (GET /usuarios)', async () => {
        // Le decimos a la prueba qué datos falsos devolver cuando consulte la BD
        pool.query.mockResolvedValue({ 
            rows: [{ id: 1, nombre: 'Jhojan Tester', email: 'tester@correo.com' }] 
        });
        
        const res = await request(app).get('/usuarios');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].nombre).toBe('Jhojan Tester');
    });
});
