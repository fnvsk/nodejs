const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51OjoE8BYN32CVb4N0eE0RwihrquwPEk7J42mvhoceDO4Yusfr2pJELTprOdjH683UkP7gO1AY859u9tpGOrz27pu008xhAHotf'); // Replace with your secret Stripe key
const bodyParser = require('body-parser');
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to enable CORS
app.use(cors());

// Route to handle Stripe Checkout session creation
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { value, email } = req.body;

        if (!value || value <= 0 || !email) {
            return res.status(400).json({ error: 'Invalid value or email' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'rub',
                        product_data: {
                            name: 'Purchase Item',
                        },
                        unit_amount: value * 100, // Stripe expects the amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:5500/success.html',
            cancel_url: 'http://localhost:5500/cancel.html',
            customer_email: email,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
