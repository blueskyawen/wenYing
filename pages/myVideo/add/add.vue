<template>
	<view class="add-video">
		<view v-if="step == 1" class="uni-uploader__files" :style="{ height: heighth + 'px' }">
			<view class="uni-uploader__file" v-if="src">
				<video :src="src" class="video-play" :show-fullscreen-btn="false" 
					:enable-play-gesture="true" :poster="videoFile.cover"></video>
			</view>
			<view class="add-uploader__input-box" v-else>
				<uni-icons type="plusempty" size="150" color="#e9e9eb" @tap="chooseFile"></uni-icons>
			</view>
			<view class="replace-uploader" v-if="src">
				<view class="ipder-icon">
					<view class="replace-up" @tap="chooseFile">
						<uni-icons type="videocam" size="45" color="#fff"></uni-icons>
					</view>
					<view class="replace-title">点击更改视频</view>
				</view>
			</view>
		</view>
		<view v-else class="form-content">
			<uni-forms ref="videoForm" :modelValue="formData" label-position="top" :rules="rules">
				<uni-forms-item label="标题" name="title" required>
					<uni-easyinput type="text" trim :maxlength="20" v-model="formData.title" placeholder="输入标题" />
				</uni-forms-item>
				<uni-forms-item label="描述内容" name="description" required>
					<uni-easyinput type="textarea" trim autoHeight :maxlength="200" 
						v-model="formData.description" placeholder="输入描述内容" />
				</uni-forms-item>
				<uni-forms-item label="话题" name="tags">
					<uni-data-select v-model="formData.tags" multiple wrap :localdata="tagOptions" 
							label="换行显示"></uni-data-select>
				</uni-forms-item>
			</uni-forms>
		</view>
		<view v-if="step == 1" class="bottom-actions">
			<button class="uni-button" @click="goBack">返回</button>
			<button  type="primary" class="uni-button" @click="nextStep">下一步</button>
		</view>
		<view v-else class="bottom-actions bottom-actions2">
			<button :disabled="uploading" class="uni-button" @click="goBack">取消</button>
			<button type="primary" :disabled="uploading" class="uni-button" @click="preStep">上一步</button>
			<button type="primary" :disabled="uploading" class="uni-button" @click="confirm">发布</button>
		</view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	import permision from "@/common/permission.js";
	// #endif
	const extNameList= ['mp4', 'avi', 'mov', 'rmvb', 'rm', 'flv', '3gp', 'wmv', 'mkv'];
	const sourceType = [
		['camera'],
		['album'],
		['camera', 'album']
	];
	const mediaTypes = ['image', 'video'];
	const cmsVideoCo = uniCloud.importObject('cms-video-co');
	const cmsTopicCollectDB = uniCloud.importObject('cms-topic-co', {
		customUI: true
	});
	export default {
		data() {
			return {
				heighth: 400,
				step: 1,
				extNames: extNameList.join(','),
				src: '',
				videoFile: {},
				sourceTypeIndex: 2,
				cameraList: [{
						value: 'back',
						name: '后置摄像头',
						checked: 'true'
					},
					{
						value: 'front',
						name: '前置摄像头'
					},
				],
				cameraIndex: 0,
				uploadType: 'video',
				uploading: false,
				uploadState: {
					percent: 0,
					status: 'waiting', // uploading, uploaded
					tip: '等待上传', // 上传中, 上传完成
				},
				storageProvider: 'internal' ,// qiniu
				cloudFileId: '',
				formData: {
					src: '',
					cover: '',
					title: '',
					description: '',
					alt: '',
					originalName: '',
					fileType: '',
					type: 'video',
					size: 0,
					resolution: {
						height: 0,
						width: 0
					},
					duration: 0,
					uploadUser: '',
					createDate: 0,
					storageProvider: '',
					tags: [],
					read_type: 1,
					like_count: 0,
					collect_count: 0,
					zhuanfa_count: 0
				},
				rules: {
					title: {
						rules: [{
							required: true,
							errorMessage: '标题不能为空'
						}]
					},
					description: {
						rules: [{
							required: true,
							errorMessage: '描述不能为空'
						}]
					}
				},
				tagOptions: [],
				tagList: [],
				usescore: 0
			}
		},
		onLoad(options) {
			console.log('add video == onload');
			this.usescore = options.usescore;
			// console.log('windowHeight='+ uni.getWindowInfo().windowHeight);
			// console.log('statusBarHeight='+ uni.getWindowInfo().statusBarHeight);
			this.heighth = uni.getWindowInfo().windowHeight - 67;
			this.getTagList();
		},
		computed: {
			filesStyle() {
				return {
					height: this.heighth + 'px'
				}
			},
			loginUserId() {
				return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
			}
		},
		methods: {
			getTagList() {
				cmsTopicCollectDB.getList().then(res => {
					this.tagList = res.data || [];
				})
			},
			goBack() {
				if (this.uploading) return;
				console.log(this.videoFile);
				console.log(this.formData);
				uni.navigateBack();
			},
			preStep() {
				if (this.uploading) return;
				this.step = 1;
			},
			nextStep() {
				console.log(this.videoFile);
				if (!this.src) {
					uni.showToast({
						title: '请先选择视频',
						icon: 'error'
					})
					return;
				}
				this.tagOptions = this.tagList.map(x => {
					return {
						value: x._id,
						text: x.name
					}
				});
				this.fillFormDataStep1();
				this.step = 2;
			},
			fillFormDataStep1() {
				//this.formData.originalName = this.videoFile.name;
				const ext = this.videoFile.name.includes('.') ? `${this.videoFile.name.split('.').pop().toLowerCase()}` : ''
				this.formData.fileType = ext;
				this.formData.duration = this.videoFile.duration;
				this.formData.size = this.videoFile.size;
				this.formData.resolution.height = this.videoFile.height;
				this.formData.resolution.width = this.videoFile.width;
				this.formData.uploadUser = this.loginUserId;
				this.formData.storageProvider = this.storageProvider;
				this.formData.originalName = this.videoFile.name;
			},
			async confirm() {
				// #ifdef APP-PLUS
				// TODO 选择相机或相册时 需要弹出actionsheet，目前无法获得是相机还是相册，在失败回调中处理
				if (this.sourceTypeIndex !== 2) {
					let status = await this.checkPermission();
					if (status !== 1) {
						return;
					}
				}
				// #endif
				console.log(this.videoFile);
				console.log(this.formData);
				if (this.formData.tags.length > 3) {
					uni.showToast({
						title: '最多选择3个话题'
					})
					return;
				}
				if (this.uploading) return;
				try {
					await this.$refs.videoForm.validate();
					this.uploading = true;
					uni.showLoading({
						title: '新增中...'
					})
					await this.checkDataSec();
					await this.startUpload();
					this.addVideo();
				} catch (e) {
					this.uploading = false;
					uni.hideLoading();
					console.error(JSON.stringify(e))
					if (e.detail && e.detail.action && e.detail.action == 'secCheck') {
						uni.showToast({
							title: e.errMsg || '文字内容存在违规, 请修改',
							icon: 'none',
							duration: 3000
						})
					}
				}
			},
			async checkDataSec() {
				const cmsSecCheckCo = uniCloud.importObject('cms-sec-check-co', {
				  customUI: true
				});
				const parallel = [];
				parallel.push(cmsSecCheckCo.checkContentSec(this.formData.title, '标题存在敏感词'));
				parallel.push(cmsSecCheckCo.checkContentSec(this.formData.description, '描述内容存在敏感词'));
				return Promise.all(parallel);	
			},
			chooseFile() {
				uni.chooseVideo({
					camera: this.cameraList[this.cameraIndex].value,
					sourceType: sourceType[this.sourceTypeIndex],
					extension: extNameList,
					maxDuration: 60,
					success: (res) => {
						console.log("chooseVideo == ")
						console.log(res)
						let tmpName = '';
						let tmpType = '';
						if (res.tempFile) {
							tmpName = res.tempFile.name || res.name;
							tmpType = res.tempFile.type || `video/${tmpName.split('.').pop()}`;
						} else {
							tmpName = res.tempFilePath.substring(res.tempFilePath.lastIndexOf('/') + 1);
							tmpType = `video/${tmpName.split('.').pop()}`;
						}
						this.videoFile = {
							name: tmpName,
							type: tmpType,
							path: res.tempFilePath,
							duration: res.duration,
							size: res.size,
							height: res.height,
							width: res.width,
							attributes: {
								duration: 0,
								height: 0,
								width: 0
							},
							url: '',
							cover: res.thumbTempFilePath || '',
							dateTime: Date.now()
						}
						if (!this.isAllowedFile(this.videoFile)) {
							uni.showToast({
								title: '选择的文件类型不符合要求',
								icon: 'none'
							})
							return;
						}
						if (res.size > 10485760) {
							uni.showToast({
								title: '选择的文件大小不超过10M',
								icon: 'none'
							})
							return;
						}
						this.src = res.tempFilePath;
						this.getVideoInfo(this.videoFile).then(res => {
							if (res) {
								this.videoFile.metadata = {...res};
							}

						})
					},
					fail: (err) => {
						// #ifdef MP
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
										content: '需要从您的相机或相册获取视频，请在设置界面打开相关权限',
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
			getVideoInfo(file) {
			  return new Promise(resolve => {
			    // #ifdef H5
			    if (!file['duration']) {
			      const video = document.createElement('video')
			      video.src = file.path
			      // 获取视频的长度/时间
			      video.addEventListener('loadedmetadata', () => {			
			        resolve({
						duration: video.duration,
						height: video.videoHeight,
						width: video.videoWidth
					})
			      })
			      return
			    }
			    // #endif
			    resolve('')
			  })
			},
			getFileMediaType(file) {
				const [mediaType = ''] = (file.type || file.fileType || file.mediaType || '').split('/')
				if (mediaTypes.includes(mediaType)) return mediaType
			
				const fileName = file.name || file.path || ''
				const ext = fileName.includes('.') ? `.${fileName.split('.').pop().toLowerCase()}` : ''
				if (extNameList.includes(ext)) return 'video'
				if (file.duration) return 'video'
				return ''
			},
			isAllowedFile(file) {
				const mediaType = this.getFileMediaType(file)
				const fileName = file.name || file.path || ''
				const ext = fileName.includes('.') ? `.${fileName.split('.').pop().toLowerCase()}` : ''
			
				if (mediaType && !mediaTypes.includes(mediaType)) {
					return false
				}
			
				if (mediaType && mediaType !== this.uploadType) {
					return false
				}
			
				if (!mediaType && ext) {
					return mediaTypes.includes(this.uploadType) && extNameList.includes(ext)
				}
			
				return true;
			},
			async startUpload() {
				console.log('startUpload')
				try {
					let result = await uniCloud.uploadFile({
						filePath: this.videoFile.path,
						cloudPathAsRealPath: true,
						cloudPath: `cms-videos/${Date.now()}_${this.videoFile.name}`,
						fileType: this.uploadType,
						onUploadProgress: (progressEvent) => {
							if (progressEvent.loaded < 100) {
								this.uploadState.status = 'uploading';
								this.uploadState.tip = '上传中';
							}
							this.uploadState.percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
						}
					});
					this.videoFile.url = result.fileID;
					await this.setVideoCover(this.videoFile);
					// this.uploading = false;
				} catch (e) {
					uni.showToast({
						title: '上传失败',
						icon: 'error'
					});
					this.uploading = false;
					uni.hideLoading();
					throw new Error('上传失败')
				}
			},
			async setVideoCover(file) {
				try {
					const cover = await this.cropVideoCover(file.url, file.cover);
					if (!cover) return;
					file.cover = cover;
				} catch(e) {
					// console.error('Failed to crop video cover', e)
					throw new Error('Failed to crop video cover')
				} 
			},
			async cropVideoCover(url, cover) {
			  // #ifdef H5
			  const isTcbCloud = url.startsWith('cloud://')
			  const isAlipayCloud = url.startsWith('cloud://env-')
			
			  if (isTcbCloud && !isAlipayCloud) return ''
			
			  const ossProcessRule = 'video/snapshot,t_0,f_jpg,w_0,h_0,m_fast'
			  let cropUrl = `${url}?x-oss-process=${ossProcessRule}`
			
			  if (isAlipayCloud) {
			    const res = await uniCloud.getTempFileURL({
			      fileList: [url]
			    })
			    if (res.fileList && res.fileList.length) {
			      url = res.fileList[0].tempFileURL
			      const separator = url.includes('?') ? '&' : '?'
			      cropUrl = `${url}${separator}x-oss-process=${ossProcessRule}`
			    }
			  }
			
			  const imageBlob = await this.fetchCoverBlob(cropUrl)
			  const imageBlobUrl = URL.createObjectURL(imageBlob)
			
			  try {
			    const uploadRes = await uniCloud.uploadFile({
			      filePath: imageBlobUrl,
			      cloudPath: `cms-videos/cover-${Date.now()}.jpg`,
			      fileType: 'image'
			    })
			
			    return uploadRes.fileID
			  } catch(e) {
				  throw new Error('Failed to crop video cover')
			  } finally {
			    URL.revokeObjectURL(imageBlobUrl)
			  }
			  // #endif
			  // #ifdef MP
			  if (cover) {
				  try {
					  let ext = cover.split('.').pop().toLowerCase();
					  const uploadRes = await uniCloud.uploadFile({
					    filePath: cover,
					    cloudPath: `cms-videos/cover-${Date.now()}.${ext}`,
					    fileType: 'image'
					  })
					  			
					  return uploadRes.fileID
				  } catch(e) {
					  throw new Error('Failed to crop video cover')
				  }
			  }
			  // #endif
			  return ''
			},
			async fetchCoverBlob(url) {
				const image = await fetch(url)
				if (!image.ok) {
				  throw new Error(`截取视频封面失败，状态码: ${image.status}`)
				}

				const blob = await image.blob()
				if (!this.isValidCoverBlob(blob)) {
				  throw new Error('截取视频封面失败，返回内容不是有效图片')
				}

				return blob
			},
			isValidCoverBlob(blob) {
				if (!blob || !blob.size) return false
				if (!blob.type) return true
				return blob.type.startsWith('image/')
			},
			addVideo() {
				console.log(this.videoFile);
				this.formData.src = this.videoFile.url;
				this.formData.cover = this.videoFile.cover;
				let addTmpData = {...this.formData};
				addTmpData.createDate = Date.now();
				cmsVideoCo.add(addTmpData).then(res => {
					uni.showToast({
						title: '保存成功',
						icon: "success"
					});
					uni.$emit('add-video-sucess',{usescore: this.usescore});
					setTimeout(() => {
						uni.navigateBack();
					}, 1000);
				}).finally(() => {
					uni.hideLoading();
					this.uploading = false;
				})
			}
			// #ifdef APP-PLUS
			,
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
			}
			// #endif
		}
	}
</script>

<style lang="scss" scoped>
.add-video {
	display: flex;
	flex-direction: column;
	width: 100%;
	.form-content {
		box-sizing: border-box;
		padding: 12px;
	}
	.uni-uploader__files {
		width: 100%;
		height: 320px;
		box-sizing: border-box;
		position: relative;
		.add-uploader__input-box {
			width: 100%;
			height: 100%;
			border: solid 1px #f0f0f0;
			box-sizing: border-box;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.uni-uploader__file {
			width: 100%;
			height: 100%;
			.video-play {
				width: 100%;
				height: 100%;
			}
		}
		.replace-uploader {
			position: absolute;
			top: 30%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			z-index: 2;
			.ipder-icon {
				display: inline-flex;
				flex-direction: column;
				align-items: center;
			}
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
	.bottom-actions {
		border-top: solid 1px #ededed;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px;
		box-sizing: border-box;
		justify-content: space-between;
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		z-index: 1000;
		background: #fff;
		.uni-button {
			width: 45%;
		}
		&.bottom-actions2 {
			justify-content: space-around;
			.uni-button {
				width: 30%;
			}
		}
	}
}
</style>