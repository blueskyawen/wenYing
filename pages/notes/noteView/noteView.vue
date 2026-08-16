<template>
	<view class="note-view">
		<view class="item" v-if="item">
			<view class="note-img">
				<image :src="item.cover_src"></image>
			</view>
			<view class="note-title">{{ item.content }}</view>
			<view class="note-date">
				<view class="date-left">
					 <view class="note-autor" @click="tapAutor">
						{{ item.user_id && item.user_id.length ?  item.user_id[0].nickname : '游客'}}
					 </view>
					 <view class="publish-date">发布于 
						 <uni-dateformat :date="item.publish_date" format="yyyy-MM-dd"></uni-dateformat>
					 </view>
				 </view>
				 <view class="date-right">
					 <view class="left-action">
						 <u-icon v-if="!isCollect" class="a-icon" name="bookmark" color="#909399" size="20" @click="doCollect"></u-icon>
						 <u-icon v-else class="a-icon" name="bookmark-fill" color="#ff9900" size="20" @click="doCollect"></u-icon>
						 <u-icon v-if="!isLike" class="a-icon" name="heart" color="#909399" size="20" @click="doLike"></u-icon>
						 <u-icon v-else class="a-icon" name="heart-fill" color="#fa3534" size="20" @click="doLike"></u-icon>
						 <!-- #ifdef APP-PLUS -->
						 <u-icon class="a-icon" name="share" color="#909399" size="20"></u-icon>
						 <!-- #endif -->
					 </view>
					 <!-- #ifdef MP -->
					 <button style="border: none" type="default" size="mini" hover-class="none" plain open-type="share">
					 	<u-icon name="share" color="#909399" size="20"></u-icon>
					 </button>
					 <!-- #endif -->
				 </view>
			</view>
		</view>
		<u-empty v-if="!item && !isLoading"></u-empty>
	</view>
</template>

