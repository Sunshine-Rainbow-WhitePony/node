const express = require("express");
const router = express.Router();
const mysql = require('mysql')

const option = {
	host: 'localhost',
	user: 'root',
	password: '123456',
	port: '3306',
	database: 'user',
	connectTimeout: 5000,//链接超时
	multipleStatements: false,//是否允许一个query中包含多条sql语句
}

const conn = mysql.createConnection(option)

const getAllUserInfo = (username) => {
	return new Promise((resolve, reject) => {
		conn.query('select * from usercomment',(e,r) => {
			obj = JSON.parse(JSON.stringify(r))
			resolve(obj[0])
		})
	})
}

router.post('/getAllUser', async (req, res) => {
	res.send({
		code: 200,
		mes: 'success',
		data: await getAllUserInfo()
	})
})

module.exports = router
