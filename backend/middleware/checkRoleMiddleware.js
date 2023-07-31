const jwt = require('jsonwebtoken');
const { Users } = require('../models/models');


module.exports = function(role) {
    return async function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }
        try {
            const token = req.headers.authorization.split(' ')[1] // Bearer asfasnfkajsfnjk
            if (!token) {
                return res.status(401).json({message: "Не авторизован"})
            } 
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            const user = await Users.findAll({ where: { id: decoded.id } });


            if (user[0].role !== role) {
                return res.status(403).json({message: "Нет доступа"})
            }
            req.user = decoded;
            next()
        } catch (e) {
            res.status(401).json({message: "Не авторизован"})
        }
    };
}

//ADMIN(директор), USER, EXPERT(чисто оценка), DIRECTOR(имеет всё)

