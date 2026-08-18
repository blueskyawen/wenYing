<template>
	<view class="page-list">
		<view class="list-item" v-for="(item, index) in  list" :key="index">
			<view class="item-left">
				<image class="avator-image" :src="item.avatarUrl"></image>
				<text class="mick-name">{{ item.name }}</text>
			</view>
			<view class="item-right">
				<button v-if="item.isCheck" class="mini-btn" type="warn" size="mini" @click="doFollow(item)">已关注</button>
				<button v-else class="mini-btn" type="default" size="mini" @click="doFollow(item)">关注</button>
			</view>
		</view>
		<u-empty v-if="!isloading && !list.length"></u-empty>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import parseImageUrl from "@/common/parseImageUrl.js"
	export default {
		data() {
			return {
				list: [],
				docId: '',
				isInoper: false,
				isloading: true
			}
		},
		onLoad() {
			this.getList();
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
		},
		methods: {
			async getList() {
				this.isloading = true;
				const cmsFollowerCollectDB = uniCloud.importObject('cms-follower-co');
				const userCollectDB = uniCloud.importObject('cms-user-co');
				let res = await cmsFollowerCollectDB.get({ user_id: this.userInfo._id});
				let tmpFollowers = [];
				if (res.data.length) {
					this.docId = res.data[0]._id;
					tmpFollowers = res.data[0].followers ? res.data[0].followers : []
				}
				if (tmpFollowers.length) {
					let ids = tmpFollowers.map(x => x.user_id);
					let res1 = await userCollectDB.getList({ids});
					let users = res1.data || [];
					tmpFollowers.forEach(x => {
						x.isCheck = true;
						let fdItem = users.find(y => y._id == x.user_id);
						x.avatar = fdItem && fdItem.avatar_file && fdItem.avatar_file.url ? fdItem.avatar_file.url : '';
						if (fdItem) {
							x.name = fdItem.nickname || fdItem.username;
						}
					});
					let images = tmpFollowers.map(x => x.avatar);
					let resImgs = await parseImageUrl(images);
					tmpFollowers.forEach(x => {
						let img = resImgs.find(y => y.source == x.avatar)
						if (img) {
							x.avatarUrl = img.src || '/static/logo.jpg';
						} else {
							x.avatarUrl = '/static/logo.jpg';
						}
					});
					this.list = tmpFollowers;
				}
				this.isloading = false;
			},
			doFollow(item) {
				if (this.isInoper) return;
				let isCheck = !item.isCheck;
				let newList = this.list.filter(x => x.isCheck).map(y => {
						return {
							user_id: y.user_id,
							name: y.name,
							avatar: y.avatar
						}
					});
				if (isCheck) {
					newList.push({
						user_id: item.user_id,
						name: item.name,
						avatar: item.avatar
					})
				} else {
					let fdIndex = newList.findIndex(x => x.user_id == item.user_id);
					if (fdIndex >= 0) {
						newList.splice(fdIndex, 1);
					}
				}
				this.isInoper = true;
				const cmsFollowerCollectDB = uniCloud.importObject('cms-follower-co');
				cmsFollowerCollectDB.updateFollower({
					"_id": this.docId,
					"followers": newList
				}).then(res => {
					item.isCheck = isCheck;
					let textT = isCheck ? '关注成功' : '已取消关注'
					uni.showToast({
						title: textT
					})
				}).finally(e => {
					this.isInoper = false;
				})
			} 
		}
	}
</script>

<style lang="scss" scoped>
.page-list {
	/* #ifndef APP-NVUE */
	display: flex;
	width: 100%;
	height: 100vh;
	/* #endif */
	background-color: #fff;
	display: flex;
	flex-direction: column;
	.list-item {
		width: 100%;
		box-sizing: border-box;
		padding: 12px 15px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		border-bottom: solid 1px #ededed;
		.item-left {
			display: flex;
			flex-direction: row;
			align-items: center;
			flex: 1;
			text {
				margin-left: 8px;
			}
		}
		.item-right {
			margin-left: 20px;
		}
		.avator-image {
			display: block;
			width: 45px;
			height: 45px;
			border-radius: 100%;
			border: solid 1px #ddd;
		}
		.mick-name {
			flex: 1;
		}
	}
}
</style>