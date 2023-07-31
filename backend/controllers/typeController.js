const uuid = require('uuid');
const path = require('path');
const { Users, Contests, Rating, Tasks, ContestUser } = require('../models/models');
const ApiError = require('../error/ApiError');



class TypeController {

    async create(req, res, next) {

        let { name, description, userId, workers } = req.body;
        const { f } = req.files
        let fileName = uuid.v4() + path.parse(f.name).ext;
        f.mv(path.resolve(__dirname, '..', 'static', fileName))

        const isExists = await Contests.findOne({ where: { name } })

        if (isExists) {
            return next(ApiError.internal('Проект c таким именем уже существует'))
        }

        const contest = await Contests.create({ name, description, workers, fileName });
        const user = await Users.findAll({ where: { id: userId } });

        await contest.addUsers(user);
        return res.json(contest);  //Вместо ответа сделай на подобии ApiError только ApiSuccess.GoodRequest('Проект успешно создан')

    }


    async getAll(req, res) {
        let { limit, page } = req.query;
        page = page || 1;
        limit = limit || 8;
        let offset = page * limit - limit;
        const types = await Contests.findAndCountAll({
            limit: limit,
            offset: offset,
            distinct: true,
            include: [{
                model: Users,
                as: 'users',
                required: false,
                attributes: ['id', 'name', 'email'],
                through: { attributes: [] }

            }],
        });
        return res.json(types)
    }

    async add_user(req, res, next) {

        let { userId, contentId } = req.body;
        const user = await Users.findAll({ where: { id: userId } });
        const contest = await Contests.findOne({ where: { id: contentId } });
        const contestuser = await ContestUser.findAll({ where: { contestsId: contentId } });

        if (user && contest) {
            if(contest.workers >= contestuser.length+1){
                await contest.addUsers(user);
                return res.json(contest) //Вместо ответа сделай на подобии ApiError только ApiSuccess.GoodRequest('Пользователь успешно добавлен')
            }
            else{
                return next(ApiError.internal('Количество пользователей превышено'))
            }

        } else {

            return next(ApiError.internal('Такого пользователя или проекта не существует'))

        }
    }

    async createRate(req, res, next) {

        const { contestId, rate, userId } = req.body
        let rated;
        const contest = await Contests.findByPk(contestId)

        if (!contest) {
            return next(ApiError.internal('Такого проекта не существует'))
        }
        const user = await Users.findByPk(userId)
        if (!user) {
            return next(ApiError.internal('Такого пользователя не существует'))
        }


        const isExists = await Rating.findOne({ where: { userId, contestsId: contestId  } })

        if (isExists) {
            return next(ApiError.internal('Оценка уже поставлена'))
        }
        else {

            const rating = await Rating.create({ userId: userId, contestsId: contestId, rate })
            const votes = await Rating.count({ where: { contestsId: contestId } })

            if (votes) {

                const rates = await Rating.sum('rate', { where: { contestsId: contestId } })
                rated = { rates, votes, rating: rates / votes }
                const updateContest = await Contests.update({ rating: rated }, {
                    where: {
                        id: contestId
                    }
                })
                res.json(updateContest)
            } else {
                rated = { rates: 0, votes: 0, rating: 0 }
                const updateContest = await Contests.update({ rating }, {
                    where: {

                        id: contestId

                    }
                })
                res.json(updateContest)
            }

        }


    }

    async getUserProjects(req, res) {
        let { userId, page, limit } = req.query;
        page = page || 1;
        limit = limit || 8;
        let offset = page * limit - limit;

        // получаем пользователя
        const user = await Users.findOne({
            where: { id: userId }
        });

        if (!user) {
            return next(ApiError.internal('Такого пользователя не существует'))
        }
        const count = await user.countContests();
        const userContests = await user.getContests({
            limit: limit,
            offset: offset,
            distinct: true,
            include: [{

                model: Users,
                as: 'users',
                required: false,
                attributes: ['id', 'name', 'email'],
                through: { attributes: [] }

            }],
        });

        return res.json({
            count: count,
            rows: userContests
        });
    }


    async del_project(req, res) {
        const { id } = req.body;
        try {
            Contests.destroy({ where: { id: id } });
            ContestUser.destroy({ where: { contestsId: id } });
            Rating.destroy({ where: { contestsId: id } });
            res.json('Ok')
        } catch (error) {
            console.log(error)
            return next(ApiError.internal('Ошибка удаление проекта'))
        }
    }

    async del_user_project(req, res) {

        const { userId, contestsId } = req.body;
        try {
            ContestUser.destroy({ where: { userId: userId, contestsId: contestsId } });
            Rating.destroy({ where: { userId: userId, contestsId: contestsId } });
            res.json('Ok')
        } catch (error) {
            res.json(error)
        }
    }
    
    async change_inf_project(req, res) {

        let {id, name, description, workers } = req.body;
        const { f } = req.files

        try {

            const ok = await Contests.findByPk(id);

            if (!ok) {

                return res.json("Проект не найден")

            }
            if(f){
            let fileName = uuid.v4() + path.parse(f.name).ext;
            f.mv(path.resolve(__dirname, '..', 'static', fileName))    
            await ok.update({name, description, workers, fileName});
    
            return res.json("Инфа обновлена")
        }else{

            await ok.update({name, description, workers});

            return res.json("Инфа обновлена")

        }

        } catch (e) {
            return res.json(e)
        }

    }
}

module.exports = new TypeController()