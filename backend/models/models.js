const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const Users = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('USER', 'EXPERT', 'ADMIN'),
    defaultValue: 'USER'
  },
  name: {
    type: DataTypes.STRING

  }
});

const Contests = sequelize.define('Contests', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  workers: {
    type: DataTypes.INTEGER
  },
  rating: {
    type: DataTypes.JSON,
    defaultValue: {rates: 0, votes: 0, rating: 0}
  },
  fileName: {type: DataTypes.STRING, allowNull: false},
});

const Rating = sequelize.define('rating', {

  rate: {
    type: DataTypes.INTEGER,
    allowNull: false },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  contestsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Contests',
      key: 'id'
    }
  }
})


const Tasks = sequelize.define('Tasks', {

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING(2000) },
  typ: {
    type: DataTypes.ENUM('INVAR', 'VAR'),
    defaultValue: 'VAR'
  },
  stop: { type: DataTypes.STRING }, //изменить на дату
  fileName: {type: DataTypes.STRING, allowNull: false},
})

const CheckRatingTask = sequelize.define('CheckRatingTask', {

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  expertId: {
    type: DataTypes.INTEGER,
    allowNull: false

  }
})

const TaskUser = sequelize.define('TaskUser', {
  predicted: {
    type: DataTypes.INTEGER,
    defaultValue: 0 },
  rate: {
    type: DataTypes.JSON, defaultValue: {rates: 0, votes: 0, rating: 0} },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  TasksId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  }
});

const ContestUser = sequelize.define('ContestUser', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  contestsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Contests',
      key: 'id'
    }
  }
});

Users.belongsToMany(Contests, {
  through: 'ContestUser',
  as: 'Contests',
  foreignKey: 'userId'
});
Contests.belongsToMany(Users, {
  through: 'ContestUser',
  as: 'users',
  foreignKey: 'contestsId'
});

// связь many-to-many товаров и пользователей через промежуточную таблицу rating;
// за один товар могут проголосовать несколько зарегистрированных пользователей,
// один пользователь может проголосовать за несколько товаров

Users.belongsToMany(Contests, {
  through: Rating,
  as: 'ContestsRating',
  foreignKey: 'userId'
});
Contests.belongsToMany(Users, {
  through: Rating,
  as: 'usersRating',
  foreignKey: 'contestsId'
});



Users.belongsToMany(Tasks, {
  through: 'TaskUser',
  as: 'Tasks',
  foreignKey: 'userId'
});

Tasks.belongsToMany(Users, {
  through: 'TaskUser',
  as: 'users',
  foreignKey: 'TasksId'
});




module.exports = {

  Users,
  Contests,
  Tasks,
  ContestUser,
  Rating,
  TaskUser,
  CheckRatingTask,

}