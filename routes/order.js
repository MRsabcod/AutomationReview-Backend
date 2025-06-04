import express from 'express'

const orderRouter= express.Router()
orderRouter.post('/post-order',async(req,res)=>{
    
    const orderdetails={
        username:req.body.name,
        businessProfileLink:req.body.businessProfileLink,
        reviewCount:req.body,
        paymentstatus:req.body,
        contentSource:req.body.contentSource,
        orderProgress:req.body.orderProgress
    }
    
})


export default orderRouter