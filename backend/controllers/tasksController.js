const { Tasks, Users, TaskUser, CheckRatingTask } = require('../models/models');
const ApiError = require('../error/ApiError');
const jwt = require('jsonwebtoken')
const uuid = require('uuid');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'savelyev_av@edu.surgu.ru',
        pass: 'plbhwtubkzdlwluc'
    }
});
async function sendEmail(task_id) {

    let experts = await Users.findAll({ where: { role: "EXPERT" } }); 
    let all_exp = []
    for(let i of experts) {all_exp.push(i.email)}
    const mailOptions = {
        from: 'savelyev_av@edu.surgu.ru',
        to: all_exp,
        subject: 'Привет',
        text: `Вам необходимо поставить рейтинг по такой ссылке https://31.129.96.5:3000/rating?taskId=${task_id}`
    };
    console.log(1)
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent: ${info.response}`);
            schedule.stop();
        }
    });
}

class TasksController {
    async create(req, res, next) {
        try {
            const { name, description, typ, userId, stop } = req.body;
            const { f } = req.files
            let fileName = uuid.v4() + path.parse(f.name).ext;
            f.mv(path.resolve(__dirname, '..', 'static', fileName))
            const isExists = await Tasks.findOne({ where: { name } });

            if (isExists) {
                return next(ApiError.badRequest('Проект с таким именем уже существует'));
            }
            
            const task = await Tasks.create({ name, description, typ, stop, fileName }, { returning: true });
            const user = await Users.findAll({ where: { id: userId } });
            await task.addUser(user);
            let d = new Date(stop);
            console.log(d.getDay())
            try {
                const schedule = cron.schedule(`00 00 8 31 5 ${d.getDay()}`, () => {
                    sendEmail(task.id)
                });
                schedule.start();

                return res.json('Проект успешно создан');
            } catch {

                return res.json('Не найдены эксперты');

            }


        } catch (error) {
            console.log(error)
            return next(ApiError.internal('Ошибка создания задачи'));
        }
    }


    async getAll(req, res) {
        let { limit, page, type } = req.query;
        page = page || 1;
        limit = limit || 8;
        let offset = page * limit - limit;
        const tasks = await Tasks.findAndCountAll({
            where: { typ: type },
            limit: limit,
            offset: offset,
            distinct: true,
            include: [{
                model: Users,
                as: 'users',
                required: false,
                attributes: ['id', 'name'],
                through: { attributes: ['predicted', 'rate'] }
            }],
        });

        return res.json(tasks)

    }

    async getOne(req, res, next) {
        let { taskId } = req.query;
        const task = await Tasks.findOne({
            where: { id: taskId },
            distinct: true,
            include: [{
                model: Users,
                as: 'users',
                required: false,
                attributes: ['id', 'name'],
                through: { attributes: ['predicted', 'rate'] }
            }],
        });

        return res.json(task)

    }



    async add_user(req, res, next) {
        let { userId, contentId, predict } = req.body;

        const user = await Users.findOne({ where: { id: userId } });
        const task = await Tasks.findOne({ where: { id: contentId } });
        const task_user = await TaskUser.findOne({ where: { TasksId: contentId, userId: userId  } });
        
        if (task_user){

            
            const now = new Date();

            const start = new Date(task_user.createdAt);

            const diff = now.getTime() - start.getTime();

            const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

            if(weeks <= 2){

                if (user && task) {
                    task.addUsers(user, { through: { predicted: predict } })
                    return res.json(task) //Вместо ответа сделай на подобии ApiError только ApiSuccess.GoodRequest('Пользователь успешно добавлен')
                } else {
                    return next(ApiError.internal('Такого пользователя или проекта не существует'))
                }


            }
            else{

                return next(ApiError.internal('Нельзя изменить уже существующее предсказание'))


            }

        }

        else{

            if (user && task) {
                task.addUsers(user, { through: { predicted: predict } })
                return res.json(task) //Вместо ответа сделай на подобии ApiError только ApiSuccess.GoodRequest('Пользователь успешно добавлен')
            } else {
                return next(ApiError.internal('Такого пользователя или проекта не существует'))
            }
        }


    }

    async createRate(req, res) {
        let { userId, taskId, rate } = req.body;

        const token = req.headers.authorization.split(' ')[1] // Bearer asfasnfkajsfnjk
        const decoded = jwt.verify(token, process.env.SECRET_KEY)        
        let idshnik = decoded.id;
        const task1 = await Tasks.findByPk(taskId)



        if (!task1) {
            return res.json('task не найден в БД')
        }
        const user1 = await Users.findByPk(userId)
        if (!user1) {
            return res.json('User не найден в БД')
        }
        
        const user = await Users.findOne({ where: { id: userId } });
        const task = await Tasks.findOne({ where: { id: taskId } });
        const task_check = await CheckRatingTask.findOne({ where: { userId: userId, expertId: idshnik } });



        if (user && task) {

            if(!task_check){

            const ok = await CheckRatingTask.create({ userId, expertId: idshnik });
            const taskUser = await TaskUser.findOne({ where: { userId: userId, TasksId: taskId } }) //из вот этой функи достаем это -> {rates: 0, votes: 0, rating: 0}

            let obja = JSON.parse(JSON.stringify(taskUser.rate));

            obja.rates = +obja.rates + rate;
            obja.votes = +obja.votes + 1;
            obja.rating = +obja.rates / +obja.votes;

            const a = await TaskUser.update({ rate: obja }, {
                where: {

                    userId: userId,
                    TasksId: taskId

                }
            });
            //task.addUsers(user, { through: { predicted: predict } })
            return res.json(task) //Вместо ответа сделай на подобии ApiError только ApiSuccess.GoodRequest('Пользователь успешно добавлен')
        
        }
        else{

            return res.json("Вы уже поставили оценку")

        }

        } else {
            return next(ApiError.badRequest('Такого пользователя или проекта не существует'))

        }


    }

    async del_task(req, res) {
        const { TasksId } = req.body;
        try {
            Tasks.destroy({ where: { id: TasksId } });
            TaskUser.destroy({ where: { TasksId: TasksId } });
            res.json('Ok')
        } catch (error) {
            res.json(error)
        }
    }

    async del_user_task(req, res) {

        const { user_id, TasksId } = req.body;
        try {
            TaskUser.destroy({ where: { userId: user_id, TasksId: TasksId } });
            res.json('Ok')
        } catch (error) {
            res.json(error)
        }
    }

    async getUserTasks(req, res, next) {
        let { userId, page, limit, type } = req.query;
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

        const count = await user.countTasks({ where: { typ: type } });
        const userTasks = await user.getTasks({
            where: { typ: type },
            limit: limit,
            offset: offset,
            distinct: true,
            include: [{
                model: Users,
                as: 'users',
                required: false,
                attributes: ['id', 'name', 'email'],
                through: { attributes: ['predicted', 'rate'] }
            }],
        });
        return res.json({
            count: count,
            rows: userTasks
        });
    }

    async getUserStat(req, res, next) {
        let { userId, type } = req.query;

        // получаем пользователя
        const user = await Users.findOne({
            where: { id: userId }
        });

        if (!user) {
            return next(ApiError.internal('Такого пользователя не существует'))
        }
        const userTasks = await user.getTasks({
            where: { typ: type },
            distinct: true,
            include: [{
                model: Users,
                as: 'users',
                required: false,
                attributes: ['id', 'name', 'email'],
                through: { attributes: ['predicted', 'rate'] }
            }],
        });
        const commitment = userTasks.map((item) => {
            return (
                {
                    "item": item.name,
                    "user": "Обязательства",
                    "score": item.TaskUser.predicted
                }
            )
        })
        const execution = userTasks.map((item) => {
            return (
                {
                    "item": item.name,
                    "user": "Фактическое исполнение",
                    "score": item.TaskUser.rate.rating
                }
            )
        })
        const result = [...commitment, ...execution]
        return res.json(result);
    }

    async getStatsTasks(req, res) {
        let { type, name } = req.query;

        const tasks = await Tasks.findAll({
            where: { typ: type },
            distinct: true,
            include: [{
                model: Users,
                as: 'users',
                required: false,
                attributes: ['id', 'name'],
                through: { attributes: ['predicted', 'rate'] }
            }],
        });
        let result = [];

        tasks.forEach((task, i) => {
            const commitment = task.users.map((item) => {
                return {
                    "item": task.name,
                    "user": `[План] ${item.name}`,
                    "score": item.TaskUser.predicted,
                };
            });
            const execution = task.users.map((item) => {
                return {
                    "item": task.name,
                    "user": `[Факт] ${item.name}`,
                    "score": item.TaskUser.rate.rating,
                };
            });
            if ( name === "ФАКТ" ) {
                result.push(...execution);
            } else if (name === "ПЛАН") {
                result.push(...commitment);
            }
        });
        return res.json(result);
    }
    async del_allTasks(req, res) {

        try {
            await Tasks.destroy({ truncate: { cascade: true } });
            await CheckRatingTask.destroy({ truncate: { cascade: true } });
            await TaskUser.destroy({ truncate: { cascade: true } });
            res.json('Задачи удалены')
        } catch (error) {
            res.json(error)
        }
    }
}
module.exports = new TasksController()