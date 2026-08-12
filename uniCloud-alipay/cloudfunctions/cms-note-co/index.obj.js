// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
const cmsNoteCollection = db.collection('cms-notes')
const userDBName = 'uni-id-users'
module.exports = {
	_before: function () { // 通用预处理器

	},
	getList: async function({id}) {
		const res = await cmsNoteCollection.where({
			'user_id': id
		}).get();
		return res;
	},
	add: async function(event) {
		let addData = {
			...event
		}
		const res = await cmsNoteCollection.add(addData)
		return res;
	},
	get: async function({id}) {
		const res = await cmsNoteCollection.doc(id).get();
		return res;
	},
	update: async function (event, id) {
		let tempData = {...event};
		const res = await cmsNoteCollection.doc(id).update(tempData);
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
	getSearchList: async function(pageNum, pageSize, e) {
		let curPageNum = pageNum > 0 ? pageNum - 1 : 0
		let skipNum = curPageNum * pageSize
		const dbCmd = db.command
		const $ = dbCmd.aggregate
		const res = cmsNoteCollection.aggregate()
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
							  nickname: true
							})
							.done(),
						  as: 'user_id'
						}).match({
							"publish_date": dbCmd.gte(e.start).and(dbCmd.lte(e.end))
						}).skip(skipNum).limit(pageSize).end()
			return res;
	},
	getSearch: async function(pageNum, pageSize) {
		let curPageNum = pageNum > 0 ? pageNum - 1 : 0
		let skipNum = curPageNum * pageSize
		const dbCmd = db.command
		const $ = dbCmd.aggregate
		const res = cmsNoteCollection.aggregate()
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
							  nickname: true
							})
							.done(),
						  as: 'user_id'
						}).skip(skipNum).limit(pageSize).end()
			return res;
	},
	getOne: async function({id}) {
		const dbCmd = db.command
		const $ = dbCmd.aggregate
		const res = cmsNoteCollection.aggregate()
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
							  nickname: true
							})
							.done(),
						  as: 'user_id'
						}).match({
							"_id": id
						}).end()
			return res;
	},
	delete: async function(event) {
		let res = await cmsNoteCollection.doc(event.id).remove()
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
