const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.post('/change_role', checkRole('ADMIN'),userController.change_role)
router.post('/change_inf_user', checkRole('ADMIN'), userController.change_inf_user)
router.post('/del_user', checkRole('ADMIN'), userController.del_user)
router.get('/getUsers',  userController.get_all_users)
router.post('/change_myself_inf_user', userController.change_myself_inf_user)


router.post('/refreshJWTToken', userController.refreshJWTToken)


module.exports = router