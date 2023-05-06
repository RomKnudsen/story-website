import express from 'express';
export const app = express();
import dotenv from 'dotenv';
import routes from './routes.js';
import database from './config/database.js';
import errorMiddleware from './middlewares/error.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';
import {resolve, dirname, join} from 'path';
import {fileURLToPath} from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
// .env
dotenv.config({path: './config/.env'});

//body parser
app.use(bodyParser.urlencoded({ extended: false,limit: '500mb' }))
app.use(bodyParser.json({limit: '500mb'}))
app.use(cookieParser());
app.use(cors({
	origin : "*"
}));

// Configuration cloudinary
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

// connnect database
database();

// app routes
app.use('/api/v1',routes);


// Middleware for Errors
app.use(errorMiddleware);

// render file
app.use(express.static(join(__dirname, "./build")));

app.get("*", (req, res) => {
  res.sendFile(resolve(__dirname, "./build/index.html"));
});


app.get('/',(req,res) => {
	res.send('its work');
});
