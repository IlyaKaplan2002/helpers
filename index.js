const Pool = require("pg").Pool;
const ConfigParser = require("configparser");

const config = new ConfigParser();

// config.read("vk-postgres.config");

const db_config = {
  user: config.get("VK", "username"),
  host: config.get("VK", "host"),
  database: config.get("VK", "database"),
  password: config.get("VK", "password"),
  port: config.get("VK", "port"),
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(db_config);

const getIDsOfEmptyPosts = () => {
  return new Promise(function (resolve, reject) {
    pool.query(`select post_id from posts where content = '';`, (err, res) => {
      if (err) reject(err);
      else resolve(res.rows.map((item) => item.post_id));
    });
  });
};

const getIDsOfAllPosts = () => {
  return new Promise(function (resolve, reject) {
    pool.query(`select post_id from posts;`, (err, res) => {
      if (err) reject(err);
      else resolve(res.rows.map((item) => item.post_id));
    });
  });
};

const getIDsFromKeysToPosts = () => {
  return new Promise(function (resolve, reject) {
    pool.query(`select post_id from posts_to_keys;`, (err, res) => {
      if (err) reject(err);
      else resolve(res.rows.map((item) => item.post_id));
    });
  });
};

const getDifference = (array, array1) => {
  return array.filter((item) => !array1.include(item));
};

const deleteFromPosts = (postIDs) => {
  for (const id of postIDs) {
    pool.query(`delete from keys_to_posts where post_id = ${id}`);
  }
};

deleteFromPosts(getIDsOfEmptyPosts());

deleteFromPosts(getDifference(getIDsOfAllPosts(), getIDsFromKeysToPosts()));
