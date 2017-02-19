/**
 * Created by WittBulter on 2017/1/29.
 */

module.exports = {

	/**
	 *
	 * @api {GET} http://wittsay.cc/v1/reviews/:id [showReviewArticles]
	 * @apiGroup Review
	 * @apiDescription 获取需要审核的文章 需要Admin或更高权限
	 * @apiParam (path) {string} [id] 文章id (查询id会自动抛弃query条件)
	 * @apiParam (query) {string} [status] 文章状态 包括: isReview:审核中, isActive:正常, isDestroy:已删除, all: 所有(默认)
	 * @apiUse PAGE
	 * @apiUse CODE_200
	 * @apiUse CODE_500
	 */
	show: (req, res) =>{
		const {id} = req.params
		if (!id){
			let {page, per_page, status} = req.allParams()
			if (status != 'isReview' && status != 'isActive' && status != 'isDestroy'){
				status = 'all'
			}
			return ArticleService.findReviewAll({
				page: page? page: 1,
				per_page: per_page? per_page: 14,
				status: status
			}, (err, articles) =>{
				if (err) return res.serverError()

				res.ok(articles)
			})
		}
		ArticleService.findArticleForID(id)
			.then(article =>{
				if (!article) return res.notFound({message: '未找到文章'})

				const {readTotal, authorId} = article
				UserService.findUserForId(authorId, (err, user) =>{
					if (err) return res.serverError()

					// 每次取单篇文章时更新文章本身阅读数量
					// 单次写操作会影响接口等待时间，非重要逻辑异步处理事务，不等待写操作结束
					ArticleService.updateArticle(id, {
						readTotal: readTotal? readTotal + 1: 2
					}, (err, updated) =>{})
					res.ok(Object.assign({avatar: user.avatar? user.avatar: ''}, article))
				})
			})
			.catch(err =>{
				return res.serverError()
			})

	},

	/**
	 *
	 * @api {PUT} http://wittsay.cc/v1/reviews/:id/:status [reviewArticle]
	 * @apiGroup Review
	 * @apiDescription 审核指定文章 需要管理员权限或更高
	 * @apiParam (path) {string} id 文章id
	 * @apiParam (path) {string} status 文章状态 包括: isReview:审核中, isActive:正常, isDestroy:已删除
	 * @apiUse CODE_200
	 * @apiUse CODE_500
	 */
	update: (req, res) =>{
		const {id, status} = req.params
		if (!id || !status) return res.badRequest({message: '参数错误'})
		if (status != 'isReview' && status != 'isActive' && status != 'isDestroy'){
			return res.badRequest({message: '状态错误'})
		}

		ArticleService.updateArticle(id, {articleType: status}, (err, updated) =>{
			if (err) return res.serverError()

			res.ok(updated[0])
		})

	},
}