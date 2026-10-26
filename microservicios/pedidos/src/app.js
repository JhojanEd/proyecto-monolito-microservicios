const express = require('express');
const pool = require('./db');
const axios = require('axios');
const app = express();

app.use(express.json());

const USUARIOS_URL = process.env.USUARIOS_URL;
const PRODUCTOS_URL = process.env.PRODUCTOS_URL;

app.get('/health', (req, res) => {
    res.json({ estado: 'ok', servicio: 'pedidos' });
});

app.get('/pedidos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pedidos');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar pedidos' });
    }
});

app.post('/pedidos', async (req, res) => {
    try {
        const { usuario_id, producto_id, cantidad } = req.body;

        const usuariosRes = await axios.get(USUARIOS_URL);
        const usuarioValido = usuariosRes.data.find(u => u.id === parseInt(usuario_id));
        if (!usuarioValido) return res.status(400).json({ error: 'El usuario no existe' });

        const productosRes = await axios.get(PRODUCTOS_URL);
        const productoValido = productosRes.data.find(p => p.id === parseInt(producto_id));
        if (!productoValido) return res.status(400).json({ error: 'El producto no existe' });

        const result = await pool.query(
            'INSERT INTO pedidos (usuario_id, producto_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
            [usuario_id, producto_id, cantidad]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear pedido' });
    }
});

app.put('/pedidos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id, producto_id, cantidad } = req.body;

        const usuariosRes = await axios.get(USUARIOS_URL);
        if (!usuariosRes.data.find(u => u.id === parseInt(usuario_id))) {
            return res.status(400).json({ error: 'El usuario no existe' });
        }

        const productosRes = await axios.get(PRODUCTOS_URL);
        if (!productosRes.data.find(p => p.id === parseInt(producto_id))) {
            return res.status(400).json({ error: 'El producto no existe' });
        }

        const result = await pool.query(
            'UPDATE pedidos SET usuario_id = $1, producto_id = $2, cantidad = $3 WHERE id = $4 RETURNING *',
            [usuario_id, producto_id, cantidad, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
});

app.delete('/pedidos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM pedidos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json({ mensaje: 'Pedido eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar pedido' });
    }
});

module.exports = app;
