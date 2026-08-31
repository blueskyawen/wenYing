// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
const cmsWorksCollection = db.collection('opendb-news-articles')
module.exports = {
	_before: function () { // 通用预处理器

	},
	getList: async function({id}) {
		const res = await cmsWorksCollection.where({
			'user_id': id
		}).get();
		return res;
	},
	get: async function({id}) {
		const res = await cmsWorksCollection.doc(id).get();
		return res;
	},
	add: async function(event) {
		let addData = {
			...event
		}
		const res = await cmsWorksCollection.add(addData)
		return res;
	},
	update: async function (event, id) {
		let tempData = {...event};
		const res = await cmsWorksCollection.doc(id).update(tempData);
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
	updateStatus: async function (event) {
		let tempData = {...event};
		delete tempData.id;
		const res = await cmsWorksCollection.doc(event.id).update(tempData);
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
	delete: async function(event) {
		let res = await cmsWorksCollection.doc(event.id).remove()
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
	delCloudFile: async function(event) {
		await uniCloud.deleteFile({
			fileList: event.fileList
		})
		return {
			status: 0
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
