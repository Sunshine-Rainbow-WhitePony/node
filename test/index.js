const express = require("express");
const app = express();

const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //数据JSON类型
app.use(bodyParser.urlencoded({
	extended: false
})); //解析post请求数据

const mysql = require('mysql')

app.listen(3000, () => {
	console.log("服务启动")
});


const whiteListUrl = {
	get: [],
	post: [
		'/login'
	]
}

const hasOneOf = (str, arr) => {
	return arr.some(item => item.includes(str))
}

app.all("*", (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); //允许访问的域，设置为*就是允许所有的IP，所有的域访问
	res.header('Access-Control-Allow-Credentials', 'true'); // 允许服务器端发送Cookie数据
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, authorization'); //允许的header
	res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS'); //允许的方法
	
	if (req.method.toLowerCase() == 'options') {
		console.log(req.method.toLowerCase());
		res.sendStatus(200); // 让options尝试请求快速结束
	} else {
		console.log(1);
		let method = req.method.toLowerCase()
		let path = req.path //获取当前请求的路径
		if (whiteListUrl[method] && hasOneOf(path, whiteListUrl[method])) {
			next()
		} else {
			const token = req.headers.authorization; //在headers中获取到authorization字段
			if (!token) res.status(401).send('there is no token, please login')
			else {
				jwt.verify(token, "abcd", (error, decode) => {
					if (error) res.send({
						code: 401,
						mes: "token error",
						data: {}
					})
					else {
						req.userName = decode.name
						next()
					}
				})
			}
		}
	}
})

app.get('/authorization', (req, res, next) => {
	const userName = req.userName
	res.send({
		code: 200,
		mes: 'success',
		data: {
			token: jwt.sign({
				name: userName
			}, 'abcd', {
				expiresIn: 60
			})
		}
	})
})

app.post('/getInfo', (req, res, next) => {
	res.send({
		code: 200,
		mes: 'success',
		data: {

		}
	})
})

app.post('/login', async (req, res, next) => {
	const {
		userName,
		password
	} = req.body
	if (userName) {
		const userInfo = password ? await getUserInfoBySql(userName) : ''
		if (!userInfo || !password || userInfo.password !== password) {
			res.status(401).send({
				code: 401,
				mes: 'user name or password is wrong',
				data: {}
			})
		} else {
			console.log(200)
			res.send({
				code: 200,
				mes: 'success',
				data: {
					//jwt.sign的参数,
					//第二个是自定义的密钥,
					//第三个是配置
					token: jwt.sign({
						name: userName
					}, 'abcd', {
						expiresIn: 60, //过期时间60s
					})
				}
			})
		}
	} else {
		res.status(401).send({
			code: 401,
			mes: 'user name is empty',
			data: {}
		})
	}
})

const getPasswordByName = (userName) => {
	const users = [{
			id: 1,
			userName: '123',
			password: 'abc'
		},
		{
			id: 2,
			userName: '456',
			password: 'def'
		}
	]
	let userInfo = {}
	users.some((item) => {
		if (item.userName === userName) {
			userInfo = item
			return false
		}
	})
	return userInfo
}

const option = {
	host: 'localhost',
	user: 'root',
	password: '123456',
	port: '3306',
	database: 'user',
	connectTimeout: 5000, //链接超时
	multipleStatements: false, //是否允许一个query中包含多条sql语句
}

const conn = mysql.createConnection(option)

const getUserInfoBySql = (username) => {
	return new Promise((resolve, reject) => {
		conn.query('select * from usercomment where username=' + username, (e, r) => {
			obj = JSON.parse(JSON.stringify(r))
			resolve(obj[0])
		})
	})
}

const router = require('./user')
app.use(router)
