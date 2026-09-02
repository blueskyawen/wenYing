<template>
	<view class="add-page">
		<uni-forms ref="addForm" :value="formData" validateTrigger="bind" label-position="top" :rules="rules">
			<uni-forms-item name="title" label="标题" required>
				<uni-easyinput placeholder="文章标题" v-model="formData.title" trim="both" :maxlength="100"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="content" label="文章内容" required>
				<article-editor ref="editoRef" v-model="formData.content" dir="cms-article"></article-editor>
			</uni-forms-item>
			<uni-forms-item name="category_id" label="分类" required>
				<uni-data-select v-model="formData.category_id" :localdata="categaryList"></uni-data-select>
			</uni-forms-item>
			<uni-forms-item name="excerpt" label="摘要">
				<uni-easyinput type="textarea" autoHeight v-model="formData.excerpt" placeholder="摘要" :maxlength="300"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="avatarObj" label="封面图">
				<uni-file-picker ref="fileUp" file-mediatype="image" file-extname="jpg,png" mode="grid" :limit="1" :auto-upload="false"  
					return-type="object" v-model="formData.avatarObj" :image-styles="imageStyles" dir="cms-article/"> </uni-file-picker>
			</uni-forms-item>
			<view class="uni-button-group">
				<button :disabled="isInOper" type="primary" class="uni-button" @click="submit">保存</button>
				<button :disabled="isInOper" class="uni-button" @click="goBack">返回</button>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import addRules from './validator/index.js';
	export default {
		data() {
			return {
				formData: {
					"title": '',
					"excerpt": '',
					"content": '',
					"category_id": '',
					"user_id": '',
					"article_status": 0,
					"avatarObj": null,
					"avatarFile": {},
					"avatar": '',
					"create_date": "",
					"last_modify_date": "",
					"deltaOps": [],
					"insert_imgs": []
				},
				categaryList: [],
				imageStyles:{
					width:120,
					height:120
				},
				rules: {...addRules},
				isInOper: false,
				id: '',
				usescore: 0,
				oldData: {},
				textContent: '',
				insertImgs: []
			}
		},
		computed: {
			loginUserId() {
				return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
			},
		},
		onLoad(options) {
			this.id = options.id;
			this.usescore = options.usescore;
			if (this.id) {
				this.getEditDoc();
				uni.setNavigationBarTitle({
				  title: '编辑文章'
				})
			} else {
				this.formData.user_id = this.loginUserId;		
			}

			this.init();
		},
		methods: {
			getEditDoc() {
				let cmsWorksDB = uniCloud.importObject('cms-works-co');
				cmsWorksDB.get({
					id: this.id
				}).then(res => {
					if (res.data && res.data.length) {
						let tmp = res.data[0];
						this.formData.title = tmp.title;
						this.formData.excerpt = tmp.excerpt;
						this.formData.content = tmp.content;
						this.formData.category_id = tmp.category_id;
						this.formData.article_status = tmp.article_status;
						this.formData.avatar = tmp.avatar;
						this.formData.user_id = tmp.user_id;
						this.formData.create_date = tmp.create_date;
						this.formData.last_modify_date = tmp.last_modify_date;
						if (tmp.avatarFile && tmp.avatarFile.name) {
							this.formData.avatarObj = {...tmp.avatarFile}
						} else {
							if (tmp.avatar && tmp.avatar.indexOf('.') !== -1) {
								let urlTrl = tmp.avatar.split('?')[0];
								let tmpList = urlTrl.split('.');
								let len = tmpList.length;
								let extname = tmpList[len - 1];
								let paths = tmpList[len - 2].split('/');
								let filename = paths[paths.length - 1];
								this.formData.avatarObj = {
									name: filename,
									extname: extname,
									url: tmp.avatar
								}
							}
						}
						setTimeout(() => {
							if (tmp.deltaOps) {
								this.formData.deltaOps = tmp.deltaOps || [];
								let deltaImgs = this.formData.deltaOps.filter(x => x.insert && x.insert.image).map(y => y.insert.image);
								this.insertImgs = tmp.insert_imgs || [];
								if (deltaImgs.length && !this.insertImgs.length) {
									deltaImgs.forEach(x => {
										this.insertImgs.push({
											url: x
										})
									});
								}
								console.log('deltaImg333', this.insertImgs);
								this.formData.insert_imgs = this.insertImgs.length ? JSON.parse(JSON.stringify(this.insertImgs)) : [];
								this.oldData = JSON.parse(JSON.stringify(this.formData));
							} else {
								this.$refs.editoRef.getContents().then(res => {
									this.formData.content = res.html;
									this.formData.deltaOps = res.delta && res.delta.ops ? res.delta.ops : [];
									let deltaImgs = this.formData.deltaOps.filter(x => x.insert && x.insert.image).map(y => y.insert.image);
									deltaImgs.forEach(x => {
										this.insertImgs.push({
											url: x
										})
									});
									console.log('deltaImg2222', deltaImgs);
									this.formData.insert_imgs = this.insertImgs.length ? JSON.parse(JSON.stringify(this.insertImgs)) : [];
									this.oldData = JSON.parse(JSON.stringify(this.formData));
								})
							}
						}, 1000);
					}
				})
			},
			getImgSrcFromContent(htmlStr) {
				if (!htmlStr) return [];
				let tmps = [];
				const reg = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
				tmps = htmlStr.match(reg);
				return tmps;
			},
			init() {
				const uniCaptchaDemo = uniCloud.importObject('cms-categary-co', {
					customUI: true
				})
				uniCaptchaDemo.getList().then(res => {
					let list = res.data || [];
					this.categaryList = list.map(x => {
						return {
							text: x.name,
							value: x._id
						}
					})
				});
			},
			submit() {
				this.$refs.editoRef.getContents().then(res => {
					this.formData.content = res.html;
					this.formData.deltaOps = res.delta && res.delta.ops ? res.delta.ops : [];
					this.textContent = res.text;
					if (this.isInOper) return;
					this.isInOper = true;
					uni.showLoading({
						title: '保存中..'
					})
					console.log('submit');
					console.log(this.formData);
					console.log(this.textContent);
					this.$refs.addForm.validate().then((res) => {
						this.startUploadInsertImages();
					}).catch(err => {
						this.isInOper = false;
						uni.hideLoading();
					})
				});
			},
			async uploadInsertImgs() {
				try {
					let res = await this.$refs.editoRef.uploadImageFiles();
					console.log(res);
					if (res && res.length) {
						this.insertImgs = this.insertImgs.concat(res)
						let imgs = res.filter(x => this.formData.content.indexOf(x.filePath) !== -1);
						if (imgs.length) {
							let tempContent = this.formData.content;
							imgs.forEach(t => {
								tempContent = tempContent.replace(t.filePath, t.url);
							})
							this.formData.content = tempContent;
						}
					}					
					console.log('this.formData.content', this.formData.content);
				} catch(e) {
					throw new Error('上传图片发生错误');
				}
			},
			async startUploadInsertImages() {
				try {
					await this.uploadInsertImgs();
					this.$nextTick(() => {
						this.$refs.editoRef.getContents().then(res => {
							this.formData.content = res.html;
							this.formData.deltaOps = res.delta && res.delta.ops ? res.delta.ops : [];
							this.textContent = res.text;
							let deltaImgs = this.formData.deltaOps.filter(x => x.insert && x.insert.image).map(y => y.insert.image);
							if (deltaImgs.length && !this.insertImgs.length) {
								deltaImgs.forEach(x => {
									this.insertImgs.push({
										url: x
									})
								});
							}
							this.formData.insert_imgs = this.insertImgs.filter(x => {
								let x_url = x.url.includes('?') ? x.url.split('?')[0] : x;
								return deltaImgs.find(y => y.startsWith(x_url))
							});
							console.log('deltaImgs:', deltaImgs);
							console.log('this.formData.insert_imgs:', this.formData.insert_imgs);
							console.log(this.insertImgs);
							console.log(this.formData);
							this.submitForm();
						})
					})
				} catch(e) {
					this.isInOper = false;
					uni.hideLoading();
				}
			},
			async submitForm() {
				let addData = {...this.formData};
				console.log('addData: ', addData);
				if (this.formData.avatarObj) {
					addData.avatar = this.formData.avatarObj.fileID || this.formData.avatarObj.url;
					addData.avatarFile = {
						name: this.formData.avatarObj.name,
						extname: this.formData.avatarObj.extname,
						url: addData.avatar
					}
					this.doSubmitForm(addData);
				} else {
					if (this.$refs.fileUp && this.$refs.fileUp.files && this.$refs.fileUp.files.length) {
						this.$refs.fileUp.upload().then(res => {
							let tmp = res[0];
							if (tmp) {
								addData.avatar = tmp.url;
								addData.avatarFile = {
									name: tmp.name,
									extname: tmp.extname,
									url: tmp.url
								}
							}
							this.doSubmitForm(addData);
						})
					} else {
						addData.avatarFile = {
							name: '',
							extname: '',
							url: ''
						};
						this.doSubmitForm(addData);
					}
				}
			},
			isModify(addData) {
				return !this.id || 
						(addData.title !== this.oldData.title || 
						 addData.content !== this.oldData.content || 
						 addData.excerpt !== this.oldData.excerpt || 
						 addData.category_id !== this.oldData.category_id || 
						 addData.avatar !== this.oldData.avatar)
			},
			doSubmitForm(addData) {
				if (!(addData.avatarFile && addData.avatarFile.name) && addData.avatar) {
					addData.avatar = '';
				}
				addData['last_modify_date'] = Date.now();
				if (!this.id) {
					addData['create_date'] = Date.now()
				}
				if (!this.isModify((addData))) {
					this.isInOper = false;
					uni.hideLoading();
					uni.navigateBack();	
					return;
				}
				this.checkDataSec(addData).then(res => {
					delete addData.avatarObj;
					if (this.id) {
						this.procEdit(addData);
					} else {
						this.procAdd(addData);
					}
				}).catch(e => {
					uni.showToast({
						title: e.errMsg || '图片或文字存在违规, 请修改',
						icon: 'none',
						duration: 3000
					});
					this.isInOper = false;
					uni.hideLoading();
				})
			},
			procEdit(addData) {
				let cmsWorksDB = uniCloud.importObject('cms-works-co', {
					customUI: true
				});
				cmsWorksDB.update(addData, this.id).then(res => {
					if (res.status == 0) {
						uni.showToast({
							title: res.msg,
							icon: "success"
						});
						uni.$emit('add-doc-sucess',{});
						this.checkDelCloudFile(addData).then(res => {
							console.log('checkDelCloudFile', res)
							uni.hideLoading();
							this.isInOper = false;
							setTimeout(() => {
								uni.navigateBack();
							}, 1000);
						}).catch(e => {
							uni.hideLoading();
							this.isInOper = false;
							setTimeout(() => {
								uni.navigateBack();
							}, 1000);	
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
						uni.hideLoading();
						this.isInOper = false;
					}
				}).catch((e) => {
					uni.hideLoading();
					this.isInOper = false;
				})
			},
			procAdd(addData) {
				let cmsWorksDB = uniCloud.importObject('cms-works-co', {
					customUI: true
				});
				cmsWorksDB.add(addData).then(res => {
					uni.showToast({
						title: '保存成功',
						icon: "success"
					});
					uni.$emit('add-doc-sucess',{usescore: this.usescore});
					setTimeout(() => {
						uni.navigateBack();
					}, 1000);
				}).finally(() => {
					uni.hideLoading();
					this.isInOper = false;
				})
			},
			goBack() {
				if (this.isInOper) return;
				uni.navigateBack();			
			},
			async checkDelCloudFile(addData) {
				let cmsWorksDB = uniCloud.importObject('cms-works-co', {
					customUI: true
				});
				let delFiles = [];
				if (this.oldData.avatar && (this.oldData.avatar !== addData.avatar)) {
					if (this.oldData.avatar.startsWith('cloud://')) {
						delFiles.push(this.oldData.avatar);
					} else if (this.oldData.avatar.includes('cloudstatic') && this.oldData.avatar.includes('cms-article')) {
						let delCloudpath = this.getCloudpathByLoadUrl(this.oldData.avatar);
						delFiles.push(delCloudpath);
					}
				}
				
				let tmpImgs = [];
				if (this.oldData.insert_imgs) {
					tmpImgs = this.oldData.insert_imgs.filter(x => !addData.insert_imgs.find(y => y.url == x.url));
				}
				
				tmpImgs.forEach(t => {
					let tmpUrl = t.cloudPath || t.url;
					if (tmpUrl.startsWith('cloud://')) {
						delFiles.push(tmpUrl);
					} else if (tmpUrl.includes('cloudstatic') && tmpUrl.includes('cms-article')) {
						let delCloudpath = this.getCloudpathByLoadUrl(tmpUrl);
						delFiles.push(delCloudpath);
					}
				});
				
				if (delFiles.length) {
					console.log('delCloudFile', delFiles)
					try {
						let res = await cmsWorksDB.delCloudFile({
							fileList: delFiles
						})
						return res;
					} catch(e) {
						return { status: 0 };
					}
				} else {
					return { status: 0 };
				}
			},
			getCloudpathByLoadUrl(url) {
				let httpStr = url.split('?')[0];
				let splitStrs = httpStr.split('/');
				let fname = splitStrs[splitStrs.length - 1];
				let filtstrs = splitStrs.filter(x => x == 'cms-article' || x.startsWith('env-'));
				let tmpstrs = filtstrs.map(y => {
										if (y.startsWith('env-')) {
											let tmpStr = y.split('.')[0];
											return tmpStr;
										}
										return y;
									});

				return `cloud://${tmpstrs.join('/')}/${fname}`;
			},
			async checkDataSec(addData) {
				const cmsSecCheckCo = uniCloud.importObject('cms-sec-check-co', {
				  customUI: true
				});
				console.log('checkDataSec');
				console.log(addData);
				console.log(this.formData)
				console.log(this.oldData)
				const parallel = [];
				if (!this.id || addData.title !== this.oldData.title) {
					parallel.push(cmsSecCheckCo.checkContentSec(addData.title, '标题存在敏感词'));
				}

				if (addData.excerpt) {
					if (!this.id || addData.excerpt !== this.oldData.excerpt) {
						parallel.push(cmsSecCheckCo.checkContentSec(addData.excerpt, '摘要存在敏感词'));	
					}
				}
				if (addData.avatar) {
					if (!this.id || addData.avatar !== this.oldData.avatar) {
						parallel.push(cmsSecCheckCo.checkImageSec(addData.avatar, '封面图片存在违规'));	
					}
				}
				if (addData.insert_imgs.length) {
					if (!this.id) {
						addData.insert_imgs.forEach(x => {
							parallel.push(cmsSecCheckCo.checkImageSec(x.url, '文章内容里的图片存在违规'));
						})
					} else {
						let newImgs = addData.insert_imgs.filter(x => !this.oldData.insert_imgs.find(y => y.url == x.url));
						newImgs.forEach(x => {
							parallel.push(cmsSecCheckCo.checkImageSec(x.url, '文章内容里的图片存在违规'));
						})
					}
	
				}
				
				if (this.textContent) {
					if (!this.id || addData.content !== this.oldData.content) {
						parallel.push(cmsSecCheckCo.checkContentSec(this.textContent, '文章内容存在敏感词'));	
					}
				}
				
				if (!parallel.length) {
					return Promise.resolve();
				}
				
				return Promise.all(parallel);	
			}
		}
	}
</script>

<style lang="scss" scoped>
.add-page {
	background-color: #fff;
	box-sizing: border-box;
	padding: 28rpx;
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