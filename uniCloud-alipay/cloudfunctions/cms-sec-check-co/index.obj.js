// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const {safeRequire, checkContentSecurityEnable} = require('./util.js');
// 引入uni-config-center模块
const createConfig = safeRequire('uni-config-center')
// 获取uni-cms插件的配置
const config = createConfig({
	pluginId: 'uni-cms'
}).config()

const errmsgMap = {
	'uni-sec-check-invoke-out-of-limit': '接口调用频率/次数超出限制',
	'uni-sec-check-system-error': '系统错误',
	'uni-sec-check-invalid-appid': 'appid不正确',
	'uni-sec-check-invalid-appsecret': 'appsecret不正确',
	'uni-sec-check-invalid-access-token': 'accessToken不正确',
	'uni-sec-check-access-token-expired': 'accessToken已过期',
	'uni-sec-check-invalid-image-size': '图片大小超出限制',
	'uni-sec-check-invalid-request-url': '错误的请求地址',
	'uni-sec-check-empty-image': '图片文件内容为空',
	'uni-sec-check-param-required': '缺少必要参数',
	'uni-sec-check-invalid-request-param': '错误的请求参数',
	'uni-sec-check-invalid-request-format': '错误的请求格式',
	'uni-sec-check-invalid-file-type': '错误的文件类型',
	'uni-sec-check-invalid-media-size': '图片大小超出限制'
}

module.exports = {
	_before: function () { // 通用预处理器
		console.warn('unicheck_before: ' + JSON.stringify(config.contentSecurity))
		// 如果内容安全配置存在
		if (config.contentSecurity && !this.uniSecCheck) {
			// 引入内容安全检测模块
			const UniSecCheck = safeRequire('uni-sec-check')
			 // 实例化内容安全检测模块
			this.uniSecCheck = new UniSecCheck({
				provider: 'mp-weixin', // 使用微信小程序的内容安全检测
				requestId: this.getUniCloudRequestId(), // 请求ID为当前云函数请求ID
				appId: '__UNI__E93A4F9'
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
			// passErrcode = ['uni-sec-check-invalid-media-size', 
			// 				'uni-sec-check-invoke-out-of-limit', 
			// 				'uni-sec-check-invalid-image-size'];
			if (res.errCode == 'uni-sec-check-invoke-out-of-limit') {
				return {
					errCode: 0
				}
			} else {
				// 如果内容安全检测异常，抛出异常并打印错误信息
				throw {
					errCode: res.errCode,
					errMsg: errmsgMap[res.errCode] ? errmsgMap[res.errCode] : '内容安全检测异常, 请修改后提交'
				}
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
			if (res.errCode == 'uni-sec-check-invoke-out-of-limit') {
				return {
					errCode: 0
				}
			} else {
				throw {
					errCode: res.errCode,
					errMsg: errmsgMap[res.errCode] ? errmsgMap[res.errCode] : '内容安全检测异常, 请修改后提交'
				}
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
