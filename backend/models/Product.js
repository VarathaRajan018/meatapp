const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true }, // Keeping as string to match frontend format "$220"
    originalPrice: { type: String },
    image: { type: String },
    category: { type: String, default: 'Chicken' },
    description: { type: String },
    cutOptions: [{ type: String }], // e.g., ['Curry Cut', 'Whole']
    inStock: { type: Boolean, default: true },
});

module.exports = mongoose.model('Product', ProductSchema);
