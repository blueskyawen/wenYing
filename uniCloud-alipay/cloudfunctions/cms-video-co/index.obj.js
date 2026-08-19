// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
const cmsVideoCollection = db.collection('cms-videos')
const userDBName = 'uni-id-users'
module.exports = {
	_before: function () { // 通用预处理器

	},
	add: async function(event) {
		let addData = {
			...event
		}
		const res = await cmsVideoCollection.add(addData)
		return res;
	},
	delete: async function(event) {
		let res = await cmsVideoCollection.doc(event.id).remove()
		if (res.deleted === 1) {
			return {
				status: 0,
				msg: '成功删除'
			}
		} else {
			return {
				status: -2,
				msg: '删除数据失败'
			}
		}
	},
	updateFields: async function (event) {
		let tempData = {...event};
		delete tempData.id;
		const res = await cmsVideoCollection.doc(event.id).update(tempData);
		if (res.updated === 1) {
			return {
				status: 0,
				msg: '更新成功'
			}
		} else {
			return {
				status: -1,
				msg: '更新数据失败'
			}
		}
	},
	incLikeCount: async function(id, v) {
		let res = await cmsVideoCollection.where({
			_id: id
		}).update({
		  like_count: db.command.inc(v)
		})
		return res;
	},
	incCollectCount: async function(id, v) {
		let res = await cmsVideoCollection.where({
			_id: id
		}).update({
		  collect_count: db.command.inc(v)
		})
		return res;
	},
	getVideoList: async function(id) {
		const dbCmd = db.command
		const $ = dbCmd.aggregate
		const res = await cmsVideoCollection.aggregate()
								.lookup({
								  from: userDBName,
								  let: {
									user_id: '$uploadUser'
								  },
								  pipeline: $.pipeline()
									.match(dbCmd.expr(
									  $.eq(['$_id', '$$user_id'])
									))
									.project({
									  nickname: true,
									  username: true,
									  avatar_file: true,
									})
									.done(),
								  as: 'user_id'
								}).match({
									"_id": id
								}).end()
		return res;
	},
	getList: async function(pageNum, pageSize) {
		let curPageNum = pageNum
		let skipNum = curPageNum * pageSize
		const dbCmd = db.command
		const $ = dbCmd.aggregate
		const res = cmsVideoCollection.aggregate()
						.lookup({
						  from: userDBName,
						  let: {
							user_id: '$uploadUser'
						  },
						  pipeline: $.pipeline()
							.match(dbCmd.expr(
							  $.eq(['$_id', '$$user_id'])
							))
							.project({
							  nickname: true,
							  username: true,
							  avatar_file: true,
							})
							.done(),
						  as: 'user_id'
						}).match({
							"read_type": 1
						}).skip(skipNum).limit(pageSize).end()
		return res;
	},
	getMyList: async function(pageNum, pageSize, e) {
		const res = await cmsVideoCollection.where({
			'uploadUser': e.userId
		}).get();
		return res;
	},
	getListByIds: async function(ids) {
		const dbCmd = db.command;
		let res = await cmsVideoCollection.where({
			'_id': dbCmd.in(ids)
		}).field({
			_id: true,
			tags: true,
			like_count: true,
			collect_count: true,
			zhuanfa_count: true,
			title: true,
			description: true
		}).get();
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
