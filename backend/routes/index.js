const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const typeRouter = require('./typeRouter')
//const taskRouter = require('./taskRouter')

router.use('/user', userRouter)
router.use('/', typeRouter)


module.exports = router