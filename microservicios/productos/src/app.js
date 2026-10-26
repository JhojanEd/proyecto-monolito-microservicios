const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ estado: 'ok', servicio: 'productos' });
});

app.get('/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar productos' });
    }
});

// Crear un producto (POST)
app.post('/productos', async (req, res) => {
    try {
        const { nombre, precio } = req.body;
        const result = await pool.query(
            'INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING *',
            [nombre, precio]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Actualizar un producto (PUT)
app.put('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio } = req.body;
        const result = await pool.query(
            'UPDATE productos SET nombre = $1, precio = $2 WHERE id = $3 RETURNING *',
            [nombre, precio, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Eliminar un producto (DELETE)
app.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = app;
