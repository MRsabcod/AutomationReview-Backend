import express from 'express';
import userRouter from './users.js';
import adminRouter from './admin.js';
import orderRouter from './order.js';
var router = express.Router();
router.use('/users',userRouter)
router.use('/admin',adminRouter)
router.use('/order',orderRouter)
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

export default router
