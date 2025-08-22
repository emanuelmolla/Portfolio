const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {

    console.log(req.body)
};

const logout = async (req, res) => {};

module.exports = { login, logout };
