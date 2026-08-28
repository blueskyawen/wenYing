<template>
	<view class="video-preview">
		<wy-video ref="vidRef" :list="list" :total="1" :showOpers="showOpers" :likeItems="likeList" 
			:collectItems="collectList" :followers="followers" @show-aciton="showActions" @action-change="handleActionChange"></wy-video>
		<u-popup class="more-opers" :show="showOperPlane" mode="bottom" @close="closePlane">
			<view class="share-content">
				<view class="header">
					<text>更多操作</text>
					<u-icon name="close-circle" size="25" color="#909399" @click="closePlane"></u-icon>
				</view>
				<view class="content">
					<view class="share-item" v-for="(item, index) in operOptions" :key="index" @tap="clickOper(item)">
						<view class="icon-box">
							<u-icon :name="item.icon" size="20" :color="item.iconColor"></u-icon>
						</view>
						<text>{{ item.name }}</text>
					</view>
				</view>
			</view>
		</u-popup>
		<u-popup class="more-opers" :show="showEditPlane" mode="bottom" @close="closeEditPlane">
			<view class="share-content edit-c">
				<view class="header">
					<text>编辑</text>
					<u-icon name="close-circle" size="25" color="#909399" @click="closeEditPlane"></u-icon>
				</view>
				<view class="form-content">
					<uni-forms ref="editForm" :modelValue="formData" label-position="top" :rules="rules">
						<uni-forms-item label="标题" name="title" required>
							<uni-easyinput type="text" trim :maxlength="20" v-model="formData.title" placeholder="输入标题" />
						</uni-forms-item>
						<uni-forms-item label="描述内容" name="description" required>
							<uni-easyinput type="textarea" trim autoHeight :maxlength="200" 
								v-model="formData.description" placeholder="输入描述内容" />
						</uni-forms-item>
						<uni-forms-item label="话题" name="tags">
							<uni-data-select v-model="formData.tags" placement="top" multiple wrap :localdata="tagOptions" 
									label="换行显示"></uni-data-select>
						</uni-forms-item>
					</uni-forms>
				</view>
				<view class="bottom-actions">
					<button class="uni-button" @click="closeEditPlane">取消</button>
					<button type="primary" class="uni-button" @click="confirmEdit">确认</button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import parseImageUrl from "@/common/parseImageUrl.js"
	const cmsVideoCo = uniCloud.importObject('cms-video-co')
	const cmsTopicCollectDB = uniCloud.importObject('cms-topic-co', {
		customUI: true
	});
	const cmsVideoLikeDB = uniCloud.importObject('cms-video-like-co', {
		customUI: true
	});
	const cmsVideoCollectDB = uniCloud.importObject('cms-video-collect-co', {
		customUI: true
	});
	export default {
		data() {
			return {
				list: [],
				id: '',
				showOperPlane: false,
				operItem: {},
				operList: [
					{
						value: 'edit',
						name: '编辑',
						icon: 'edit-pen',
						iconColor: '#909399',
					},
					{
						value: 'delete',
						name: '删除',
						icon: 'trash',
						iconColor: '#909399',
					},
					{
						value: 'topublic',
						name: '转为公开',
						icon: 'lock-open',
						iconColor: '#909399',
					},
					{
						value: 'toprivate',
						name: '转为私有',
						icon: 'lock',
						iconColor: '#909399',
					},
					{
						value: 'share',
						name: '分享',
						icon: 'share',
						iconColor: '#909399',
					}
				],
				showEditPlane: false,
				formData: {
					title: '',
					description: '',
					tags: [],
				},
				tagOptions: [],
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
				isloading: false,
				tagList: [],
				showOpers: true,
				likeList: [],
				collectList: [],
				followers: [],
				isInOper: false,
				from: '',
				saveOldFlag: {
					like: false,
					collect: false
				}
			}
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin(){
				return store.hasLogin
			},
			pubOptions() {
				return this.operList.filter(x => x.value !== 'toprivate')
			},
			priOptions() {
				return this.operList.filter(x => x.value !== 'topublic')
			},
			operOptions() {
				return this.list[0] && this.list[0].read_type == 1 ? this.priOptions : this.pubOptions;
			}
		},
		onLoad(options) {
			this.id = options.id;
			let autor = options.autor;
			this.from = options.from;
			this.showOpers = !!(this.id && autor)
			if (this.id) {
				this.getList();
			}
		},
		onUnload() {
			this.checkIfUpdate();
		},
		onShow() {
			if (!this.showOpers && this.hasLogin) {
				this.getFollowerList();	
			}
		},
		methods: {
			getFollowerList() {
				const cmsFollowerCollectDB = uniCloud.importObject('cms-follower-co', {
					customUI: true
				});
				cmsFollowerCollectDB.get({
					user_id: this.userInfo._id
				}).then(res => {
					let tmps = []
					if (res.data.length) {
						tmps = res.data[0].followers ? res.data[0].followers.map(x => x.user_id) : []
					}
					tmps.push(this.userInfo._id);
					this.followers = tmps;
				})
			},
			async getList() {
				try {
					let res4 = await cmsTopicCollectDB.getList();
					this.tagList = res4.data || [];
					this.tagOptions = this.tagList.map(x => {
						return {
							value: x._id,
							text: x.name
						}
					})
					
					if (!this.showOpers && this.hasLogin) {
						let res2 = await cmsVideoLikeDB.getList({
							id: this.userInfo._id
						})
						let res3 = await cmsVideoCollectDB.getList({
							id: this.userInfo._id
						})
						if (res2.data && res2.data.length) {
							this.likeList = res2.data.map(x => {
								return {
									id: x._id,
									video_id: x.video_id
								}
							});
						}
						if (res3.data && res3.data.length) {
							this.collectList = res3.data.map(x => {
								return {
									id: x._id,
									video_id: x.video_id
								}
							})
						}
					}
					
					let res = await cmsVideoCo.getVideoList(this.id);
					let tmpList = res.data || [];
					if (tmpList.length) {
						let coverImages = tmpList.map(x => x.cover);
						let videoUrls = tmpList.map(x => x.src);
						let userAvators = tmpList.filter(x => x.user_id && x.user_id[0].avatar_file && x.user_id[0].avatar_file.url)
													.map(y => y.user_id[0].avatar_file.url);
						let resCoverImgs = await parseImageUrl(coverImages);
						let resVideoUrls = await parseImageUrl(videoUrls);
						let resUserUrls = await parseImageUrl(userAvators);
						tmpList.forEach(x => {
							let img = resCoverImgs.find(y => y.source == x.cover)
							if (img) {
								x.cover_src = img.src;
							}
							let tmpurl = resVideoUrls.find(y => y.source == x.src)
							if (tmpurl) {
								x.url = tmpurl.src;
							}
							let tmpAvator = resUserUrls.find(y => {
								if (!x.user_id[0].avatar_file) return false;
								return y.source == x.user_id[0].avatar_file.url;
							})
							if (tmpAvator) {
								x.avatar_url = tmpAvator.src || '/static/yhdsl/car.png';
							} else {
								x.avatar_url = '/static/logo.jpg';
							}
							x.isLike = !!this.likeList.find(t => t.video_id == x._id);
							x.isCollect = !!this.collectList.find(t => t.video_id == x._id);
							if (x.user_id && x.user_id[0]) {
								x.autorName = x.user_id[0].nickname || x.user_id[0].username || '无名氏'
							}
							
							x.tagList = this.tagList.filter(y => x.tags.includes(y._id));
						});
						this.list = tmpList;
						this.saveOldFlag.like = tmpList[0].isLike;
						this.saveOldFlag.collect = tmpList[0].isCollect;
						this.autoPlay();
						uni.setNavigationBarTitle({
						  title: this.list[0].title
						})
					}
				} catch(e) {
					
				}
			},
			autoPlay() {
				this.$nextTick(() => {
					this.$refs.vidRef.tapVideo(true);
				})
			},
			showActions(e) {
				this.operItem = {...e};
				this.showOperPlane = true;
			},
			closePlane() {
				this.showOperPlane = false;
			},
			clickOper(item) {
				this.closePlane();
				if (item.value == 'edit') {
					this.procEdit();
					return;
				}
				if (item.value == 'delete') {
					this.proDelete();
					return;
				}
				if (item.value == 'topublic' || item.value == 'toprivate') {
					this.procModReadType(item.value);
					return;
				}
			},
			closeEditPlane() {
				this.showEditPlane = false;
			},
			procEdit() {
				if (this.isloading) return;
				this.formData.title = this.operItem.title;
				this.formData.description = this.operItem.description;
				this.formData.tags = this.operItem.tags;
				this.closePlane();
				this.showEditPlane = true;
			},
			checkDataSec() {
				const cmsSecCheckCo = uniCloud.importObject('cms-sec-check-co', {
				  customUI: true
				});
				const parallel = [];
				if (this.formData.title !== this.operItem.title) {
					parallel.push(cmsSecCheckCo.checkContentSec(this.formData.title, '标题存在敏感词'));
				}
				if (this.formData.description !== this.operItem.description) {
					parallel.push(cmsSecCheckCo.checkContentSec(this.formData.description, '描述内容存在敏感词'));
				}
				
				if (!parallel.length) {
					return Promise.resolve();
				}

				return Promise.all(parallel);	
			},
			confirmEdit() {
				if (this.isloading) return;
				this.$refs.editForm.validate().then(res => {
					if (this.isModify()) {
						this.checkDataSec().then(res => {
							this.isloading = true;
							uni.showLoading({
								title: '处理中'
							})
							cmsVideoCo.updateFields({
								id: this.operItem._id,
								title: this.formData.title,
								description: this.formData.description,
								tags: this.formData.tags
							}).then(res => {
								if (res.status == 0) {
								  uni.showToast({
									title: res.msg,
									icon: "none"
								  });
								  this.modCurData();
								  this.closeEditPlane();
								} else {
									uni.showToast({
										title: res.msg,
										icon: "error"
									});
								}
								this.isloading = false;
								uni.hideLoading();
							}).catch(e => {
								this.isloading = false;
								uni.hideLoading();
							});	
						}).catch(e => {
							if (e.detail && e.detail.action && e.detail.action == 'secCheck') {
								uni.showToast({
									title: e.errMsg || '文字内容存在违规, 请修改',
									icon: 'error',
									duration: 3000
								})
							}
						})

					} else {
						this.closeEditPlane();
					}
				})
			},
			isModify() {
				if (this.formData.title !== this.operItem.title) {
					return true;
				}
				if (this.formData.description !== this.operItem.description) {
					return true;
				}
				let oldTagStr = this.operItem.tags.join('-')
				let newTagStr = this.formData.tags.join('-')
				if (oldTagStr !== newTagStr) {
					return true;
				}
				return false;
			},
			modCurData() {
				this.operItem.title = this.formData.title;
				this.operItem.description = this.formData.description;
				this.operItem.tags = this.formData.tags;
				this.operItem.tagList = this.tagList.filter(y => this.formData.tags.includes(y._id));
				this.list[0].title = this.formData.title;
				this.list[0].description = this.formData.description;
				this.list[0].tags = this.formData.tags;
				this.list[0].tagList = this.tagList.filter(y => this.formData.tags.includes(y._id));
			},
			proDelete() {
				uni.showModal({
					title: '确认删除',
					content: '执行删除后数据将不可恢复, 确定要删除吗?',
					confirmColor: '#e43d33',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							this.doDel();
						}
					}
				});
			},
			doDel() {
				cmsVideoCo.delete({
					id: this.operItem._id
				}).then(res => {
					if (res.status == 0) {
					  uni.showToast({
						title: res.msg,
						icon: "none"
					  });
					  setTimeout(() => {
						  uni.navigateBack();
					  }, 1000);
					} else {
						uni.showToast({
							title: res.msg,
							icon: "error"
						});
					}
				});
			},
			procModReadType(v) {
				let title = v == 'topublic' ? '视频转为公开' : '视频转为私有';
				let content = v == 'topublic' ? '视频转为公开后, 将在前台显示, 确定要执行吗?' : '视频转为私有后, 将不在前台显示, 确定要执行吗?';
				uni.showModal({
					title: title,
					content: content,
					confirmColor: '#e43d33',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							this.doModReadType(v == 'topublic' ? 1 : 0);
						}
					}
				});
			},
			doModReadType(v) {
				cmsVideoCo.updateFields({
					id: this.operItem._id,
					read_type: v
				}).then(res => {
					if (res.status == 0) {
					  uni.showToast({
						title: res.msg,
						icon: "none"
					  });
					  this.operItem.read_type = v;
					  this.list[0].read_type = v;
					} else {
						uni.showToast({
							title: res.msg,
							icon: "error"
						});
					}
				});
			},
			handleActionChange(e) {
				if (e.type == 'tapLike') {
					this.doTapLike(e.value);
					return;
				}
				if (e.type == 'tapCollect') {
					this.doTapCollect(e.value);
					return;
				}
				if (e.type == 'follow') {
					this.doAddFollower(e.value);
					return;
				}
			},
			doTapLike(value) {
				if (this.isInOper) return;
				const cmsVideoCo2 = uniCloud.importObject('cms-video-co', {
					customUI: true
				})
				let curItem = value;
				let fdItem = this.list.find(x => x._id === curItem._id);
				if (fdItem) {
					let isLike = !fdItem.isLike;
					this.isInOper = true;
					if (isLike) {
						cmsVideoLikeDB.add({
							"user_id": this.userInfo._id,
							"video_id": fdItem._id,
							"cover": fdItem.cover,
							"src": fdItem.src,
							"title": fdItem.title,
							"description": fdItem.description,
							"read_type": fdItem.read_type,
							"create_date": Date.now()
						}).then(res => {
							fdItem.isLike = isLike;
							fdItem.like_count++;
							uni.showToast({
								title: "收藏至个人喜爱",
								icon: "none"
							});
							let tmpValue = {
								id: res.id || '',
								video_id: fdItem._id
							}
							cmsVideoCo2.incLikeCount(tmpValue.video_id, 1).then(res => {
								this.likeList.push(tmpValue);
							});
						}).finally(res => {
							this.isInOper = false
						})
					} else {
						let tmpItem = this.likeList.find(x => x.video_id == curItem._id);
						if (tmpItem) {
							cmsVideoLikeDB.delete({id: tmpItem.id}).then(res => {
								if (res.status == 0) {
									fdItem.isLike = isLike;
									fdItem.like_count--;
									uni.showToast({
										title: "取消喜爱",
										icon: "none"
									});
									let tmpValue = {
										id: tmpItem.id,
										video_id: tmpItem.video_id
									};
									cmsVideoCo2.incLikeCount(tmpValue.video_id, -1).then(res => {
										this.likeList = this.likeList.filter(x => x.id !== tmpValue.id);
									});	
								}
							}).finally(res => {
								this.isInOper = false;
							})
						}
					}
				}
			},
			doTapCollect(value) {
				if (this.isInOper) return;
				const cmsVideoCo2 = uniCloud.importObject('cms-video-co', {
					customUI: true
				})
				let curItem = value;
				let fdItem = this.list.find(x => x._id === curItem._id);
				if (fdItem) {
					let isCollect = !fdItem.isCollect;
					this.isInOper = true;
					if (isCollect) {
						cmsVideoCollectDB.add({
							"user_id": this.userInfo._id,
							"video_id": fdItem._id,
							"cover": fdItem.cover,
							"src": fdItem.src,
							"title": fdItem.title,
							"description": fdItem.description,
							"read_type": fdItem.read_type,
							"create_date": Date.now()
						}).then(res => {
							fdItem.isCollect = isCollect;
							fdItem.collect_count++;
							uni.showToast({
								title: "收藏至个人中心",
								icon: "none"
							});
							let tmpValue = {
								id: res.id || '',
								video_id: fdItem._id
							}
							cmsVideoCo2.incCollectCount(tmpValue.video_id, 1).then(res => {
								this.collectList.push(tmpValue);
							});
						}).finally(res => {
							this.isInOper = false
						})
					} else {
						let tmpItem = this.collectList.find(x => x.video_id == curItem._id);
						if (tmpItem) {
							cmsVideoCollectDB.delete({id: tmpItem.id}).then(res => {
								if (res.status == 0) {
									fdItem.isCollect = isCollect;
									fdItem.collect_count--;
									uni.showToast({
										title: "取消收藏",
										icon: "none"
									});
									let tmpValue = {
										id: tmpItem.id,
										video_id: tmpItem.video_id
									};
									cmsVideoCo2.incCollectCount(tmpValue.video_id, -1).then(res => {
										this.collectList = this.collectList.filter(x => x.id !== tmpValue.id);
									});	
								}
							}).finally(res => {
								this.isInOper = false;
							})
						}
					}
				}
			},
			doAddFollower(value) {
				const cmsFollowerCollectDB = uniCloud.importObject('cms-follower-co');
				cmsFollowerCollectDB.addFollower({
					user_id: this.userInfo._id,
					addData: {
						...value
					}
				}).then(res => {
					this.followers.push(value.user_id);
					uni.showToast({
						title: '关注成功'
					})
				})	
			},
			checkIfUpdate() {
				if (this.from == 'likes' && this.saveOldFlag.like !== this.list[0].isLike) {
					uni.$emit('refresh-like-list',{});
				}
				if (this.from == 'collects' && this.saveOldFlag.collect !== this.list[0].isCollect) {
					uni.$emit('refresh-collect-list',{});
				}
			}
		}
	}
