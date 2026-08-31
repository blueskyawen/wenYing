<template>
	<view class='wrapper'>
		<view class='toolbar' @tap="format">
			<view class="iconfont icon-undo" @tap="undo"></view>
			<view class="iconfont icon-redo" @tap="redo"></view>
			<view :class="formats.header === 1 ? 'ql-active' : ''" class="iconfont icon-format-header-1" data-name="header"
			 :data-value="1"></view>
			<view :class="formats.bold ? 'ql-active' : ''" class="iconfont icon-zitijiacu" data-name="bold"></view>
			<view :class="formats.italic ? 'ql-active' : ''" class="iconfont icon-zitixieti" data-name="italic"></view>
			<view :class="formats.underline ? 'ql-active' : ''" class="iconfont icon-zitixiahuaxian" data-name="underline"></view>
			<view :class="formats.strike ? 'ql-active' : ''" class="iconfont icon-zitishanchuxian" data-name="strike"></view>
			<view :class="formats.align === 'left' ? 'ql-active' : ''" class="iconfont icon-zuoduiqi" data-name="align"
			 data-value="left"></view>
			<view :class="formats.align === 'center' ? 'ql-active' : ''" class="iconfont icon-juzhongduiqi" data-name="align"
			 data-value="center"></view>
			<view :class="formats.align === 'right' ? 'ql-active' : ''" class="iconfont icon-youduiqi" data-name="align"
			 data-value="right"></view>
			<view :class="formats.align === 'justify' ? 'ql-active' : ''" class="iconfont icon-zuoyouduiqi" data-name="align"
			 data-value="justify"></view>
			<view :class="formats.lineHeight ? 'ql-active' : ''" class="iconfont icon-line-height" data-name="lineHeight"
			 data-value="2"></view>
			<view :class="formats.letterSpacing ? 'ql-active' : ''" class="iconfont icon-Character-Spacing" data-name="letterSpacing"
			 data-value="2em"></view>
			<view :class="formats.marginTop ? 'ql-active' : ''" class="iconfont icon-722bianjiqi_duanqianju" data-name="marginTop"
			 data-value="20px"></view>
			<view :class="formats.previewarginBottom ? 'ql-active' : ''" class="iconfont icon-723bianjiqi_duanhouju" data-name="marginBottom"
			 data-value="20px"></view>
			<view class="iconfont icon-clearedformat" @tap="removeFormat"></view>
			<view :class="formats.fontSize === '24px' ? 'ql-active' : ''" class="iconfont icon-fontsize" data-name="fontSize"
			 data-value="24px"></view>

			<view :class="formats.list === 'ordered' ? 'ql-active' : ''" class="iconfont icon-youxupailie" data-name="list"
			 data-value="ordered"></view>
			<view :class="formats.list === 'bullet' ? 'ql-active' : ''" class="iconfont icon-wuxupailie" data-name="list"
			 data-value="bullet"></view>

			<view class="iconfont icon-outdent" data-name="indent" data-value="-1"></view>
			<view class="iconfont icon-indent" data-name="indent" data-value="+1"></view>
			<view class="iconfont icon-fengexian" @tap="insertDivider"></view>
			<view class="iconfont icon-charutupian" @tap="insertImage"></view>
			<view class="iconfont icon-shanchu" @tap="clear"></view>
		</view>

		<view class="editor-wrapper">
			<editor id="editor" class="ql-container" placeholder="开始输入..." showImgSize showImgToolbar showImgResize
			 @statuschange="onStatusChange" :read-only="readOnly" @ready="onEditorReady">
			</editor>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			value: {
			    type: String
			},
			dir: {
			    type: String,
				default: ''
			}
		},
		data() {
			return {
				readOnly: false,
				formats: {},
				html: '',
				deltaOps: [],
				insertImgs: []
			}
		},
		watch: {
		    value: function(newvar) {
		        this.html = newvar;
		    },
		    html: function(newvar) {
		        if (this.editorCtx) {
		            this.editorCtx.setContents({
		                html: this.html
		            });
		        }
		    }
		},
		methods: {
			onBlur() {
				this.getContents();
			},
			getContents() {
				return new Promise((resolve, reject) => {
					this.editorCtx.getContents({
					    success: res => {
					        this.$emit('input', res.html);
							this.deltaOps = res.delta ? (res.delta.ops || []) : [];
							resolve({...res})
					    }
					});
				})
			},
			readOnlyChange() {
				this.readOnly = !this.readOnly
			},
			onEditorReady() {
				// #ifdef MP-BAIDU
				this.editorCtx = requireDynamicLib('editorLib').createEditorContext('editor');
				// #endif
				// #ifdef APP-PLUS || MP-WEIXIN || H5
				uni.createSelectorQuery().in(this).select('#editor').context((res) => {
					this.editorCtx = res.context;
					if (this.html) {
					    this.editorCtx.setContents({
					        html: this.html
					    });
					}
				}).exec();
				// #endif
			},
			undo() {
				this.editorCtx.undo()
			},
			redo() {
				this.editorCtx.redo()
			},
			format(e) {
				let {
					name,
					value
				} = e.target.dataset
				if (!name) return
				// console.log('format', name, value)
				this.editorCtx.format(name, value)

			},
			onStatusChange(e) {
				const formats = e.detail
				this.formats = formats
			},
			insertDivider() {
				this.editorCtx.insertDivider({
					success: function() {
						console.log('insert divider success')
					}
				})
			},
			clear() {
				uni.showModal({
					title: '清空编辑器',
					content: '确定清空编辑器全部内容？',
					success: res => {
						if (res.confirm) {
							this.editorCtx.clear({
								success: function(res) {
									console.log("clear success")
								}
							})
						}
					}
				})
			},
			removeFormat() {
				this.editorCtx.removeFormat()
			},
			insertImage() {
				uni.chooseImage({
					count: 1,
				    success: (res) => {
						if (res.tempFiles[0].size > 3145728) {
							uni.showToast({
								title: '上传图片大小不能大于3MB',
								duration: 2000
							});
							return;
						}
						
						this.insertImgs.push({
							path: res.tempFilePaths[0],
							name: res.tempFiles[0].name
						})
						
						this.editorCtx.insertImage({
						    src: res.tempFilePaths[0],
						    alt: '图像'
						});
						// let promises = [];
						// uni.showLoading({
						// 	title: "图片上传中"
						// });
				  //       res.tempFilePaths.map((filePath, index) => {
						// 	let fileName = res.tempFiles[index].name || filePath;
						// 	let ext = fileName.split(".").pop();
						// 	let fname = (Math.random() + '').substr(2) + "." + ext;
						// 	let cpath = this.dir + '/' + fname;
						// 	let uploadPromise = this.cloudUploadFile(filePath, cpath);
						// 	promises.push(uploadPromise)
						// });
						// Promise.all(promises).then(res => {
						// 	console.log(res);
						// 	uni.hideLoading();
						// 	this.uploadCallback(res);
						// });
				    }
				});
			},
			async uploadImageFiles() {
				let imgs = [];
				let deltaImgs = this.deltaOps.filter(x => x.insert && x.insert.image).map(y => y.insert.image);
				let newInsertImgs = this.insertImgs.filter(x => deltaImgs.includes(x.path))
				console.log(newInsertImgs)
				console.log('newInsertImgs')
				for (let index = 0; index < newInsertImgs.length; index++) {
					let tempFilePath = newInsertImgs[index].path;
					let fileName = newInsertImgs[index].name || tempFilePath
					let ext = fileName.split(".").pop();
					let time = Date.now();
					let randomT = (Math.random() + '').substr(5);
					let fname = `${time}_${randomT}.${ext}`;
					let cpath = this.dir + '/' + fname;
					let result = await this.cloudUploadFile(tempFilePath, cpath);
					imgs.push({
						...result,
						filePath: tempFilePath
					})
				}
				this.insertImgs = this.insertImgs.filter(x => !imgs.find(y => y.path == x.filePath));
				console.log(this.insertImgs)
				return imgs;
			},
			cloudUploadFile(filePath, cpath) {
				return new Promise((resolve, reject) => {
					let result = uniCloud.uploadFile({
						filePath: filePath,
						cloudPath: cpath,
						onUploadProgress: pro => {},
						success: res => {
							// console.log("cloudUploadFile", res)
							if (res.fileID.indexOf("cloud://") != -1) {
								//用这个转换一下，有一个隐藏的好处，可以等待文件发布到cdn，避免立即访问不到
								uniCloud.getTempFileURL({
									fileList: [res.fileID]
								}).then(res2 => {
									resolve({
										cloudPath: res.fileID,
										url: res2.fileList[0].tempFileURL,
									});
								})
							} else {
								//延时返回，可以等待文件发布到cdn，避免立即访问不到
								setTimeout(() => {
									resolve({
										cloudPath: res.fileID,
										url: res.fileID
									});
								}, 200);
							}
						},
						fail: () => {
							reject(false);
						}
					});
				});
			},
			uploadCallback(srcs) {
				srcs.forEach(url => {
					this.editorCtx.insertImage({
					    src: url,
					    alt: '图像'
					});
				})
			}
		},
		onLoad() {
			// #ifndef MP-BAIDU
			uni.loadFontFace({
				family: 'Pacifico',
				source: 'url("https://sungd.github.io/Pacifico.ttf")'
			})
			// #endif
		},
	}
</script>

<style>
	@import "./editor-icon.css";

	.wrapper {
		box-sizing: border-box;
		border: 1px solid #e5e5e5;
		border-radius: 4px;
	}

	.editor-wrapper {
		height: 350px;
		background: #fff;
		border-radius: 4px;
	}

	.iconfont {
		display: inline-block;
		padding: 8px 8px;
		width: 24px;
		height: 24px;
		cursor: pointer;
		font-size: 20px;
	}

	.toolbar {
		box-sizing: border-box;
		border-bottom: 1px solid #e5e5e5;
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
	}


	.ql-container {
		box-sizing: border-box;
		padding: 12px 15px;
		width: 100%;
		height: 100%;
		font-size: 16px;
		line-height: 1.5;
	}

	.ql-active {
		color: #06c;
	}
</style>
