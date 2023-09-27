import app from './app.js'
import { config } from 'dotenv';
import connectToDB from './config/dbConnection.js';
config();
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await connectToDB();
    console.log(`App is listening at http:\\localhost:${PORT}`)
})
