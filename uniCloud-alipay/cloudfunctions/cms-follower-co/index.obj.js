// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
const cmsFollowerCollection = db.collection('cms-followers')
module.exports = {
	_before: function () { // 通用预处理器

	},
	get: async function({user_id}) {
		const res = await cmsFollowerCollection.where({
			'user_id': user_id
		}).get();
		return res;
	},
	updateFollower: async function(event) {
		let id = event._id;
		let followers = event.followers;
		const res = await cmsFollowerCollection.doc(id).update({
			"followers": followers
		})
		return res;
	},
	addFollower: async function(event) {
		let user_id = event.user_id;
		let addData = {...event.addData};
		
		const res = await cmsFollowerCollection.where({
			'user_id': user_id
		}).get();
		if (res.data && res.data.length) {
			let fdData =  res.data[0];
			let newList = fdData.followers || []
			newList.push(addData)
			let res2 = await cmsFollowerCollection.doc(fdData._id)
												.update({
												  followers: newList
												})
			return res2;
		} else {
			const res2 = await cmsFollowerCollection.add({
				user_id: user_id,
				followers: [].concat(addData)
			})
			return {
				status: res2.id ? 0 : -2,
				id: res2.id || ''
			}
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
