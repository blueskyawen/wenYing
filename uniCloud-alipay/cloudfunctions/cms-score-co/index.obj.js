// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
const cmsScoreCollection = db.collection('uni-id-scores')
const userDBName = 'uni-id-users'
module.exports = {
	_before: function () { // 通用预处理器

	},
	get: async function({user_id}) {
		const res = await cmsScoreCollection.where({
			'user_id': user_id
		}).limit(1).get();
		return res;
	},
	updateScore: async function({user_id, value}) {
		const dbCmd = db.command;
		const res = await cmsScoreCollection.where({
			'user_id': user_id
		}).update({
			balance: dbCmd.inc(value) // 10, -10
		});
		return res;
	},
	deleteTrashs: async function({user_id}) {
		const dbCmd = db.command;
		const res = await cmsScoreCollection.where({
							user_id: user_id
						})
						.orderBy("create_date", "desc")
						.get()
		let tmps = res.data || [];
		if (tmps.length > 1) {
			tmps.shift();
			let ids = tmps.map(x => x._id);
			const res2 = await cmsScoreCollection.where({
					   "_id": dbCmd.in(ids)
				   }).remove();
			return res2;
		}
		
		return res;
	},
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
