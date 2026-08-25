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
				<button type="primary" class="uni-button" @click="submit">保存</button>
				<button class="uni-button" @click="goBack">返回</button>
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
					"avatarFile": null,
					"avatar": '',
					"create_date": "",
					"last_modify_date": "",
				},
				categaryList: [],
				imageStyles:{
					width:120,
					height:120
				},
				rules: {...addRules},
				isInOper: false,
				id: '',
				usescore: 0
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
								let tmpList = tmp.avatar.split('.');
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
					}
				})
			},
			init() {
				const uniCaptchaDemo = uniCloud.importObject('cms-categary-co')
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
				if (this.isInOper) return;
				this.isInOper = true;
				this.$refs.addForm.validate().then((res) => {
					this.submitForm(res)
				}).catch(err => {
					this.isInOper = false;
				})
			},
			submitForm() {
				let addData = {...this.formData};
				if (this.formData.avatarObj) {
					addData.avatar = this.formData.avatarObj.url;
					addData.avatarFile = {
						name: this.formData.avatarObj.name,
						extname: this.formData.avatarObj.extname,
						url: this.formData.avatarObj.url
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
						addData.avatarFile = {};
						this.doSubmitForm(addData);
					}
				}
			},
			doSubmitForm(addData) {
				if (!(addData.avatarFile && addData.avatarFile.name) && addData.avatar) {
					addData.avatar = '';
				}
				addData['last_modify_date'] = Date.now();
				if (!this.id) {
					addData['create_date'] = Date.now()
				}
				this.checkDataSec(addData).then(res => {
					delete addData.avatarObj;
					uni.showLoading({
						title: '保存中'
					})
					if (this.id) {
						this.procEdit(addData);
					} else {
						this.procAdd(addData);
					}
				}).catch(e => {
					uni.showToast({
						title: e.errMsg || '图片或文字存在违规, 请修改',
						icon: 'error',
						duration: 3000
					});
					this.isInOper = false;
				})
			},
			procEdit(addData) {
				let cmsWorksDB = uniCloud.importObject('cms-works-co');
				cmsWorksDB.update(addData, this.id).then(res => {
					if (res.status == 0) {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
						uni.$emit('add-doc-sucess',{});
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
				let cmsWorksDB = uniCloud.importObject('cms-works-co');
				cmsWorksDB.add(addData).then(res => {
					uni.showToast({
						title: '保存成功',
						icon: "none"
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
				uni.navigateBack();			
			},
			async checkDataSec(addData) {
				const cmsSecCheckCo = uniCloud.importObject('cms-sec-check-co', {
				  customUI: true
				});
				console.log(addData);
				const parallel = [];
				parallel.push(cmsSecCheckCo.checkContentSec(addData.title, '标题存在敏感词'));
				if (addData.excerpt) {
					parallel.push(cmsSecCheckCo.checkContentSec(addData.excerpt, '摘要存在敏感词'));
				}
				if (addData.avatar) {
					parallel.push(cmsSecCheckCo.checkImageSec(addData.avatar, '封面图片存在违规'));
				}
				
				let textCont = this.$refs.editoRef.getTextContent();
				if (textCont) {
					console.log(textCont);
					parallel.push(cmsSecCheckCo.checkContentSec(textCont, '文章内容存在敏感词'));
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