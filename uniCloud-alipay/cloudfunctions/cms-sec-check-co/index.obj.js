// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const {safeRequire, checkContentSecurityEnable} = require('./util.js');
// 引入uni-config-center模块
const createConfig = safeRequire('uni-config-center')
// 获取uni-cms插件的配置
const config = createConfig({
	pluginId: 'uni-cms'
}).config()

module.exports = {
	_before: function () { // 通用预处理器
		console.warn('unicheck_before: ' + JSON.stringify(config.contentSecurity))
		// 如果内容安全配置存在
		if (config.contentSecurity) {
			// 引入内容安全检测模块
			const UniSecCheck = safeRequire('uni-sec-check')
			 // 实例化内容安全检测模块
			this.uniSecCheck = new UniSecCheck({
				provider: 'mp-weixin', // 使用微信小程序的内容安全检测
				requestId: this.getUniCloudRequestId() // 请求ID为当前云函数请求ID
			})
		}
	},
	async checkImageSec (image, errorMsg) {
		// 检查内容安全是否开启
		// 如果内容安全未开启，则直接返回一个对象，包含错误码为0。表示检测跳过
		if (!config.contentSecurity) {
			return {
				errCode: 0
			}
		}
		console.warn('checkImageSec: ' + JSON.stringify(config.contentSecurity))
		let imgSrc = image;
		// 处理cloud://开头的链接
		if (image.startsWith('cloud://')) {
			const res = await uniCloud.getTempFileURL({
				fileList: [imgSrc]
			})
		
			if (res.fileList && res.fileList.length > 0) {
				imgSrc = res.fileList[0].tempFileURL
			}
		}
		console.log('image: ' + imgSrc)
		// 调用内容安全检测模块进行图片检测
		const res = await this.uniSecCheck.imgSecCheck({
			image: imgSrc, // 图片url
			scene: 1, // 表示检测场景为资料场景
			version: 1 // 表示使用内容安全检测API的版本为1
		})

		// 如果图片违规，删除图片并抛出异常
		if (res.errCode === this.uniSecCheck.ErrorCode.RISK_CONTENT) {
			await uniCloud.deleteFile({
				fileList: [image]
			})

			throw {
				errCode: 'uni-cms-risk-content',
				errMsg: errorMsg ? `${errorMsg}, 图片已删除, 请修改后提交` : '图片违规已删除, 请修改后提交'
			}
		} else if (res.errCode !== 0) {
			// 如果内容安全检测异常，抛出异常并打印错误信息
			throw {
				errCode: res.errCode,
				errMsg: errorMsg ? `${errorMsg}, 请修改后提交` : '内容安全检测异常, 请修改后提交'
			}
		}

		return {
			errCode: 0
		}
	},
	async checkContentSec (content, errorMsg) {
		// 检查内容安全是否开启
		// 如果内容安全未开启，则直接返回一个对象，包含错误码为0。表示检测跳过
		if (!config.contentSecurity) {
			return {
				errCode: 0
			}
		}
		console.warn('checkContentSec: ' + JSON.stringify(config.contentSecurity))
		// 调用内容安全检测模块进行图片检测
		const res = await this.uniSecCheck.textSecCheck({
			content,
			scene: 1, // 表示检测场景为资料场景
			version: 1 // 表示使用内容安全检测API的版本为1
		})
		// 如果存在敏感词，抛出异常
		if (res.errCode === this.uniSecCheck.ErrorCode.RISK_CONTENT) {
			throw {
				errCode: res.errCode,
				errMsg: errorMsg ? `${errorMsg}, 请修改后提交` : '内容安全检测异常, 请修改后提交'
			}
		} else if (res.errCode !== 0) {
			console.error(res)
			throw {
				errCode: res.errCode,
				errMsg: errorMsg ? `${errorMsg}, 请修改后提交` : '内容安全检测异常, 请修改后提交'
			}
		}

		return {
			errCode: 0
		}
	},
	_after: function (error, result) {
		console.error('unicheck_after')
		if (error) {
			return {
				errCode: error.errCode || -1,
				errMsg: error.errMsg || error.message,
				action: 'secCheck'
			}
		}

		return result
	}
}
