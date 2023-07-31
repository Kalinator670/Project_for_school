const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Users, Contests, Tasks } = require('../models/models')
const uuid = require('uuid')
const path = require('path');

const generateJwt = (id, email, role) => {

    return jwt.sign(
        { id, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '30d' }
    )

}

class UserController {
    async registration(req, res, next) {

        const { email, password, name, role } = req.body
        //const {img} = req.files

        if (!email || !password) {

            return next(ApiError.badRequest('Некорректный email или password'))

        }

        const candidate = await Users.findOne({ where: { email } })

        if (candidate) {

            return next(ApiError.badRequest('Пользователь с таким email уже существует'))

        }

        const hashPassword = await bcrypt.hash(password, 5)

        //let fileName = uuid.v4() + ".jpg"
        //img.mv(path.resolve(__dirname, '..', 'avs', fileName))

        const user = await Users.create({ email, password: hashPassword, role, name })

        const token = generateJwt(user.id, user.email, user.role)
        return res.json({ token })

    }

    async login(req, res, next) {

        const { email, password } = req.body
        if (email) {


            const user = await Users.findOne({ where: { email } })

            if (email && password) {
                if (!user) {
                    return next(ApiError.internal('Пользователь не найден'))
                }

                let comparePassword = bcrypt.compareSync(password, user.password)

                if (!comparePassword) {
                    return next(ApiError.internal('Указан неверный пароль'))
                }

                const token = generateJwt(user.id, user.email, user.role)
                return res.json({ token, user })

            }
            return res.json("Введены не все данные");


        }
        else {
            return res.json("Данные не введены");
        }

    }

    async check(req, res, next) {

        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({ token })

    }

    async change_role(req, res) {

        let { email, new_role } = req.body;
        const candidate = await Users.findOne({ where: { email } })

        if (candidate) {

            const al = await Users.update({ role: new_role }, { where: { email: email } });
            return res.json({ al })

        }
        return res.json("Ошибка, email не найден")

    }

    async change_inf_user(req, res) {

        let { id, name, email, role } = req.body;

        try {

            const ok = await Users.findByPk(id);

            if (!ok) {

                return res.json("Юзер не найден")

            }

            await ok.update({name, email, role});

            return res.json("Инфа обновлена")

        } catch (e) {

            return res.json("Ошибка")

        }

    }


    async change_myself_inf_user(req, res) {

        let { id, name, email, password } = req.body;
        const token = req.headers.authorization.split(' ')[1] // Bearer asfasnfkajsfnjk

        const decoded = jwt.verify(token, process.env.SECRET_KEY)        
        let idshnik = decoded.id;
    
        if(id == idshnik && password && name && email) {
            const hashPassword = await bcrypt.hash(password, 5)
            const ok = await Users.findByPk(idshnik);
            await ok.update({name, email, password: hashPassword});
            return res.json("Инфа обновлена")
        }

        return res.json("Ошибка")
    }




    async del_user(req, res) {

        let { id } = req.body;

        try {
            const user = await Users.findByPk(id);
            if (user) {

                await user.destroy();
                return res.json("Успешно удален")


            } else {

                return res.json("Блеа ошибка")

            }
        } catch (err) {

            return res.json("Блеа ошибка")

        }

    }

    async refreshJWTToken(req, res) {
        const { token } = req.body;

        try {
            if (!token) {
                throw new Error('No token provided');
            }

            const expiresIn = '30d';
            const user = jwt.verify(token, process.env.SECRET_KEY);
            const user1 = await Users.findOne({ where: { email: user.email } });

            // Generate a new token with a new expiration time
            const newToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: expiresIn, });

            // Return the new token and the user
            return res.json({ token: newToken, user: user1 });
        } catch (err) {
            console.error(err);
            return res.status(401).json({ error: err.message });
        }
    }

    async get_all_users(req, res) {

        let {page, limit } = req.query;
        page = page || 1;
        limit = limit || 8;
        let offset = page * limit - limit;
        const users = await Users.findAndCountAll({
            limit: limit,
            offset: offset,
            distinct: true,
            include: [{
                model: Tasks,
                as: 'Tasks',
                required: false,
                attributes: ['id', 'name'],
                through: { attributes: ['predicted', 'rate'] }
            }],
        });
        return res.json(users);

    }

}
module.exports = new UserController()