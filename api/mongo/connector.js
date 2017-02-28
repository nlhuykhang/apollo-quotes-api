import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/quote_api');

mongoose.connection.on('error', console.error.bind(console, 'connection error: '));

mongoose.connection.once('open', () => console.log('DB connected'));
