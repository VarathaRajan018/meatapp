const mongoose = require('mongoose');

// Connection String from User
const connectionString = 'mongodb+srv://kishore2818:8903777150@cluster0.oa6zeab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing MongoDB Connection...');

mongoose.connect(connectionString)
    .then(() => {
        console.log('✅ Success! Connected to MongoDB.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });
