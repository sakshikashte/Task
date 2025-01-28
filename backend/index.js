const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db'); // Import the 'pool' object from 'db.js'

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API endpoint to fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
});


//Post api
app.post('/api/orders', async (req, res) => {
    const { orderDescription, productIds } = req.body;

    // Validate the incoming data
    if (!orderDescription || !productIds || productIds.length === 0) {
        return res.status(400).json({ error: 'Order description and product IDs are required.' });
    }

    try {
        // Generate the current date and time for the createdAt field
        const createdAt = new Date();

        // Step 1: Insert the order into the "orders" table
        const orderResult = await pool.query(
            'INSERT INTO orders (orderDescription, createdAt) VALUES ($1, $2) RETURNING id',
            [orderDescription, createdAt]
        );

        const orderId = orderResult.rows[0].id;

        // Step 2: Insert mappings into the "orderproductmap" table
        const insertPromises = productIds.map((productId) =>
            pool.query(
                'INSERT INTO orderproductmap (orderId, productId) VALUES ($1, $2)',
                [orderId, productId]
            )
        );

        // Wait for all mappings to be inserted
        await Promise.all(insertPromises);

        res.status(201).json({ message: 'Order created successfully!', orderId });
    } catch (error) {
        console.error('Error submitting order:', error);
        res.status(500).json({ error: 'An error occurred while submitting the order.' });
    }
});


//all order Get api

app.get('/api/ordersdata', async (req, res) => {
    try {
        // SQL query to fetch orders with product count
        const result = await pool.query(`
            SELECT 
                o.id AS orderId,
                o.orderDescription,
                COUNT(op.productId) AS productCount,
                o.createdAt
            FROM 
                orders o
            LEFT JOIN 
                orderproductmap op
            ON 
                o.id = op.orderId
            GROUP BY 
                o.id
            ORDER BY 
                o.createdAt DESC
        `);

        // Send the result as JSON
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'An error occurred while fetching orders.' });
    }
});


//Edit order
app.put('/api/ordersedit/:orderId', async (req, res) => {
    const { orderId } = req.params; // Extract orderId from the URL
    const { orderDescription, productIds } = req.body; // Extract updated data from the request body

    // Input validation
    if (!orderDescription || !productIds || productIds.length === 0) {
        return res.status(400).json({ error: 'Order description and at least one product ID are required.' });
    }

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Update the order description in the "orders" table
        await pool.query(
            'UPDATE orders SET orderDescription = $1 WHERE id = $2',
            [orderDescription, orderId]
        );

        // Remove existing product mappings for the order
        await pool.query('DELETE FROM orderproductmap WHERE orderId = $1', [orderId]);

        // Insert new product mappings into "orderproductmap"
        const insertPromises = productIds.map((productId) =>
            pool.query(
                'INSERT INTO orderproductmap (orderId, productId) VALUES ($1, $2)',
                [orderId, productId]
            )
        );
        await Promise.all(insertPromises);

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Order updated successfully!' });
    } catch (error) {
        // Rollback the transaction if any error occurs
        await pool.query('ROLLBACK');
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'An error occurred while updating the order.' });
    }
});


//Delete order
app.delete('/api/ordersdelete/:orderId', async (req, res) => {
    const { orderId } = req.params; // Extract orderId from the URL

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Delete product mappings for the order from "orderproductmap"
        await pool.query('DELETE FROM orderproductmap WHERE orderId = $1', [orderId]);

        // Delete the order itself from the "orders" table
        await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (error) {
        // Rollback the transaction if any error occurs
        await pool.query('ROLLBACK');
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'An error occurred while deleting the order.' });
    }
});



// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
