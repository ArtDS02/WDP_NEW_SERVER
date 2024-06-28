// Import các module cần thiết
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const payOS = require('./utils/payos');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const config = require('./config');

// Import các router
const userRouter = require('./routes/userRouter');
const collectionRouter = require('./routes/collectionRouter');
const questionRouter = require('./routes/questionRouter');
const examRouter = require('./routes/examRouter');
const depositRouter = require('./routes/depositRouter');
const enrollmentRouter = require('./routes/enrollmentRouter');
const authenticate = require('./authen/authenticate');

// Tạo ứng dụng Express
const app = express();
dotenv.config(); // Đọc các biến môi trường từ file .env

// Thiết lập kết nối đến MongoDB
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
    console.log('MongoDB successfully connected');
}).catch((err) => {
    console.log('MongoDB connect to failed', err);
});

// Thiết lập các middleware
app.use(bodyParser.json());

// Thiết lập CORS
const corsOptions = {
    origin: 'http://localhost:3001', // Thay đổi thành origin của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        name: "session-id",
        secret: "12345-67890-09876-54321",
        saveUninitialized: false,
        resave: false,
        store: new FileStore(),
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Định tuyến tĩnh cho thư mục 'public'
app.use('/', express.static('public'));

// Định tuyến cho các router
app.use('/users', userRouter);
app.use('/collections', collectionRouter);
app.use('/questions', questionRouter);
app.use('/exam', examRouter);
app.use('/enrollment', enrollmentRouter);
app.use('/deposit', depositRouter);

// Định tuyến cho các controller liên quan đến thanh toán
app.use('/payment', require('./controllers/payment-controller'));
app.use('/order', require('./controllers/order-controller'));

// Route để tạo link thanh toán
app.post('/create-payment-link', authenticate.verifyUser, async (req, res) => {
    const YOUR_DOMAIN = 'http://localhost:3000';
    const { number } = req.body;
    console.log("number = ", number);
    console.log("type of number = ", typeof(Number(number)));

    const body = {
        orderCode: Number(String(Date.now()).slice(-6)),
        amount: Number(number),
        description: 'Thanh toan nap tien',
        returnUrl: `${YOUR_DOMAIN}/success.html`,
        cancelUrl: `${YOUR_DOMAIN}/cancel.html`
    };

    try {
        const paymentLinkResponse = await payOS.createPaymentLink(body);
        res.json({ checkoutUrl: paymentLinkResponse.checkoutUrl });  // Trả về JSON thay vì redirect
    } catch (error) {
        console.error("Error creating payment link:", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT}`);
});
