import express from 'express';
import userRouter from './users.js';

var router = express.Router();
router.use('/users',userRouter)


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

export default router
