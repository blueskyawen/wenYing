<template>
	<view class="add-note">
		<view class="form-item">
			<view class="uni-uploader__files">
				<block v-for="(image,index) in imageList" :key="index">
					<view class="uni-uploader__file">
						<image mode="aspectFit" class="uni-uploader__img" :src="image" :data-src="image" @tap="previewImage"></image>
					</view>
				</block>
				<view class="add-uploader__input-box" v-if="!imageList.length">
					<uni-icons type="plusempty" size="100" color="#e9e9eb" @tap="chooseImage"></uni-icons>
				</view>
				<view class="replace-uploader" v-if="imageList.length">
					<view class="replace-up" @tap="chooseImage">
						<uni-icons type="image" size="35" color="#fff"></uni-icons>
					</view>
					<view class="replace-title">点击更改图片</view>
				</view>
			</view>
<!-- 			<uni-file-picker file-mediatype="image" file-extname="jpg,png" mode="grid" :limit="1"
				return-type="object" v-model="formData.coverFile" :image-styles="imageStyles"></uni-file-picker> -->
		</view>
		<view class="form-item-text">
			<uni-easyinput type="textarea" autoHeight v-model="formData.content" placeholder="输入文字" :maxlength="300"></uni-easyinput>
		</view>
		<view class="uni-button-group">
			<button type="primary" class="uni-button" @click="submit">发表</button>
			<button class="uni-button" @click="goBack">返回</button>
		</view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	import permision from "@/common/permission.js";
	// #endif
	import parseImageUrl from "@/common/parseImageUrl.js";
	const sourceType = [
		['camera'],
		['album'],
		['camera', 'album']
	];
	const cmsNotesDB = uniCloud.importObject('cms-note-co');
	export default {
		data() {
			return {
				formData: {
					"cover": '',
					"content": '',
					"user_id": '',
					"publish_date": "",
					"last_modify_date": "",
				},
				imageStyles:{
					width: '100%',
					height: '320'
				},
				rules: [],
				isInOper: false,
				imageList: [],
				imageFiles: [],
				sourceType: ['camera', 'album'],
				sizeType: ['compressed', 'original'],
				sourceTypeIndex: 2,
				imageUrls: [],
				id: '',
				relateId: ''
			}
		},
		computed: {
			loginUserId() {
				return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
			},
		},
		onLoad(options) {
			this.id = options.id;
			this.relateId = options.relateId;
			if (this.id) {
				this.getEditNote();
				uni.setNavigationBarTitle({
				  title: '编辑小记'
				})
			} else if (this.relateId) {
				this.getRelateNote();
			} else {
				this.formData.user_id = this.loginUserId;		
			}
		},
		onUnload() {
			this.imageList = [];
		},
		methods: {
			async getRelateNote() {
				let res = await cmsNotesDB.get({ id: this.relateId })
				let temp = res.data && res.data[0] ? res.data[0] : null;
				if (temp) {
					this.formData.cover = temp.cover;
					this.formData.content = temp.content;
					this.formData.user_id = this.loginUserId;
					this.imageUrls = await parseImageUrl([temp.cover]);
					this.imageList = this.imageUrls.map(x => x.src);
				}
			},
			async getEditNote() {
				let res = await cmsNotesDB.get({ id: this.id })
				let temp = res.data && res.data[0] ? res.data[0] : null;
				if (temp) {
					this.formData.cover = temp.cover;
					this.formData.content = temp.content;
					this.formData.user_id = temp.user_id;
					this.formData.publish_date = temp.publish_date;
					this.imageUrls = await parseImageUrl([temp.cover]);
					this.imageList = this.imageUrls.map(x => x.src);
				}
			},
			submit() {
				if (this.isInOper) return;
				if (this.imageList.length == 0) {
					uni.showToast({
						title: '图片不可缺少',
						duration: 1000
					})
					return;
				}
				if (!this.formData.content) {
					uni.showToast({
						title: '文字内容不可为空',
						duration: 1000
					})
					return;
				}
				this.isInOper = true;
				let filePath, tempFile;
				if ((this.id || this.relateId) && this.imageUrls[0].src === this.imageList[0]) {
					// 编辑时没有更改图片
					this.submitForm();
				} else {
					// 新增, 编辑时更改了图片
					filePath = this.imageList[0];
					tempFile = this.imageFiles[0];
				}
				//console.log(this.imageList)
				//console.log(this.formData);
				let that = this;
				uniCloud.uploadFile({
					filePath: filePath,
					cloudPath: `cms-notes/${Date.now()}_${tempFile.name}`,
					onUploadProgress() {},
					success(e) {
						that.formData.cover = e.fileID;
						that.submitForm();
					},
					fail() {
						that.isInOper = false;
					},
					complete() {}
				});
			},
			submitForm() {
				let addData = {...this.formData};
				addData['last_modify_date'] = Date.now();
				if (!this.id) {
					addData['publish_date'] = addData['last_modify_date'];
				}				
				uni.showLoading({
					title: '发表中'
				})
				if (this.id) {
					this.procEdit(addData);
				} else {
					this.procAdd(addData);
				}
			},
			procEdit(addData) {
				cmsNotesDB.update(addData, this.id).then(res => {
					if (res.status == 0) {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
						uni.$emit('add-note-sucess',{});
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					} else {
						uni.showToast({
							title: res.msg,
							icon: "error"
						});
					}
				}).finally(() => {
					uni.hideLoading();
					this.isInOper = false;
				})
			},
			procAdd(addData) {
				cmsNotesDB.add(addData).then(res => {
					uni.showToast({
						title: '保存成功',
						icon: "none"
					});
					uni.$emit('add-note-sucess',{});
					setTimeout(() => {
						uni.navigateBack();
					}, 1000);
				}).finally(() => {
					uni.hideLoading();
					this.isInOper = false;
				})
			},
			goBack() {
				uni.navigateBack();
			},
			previewImage(e) {
				var current = e.target.dataset.src
				uni.previewImage({
					current: current,
					urls: this.imageList
				})
			},
			// #ifdef APP-PLUS
			async checkPermission(code) {
				let type = code ? code - 1 : this.sourceTypeIndex;
				let status = permision.isIOS ? await permision.requestIOS(sourceType[type][0]) :
					await permision.requestAndroid(type === 0 ? 'android.permission.CAMERA' :
						'android.permission.READ_EXTERNAL_STORAGE');
			
				if (status === null || status === 1) {
					status = 1;
				} else {
					uni.showModal({
						content: "没有开启权限",
						confirmText: "设置",
						success: function(res) {
							if (res.confirm) {
								permision.gotoAppSetting();
							}
						}
					})
				}
			
				return status;
			},
			// #endif
			chooseImage: async function() {
				// #ifdef APP-PLUS
				// TODO 选择相机或相册时 需要弹出actionsheet，目前无法获得是相机还是相册，在失败回调中处理
				if (this.sourceTypeIndex !== 2) {
					let status = await this.checkPermission();
					if (status !== 1) {
						return;
					}
				}
				// #endif
				const imageExtname = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
				uni.chooseImage({
					sourceType: sourceType[this.sourceTypeIndex],
					sizeType: this.sizeType,
					extension: imageExtname,
					count: 1,
					success: (res) => {
						if (res.tempFiles.length) {
							let file = res.tempFiles[0];
							if (file.size > 3145728) {
								uni.showToast({
									title: '上传图片大小不能大于3MB',
									duration: 2000
								});
							} else {
								this.imageList = res.tempFilePaths;
								this.imageFiles = res.tempFiles;
							}
						}
						// this.imageList = this.imageList.concat(res.tempFilePaths);
					},
					fail: (err) => {
						console.log("err: ",err);
						// #ifdef APP-PLUS
						if (err['code'] && err.code !== 0 && this.sourceTypeIndex === 2) {
							this.checkPermission(err.code);
						}
						// #endif
						// #ifdef MP
						if(err.errMsg.indexOf('cancel') !== '-1'){
							return;
						}
						uni.getSetting({
							success: (res) => {
								let authStatus = false;
								switch (this.sourceTypeIndex) {
									case 0:
										authStatus = res.authSetting['scope.camera'];
										break;
									case 1:
										authStatus = res.authSetting['scope.album'];
										break;
									case 2:
										authStatus = res.authSetting['scope.album'] && res.authSetting['scope.camera'];
										break;
									default:
										break;
								}
								if (!authStatus) {
									uni.showModal({
										title: '授权失败',
										content: '需要从您的相机或相册获取图片，请在设置界面打开相关权限',
										success: (res) => {
											if (res.confirm) {
												uni.openSetting()
											}
										}
									})
								}
							}
						})
						// #endif
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.add-note {
	background-color: #fff;
	box-sizing: border-box;
	padding: 2rpx;
	box-sizing: border-box;
	.form-item {
		width: 100%;
	}
	.form-item-text {
		width: 100%;
		margin-top: 20rpx;
	}
	.uni-uploader__files {
		width: 100%;
		//border: solid 1px;
		min-height: 240px;
		box-sizing: border-box;
		position: relative;
		.uni-uploader__file {
			width: 100%;
			height: 100%;
			.uni-uploader__img {
				width: 100%;
				height: 100%;
				::v-deep img {
					position: relative;
					opacity: initial;
				}
			}
		}
		.add-uploader__input-box {
			width: 100%;
			height: 100%;
			border: solid 1px #f0f0f0;
			box-sizing: border-box;
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 240px;
		}
		.replace-uploader {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			display: inline-flex;
			flex-direction: column;
			align-items: center;
			.replace-up {
				display: inline-flex;
				justify-content: center;
				align-items: center;
				width: 50px;
				height: 50px;
				border-radius: 50%;
				background-color: #909399;
				opacity: 0.5;
			}
			.replace-title {
				font-size: 14px;
				margin-top: 8px;
				color: #fff;
			}
		}
	}
	.uni-button-group {
		display: flex;
		justify-content: space-between;
		padding: 15px;
		box-sizing: border-box;
		.uni-button {
			width: 45%;
		}
	}
}
</style>