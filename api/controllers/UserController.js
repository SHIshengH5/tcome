/**
 * Created by WittBulter on 2016/10/12.
 * @description :: 管理用户及相关逻辑
 */
const uuid = require('node-uuid')

module.exports = {
	/**
	 *
	 * @api {GET} http://wittsay.cc/api/users/:id [show]
	 * @apiGroup User
	 * @apiDescription 获取指定用户的信息
	 * @apiParam (path) {string} id 用户id
	 * @apiUse CODE_200
	 * @apiUse CODE_500
	 */
	show: (req, res) =>{
		const id = req.params&& req.params.length? req.params[0]: ''
		if (!id) return res.badRequest({message: '至少需要用户id'})

		UserService.findUserForId(id, (err, userData) =>{
			if (err) return res.serverError()

			delete userData[0].password
			res.ok(userData[0])
		})
	},

	/**
	 *
	 * @api {GET} http://wittsay.cc/api/user/type [userType]
	 * @apiGroup User
	 * @apiDescription 获取默认的用户类型
	 * @apiUse CODE_200
	 * @apiUse CODE_500
	 */
	userType: (req, res) =>{
		UserService.findUserType(undefined, (err, typeArray) =>{
			if (err) return res.serverError()

			res.ok(typeArray)
		})
	},

	/**
	 *
	 * @api {POST} http://wittsay.cc/api/user [create]
	 * @apiGroup User
	 * @apiDescription 获取指定用户的信息
	 * @apiParam (body) {string} id 用户id
	 * @apiUse CODE_200
	 * @apiUse CODE_500
	 */
	create: (req, res) =>{
		const {username, password, email, phone} = req.allParams()
		// if (!email && !password) return res.badRequest({message: '只要需要指定帐号密码'})
		// if (password.length < 5 || password.length > 22) return res.badRequest({message: '密码不符合规范'})
		if (!/^[0-9a-zA-Z]+@(([0-9a-zA-Z]+)[.])+[a-z]{2,4}$/.test(email)){
			return res.badRequest({message: '邮件地址不符合规范'})
		}
		const token = uuid.v4()
		UserService.createUser({
			email: email,
			password: password,
			username: username? username: '新用户',
			phone: phone? phone: '0',
			userType: 'notActive',
			userTitle: '未激活会员',
			activeTarget: token
		}, (err, created) =>{
			if (err) return res.serverError()

			return UserService.sendMail({
				email: email,
				subject: '维特博客-帐号激活',
				token: token,
			}, (err, info) =>{
				res.ok({message: '注册邮件已发送'})
			})

		})

	}


}