<script>
	import parseImageUrl from "@/common/parseImageUrl.js"
	const cmsNoteDB = uniCloud.importObject('cms-note-co');
	const cmsNoteLikeDB = uniCloud.importObject('cms-note-like-co');
	const cmsNoteCollectDB = uniCloud.importObject('cms-note-collect-co');
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		data() {
			return {
				id: '',
				item: null,
				isLoading: true,
				isLike: false,
				isCollect: false,
				likeObj: {},
				collectObj: {},
				isInOper: false
			}
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin(){
				return store.hasLogin
			},
		},
		onLoad(options) {
			this.id = options.id;
			if (this.id) {
				this.getData();
			}
		},
		onShareAppMessage(e) {
			if (e.from === 'button') {
			  console.log(e.target)
			}
			return {
				title: this.item.content,
				path: `/pages/notes/noteView/noteView?id=${this.id}`,
				desc: "文影-小记",
				imageUrl: this.item.cover_src || 'https://web-assets.dcloud.net.cn/unidoc/zh/share-logo@3.png'
			}
		},
		methods: {
			async getData() {
				this.isLoading = true;
				uni.showLoading();
				let res = await cmsNoteDB.getOne({ id: this.id })
				let temps = res.data || [];
				if (temps.length) {
					let images = temps.map(x => x.cover);
					let resImgs = await parseImageUrl(images);
					temps.forEach(x => {
						let img = resImgs.find(y => y.source == x.cover)
						if (img) {
							x.cover_src = img.src;
						}
					});
					this.item = temps[0];
					if (this.hasLogin) {
						let res2 = await cmsNoteLikeDB.getList({
							id: this.userInfo._id
						})
						let res3 = await cmsNoteCollectDB.getList({
							id: this.userInfo._id
						})
						if (res2.data && res2.data.length) {
							let fdItem = res2.data.find(x => x.note_id == this.item._id);
							if (fdItem) {
								this.isLike = true;
								this.likeObj = {
									id: fdItem._id,
									note_id: fdItem.note_id
								}
							}
						}
						if (res3.data && res3.data.length) {
							let fdItem = res3.data.find(x => x.note_id == this.item._id);
							if (fdItem) {
								this.isCollect = true;
								this.collectObj = {
									id: fdItem._id,
									note_id: fdItem.note_id
								}
							}
						}
					}
					this.isLoading = false;
					uni.hideLoading();
				}
			},
			doCollect() {
				if (this.isInOper) return;
				if (!this.hasLogin) {
					uni.showToast({
						title: "请先登录",
						icon: "none"
					});
					return;
				}
				let collectFlag = !this.isCollect;
				this.isInOper = true;
				if (collectFlag) {
					cmsNoteCollectDB.add({
						"user_id": this.userInfo._id,
						"note_id": this.item._id,
						"note_cover": this.item.cover,
						"note_content": this.item.content,
						"publish_date": this.item.publish_date,
						"create_date": Date.now()
					}).then(res => {
						this.isCollect = collectFlag;
						this.collectObj = {
							id: res.id || '',
							note_id: this.item._id
						}
						uni.showToast({
							title: "收藏成功",
							icon: "none"
						});
					}).finally(res => {
						this.isInOper = false
					})
				} else {
					if (this.collectObj.id) {
						cmsNoteCollectDB.delete({id: this.collectObj.id}).then(res => {
							if (res.status == 0) {
								this.isCollect = collectFlag;
								this.collectObj = {};
								uni.showToast({
									title: "取消收藏",
									icon: "none"
								});
							}
						}).finally(res => {
							this.isInOper = false;
						})
					}
				}
			},
			doLike() {
				if (this.isInOper) return;
				if (!this.hasLogin) {
					uni.showToast({
						title: "请先登录",
						icon: "none"
					});
					return;
				}
				let likeFlag = !this.isLike;
				this.isInOper = true;
				if (likeFlag) {
					cmsNoteLikeDB.add({
						"user_id": this.userInfo._id,
						"note_id": this.item._id,
						"note_cover": this.item.cover,
						"note_content": this.item.content,
						"publish_date": this.item.publish_date,
						"create_date": Date.now()
					}).then(res => {
						this.isLike = likeFlag;
						this.likeObj = {
							id: res.id || '',
							note_id: this.item._id
						}
						uni.showToast({
							title: "收藏至个人喜爱",
							icon: "none"
						});
					}).finally(res => {
						this.isInOper = false
					})
				} else {
					if (this.likeObj.id) {
						cmsNoteLikeDB.delete({id: this.likeObj.id}).then(res => {
							if (res.status == 0) {
								this.isLike = likeFlag;
								this.likeObj = {};
								uni.showToast({
									title: "取消喜爱",
									icon: "none"
								});
							}
						}).finally(res => {
							this.isInOper = false;
						})
					}
				}
			},
			tapAutor() {
				uni.navigateTo({
					url: `/pages/followers/detail/detail?id=${this.item.user_id[0]._id}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.note-view {
	background-color: #fff;
	padding-bottom: 20px;
	.item {
		.note-img {
			image {
				width: 100%;
				height: 360px;
			}
		}
		.note-title {
			padding: 25px;
			box-sizing: border-box;
			line-height: 1.6em;
		}
		.note-date {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			padding: 12px 10px;
			box-sizing: border-box;
			font-size: 14px;
			.date-left {
				display: inline-flex;
				flex-direction: column;
				.note-autor {
					display: inline-flex;
					flex-direction: row;
					align-items: center;
				}
				.publish-date {
					color: #8f939c;
					margin-top: 3px;
				}
			}
			.date-right {
				display: inline-flex;
				flex-direction: row;
				align-items: center;
				.left-action {
					display: inline-flex;
					flex-direction: row;
					align-items: center;
					::v-deep .u-icon {
						margin-left: 16px;
					}
				}
			}
		}
	}
}
</style>