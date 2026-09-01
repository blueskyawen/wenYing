// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
const cmsDocCollection = db.collection('uni-cms-articles')
const userDBName = 'uni-id-users'
module.exports = {
	_before: function () { // 通用预处理器

	},
	getSearch: async function(pageNum, pageSize, category_id) {
		let curPageNum = pageNum > 0 ? pageNum - 1 : 0
		let skipNum = curPageNum * pageSize
		const dbCmd = db.command
		const $ = dbCmd.aggregate
		const res = cmsDocCollection.aggregate()
						.lookup({
						  from: userDBName,
						  let: {
							user_id: '$user_id'
						  },
						  pipeline: $.pipeline()
							.match(dbCmd.expr(
							  $.eq(['$_id', '$$user_id'])
							))
							.project({
							  nickname: true,
							  username: true
							})
							.done(),
						  as: 'user_id'
						}).match({
							'article_status': 1,
							 'category_id': category_id
						}).skip(skipNum).limit(pageSize).end()
		// const res = await cmsDocCollection.skip(skipNum).limit(pageSize).get();
			return res;
	},
	updateViewCount: async function(value) {
		let res = cmsDocCollection.where({
						_id: this.id
					}).update({
					  view_count: db.command.inc(value)
					})
		return res;
	},
	delete: async function(event) {
		let res = cmsDocCollection.doc(event.id).remove();
		return res;
	}
	/**
	 * method1方法描述
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */
	/* 
	method1(param1) {
		// 参数校验，如无参数则不需要
		if (!param1) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '参数不能为空'
			}
		}
		// 业务逻辑
		
		// 返回结果
		return {
			param1 //请根据实际需要返回值
		}
	}
	*/
}