</script>

<style lang="scss">
.video-preview {
	::v-deep .u-popup__content {
		border-radius: 10px 10px 0 0;
		background-color: #f0f0f0;
	}
	.share-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 10px 0 20px;
		border-radius: 10px 10px 0 0;
		background-color: #f0f0f0;
		&.edit-c {
			background-color: #fff;
			.form-content {
				box-sizing: border-box;
				padding: 0 10px;
			}
			.bottom-actions {
				border-top: solid 1px #ededed;
				display: flex;
				flex-direction: row;
				align-items: center;
				box-sizing: border-box;
				justify-content: space-between;
				width: 100%;
				.uni-button {
					width: 45%;
				}
			}
		}
		.header {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			box-sizing: border-box;
			padding: 2px 10px;
			color: #909399;
			margin-bottom: 20px;
			text {
				font-size: 14px;
			}
		}
		.content {
			width: 100%;
			display: flex;
			flex-direction: row;
			align-items: center;
		}
		.share-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			box-sizing: border-box;
			width: 25%;
			text {
				color: #909399;
				font-size: 12px;
				margin-top: 5px;
			}
			.icon-box {
				box-shadow: 0 0 5px rgba($color: #d8d8d8, $alpha: 0.5);
				border-radius: 100%;
				padding: 14px;
				background-color: #fff;
			}
		}
	}
}
</style>