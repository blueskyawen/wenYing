<template>
	<mescroll-body @init="mescrollInit" @down="downCallback" @up="upCallback">
		<view class="search-header">
			<view class="name">
				<view class="icon">
					<uni-icons class="icon-t" type="chatbubble-filled" size="28"></uni-icons>
					<text class="text-t">#</text>
				</view>
				<text class="name-t">{{ topic.name }}</text>
			</view>
			<view class="title">
				<text class="title-1">{{ total }}人参与</text>
				<text class="fge"></text>
				<text class="title-2">900次播放</text>
			</view>
		</view>
		<view class="search-content">
			<view class="video-item-box" v-for="(item, index) in list" :key="index">
				<view class="header">
					<image :src="item.avatar_url" @click="tapAutor(item)"></image>
					<view class="name">
						<text class="first">{{ item.autorName }}</text>
						<uni-dateformat class="second" :date="item.createDate" format="yyyy/MM/dd"></uni-dateformat>
					</view>
				</view>
				<view class="desc">
					<view class="title">{{ item.title }}</view>
					<view class="tags">
						<text class="tag" v-for="tag in getTags(item)" :key="tag._id" @click="tapTag(tag)">#{{tag.name}}</text>
					</view>
				</view>
				<view class="cover">
					<image mode="widthFix" :src="item.cover_src" @click="tapCover(item)"></image>
				</view>
				<view class="opers">
					<view class="oper like" @click="tapLike(item)">
						<u-icon v-if="likeVideoIds.includes(item._id)" name="heart-fill" size="20" color="#e43d33"></u-icon>
						<u-icon v-else name="heart" size="20"></u-icon>
						<text class="num">{{ item.like_count || 0 }}</text>
					</view>
					<view class="oper collect" @click="tapCollect(item)">
						<u-icon v-if="collectVideoIds.includes(item._id)" name="star-fill" size="20" color="#f3a73f"></u-icon>
						<u-icon v-else name="star" size="20"></u-icon>
						<text class="num">{{ item.collect_count || 0 }}</text>
					</view>
					<view class="oper share_t">
						<uni-icons type="redo" size="20"></uni-icons>
						<text class="num">{{ item.zhuanfa_count || 0 }}</text>
					</view>
				</view>
			</view>
		</view>
	</mescroll-body>
</template>

<script>
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
	import parseImageUrl from "@/common/parseImageUrl.js"
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	const cmsVideoLikeDB = uniCloud.importObject('cms-video-like-co', {
		customUI: true
	});
	const cmsVideoCollectDB = uniCloud.importObject('cms-video-collect-co', {
		customUI: true
	});
	const cmsVideoCo = uniCloud.importObject('cms-video-co', {
		customUI: true
	});
	const cmsTopicCollectDB = uniCloud.importObject('cms-topic-co', {
		customUI: true
	});
	
	export default {
		mixins: [MescrollMixin],
		data() {
			return {
				topic: {
					id: '',
					name: ''
				},
				list: [],
				total: 0,
				likeList: [],
				collectList: [],
				tags: [],
				isInOper:false
			}
		},
		onLoad(options) {
			this.topic.id = options.tagId;
			this.topic.name = options.tagName;
		},
		onShow() {
			this.getTotal();
			this.getLikesAndCollect();
			this.getTopicTags();
		},
		onPageScroll(e) {
		  if (e.scrollTop > 80) {
		    uni.setNavigationBarTitle({
		      title: `#${this.topic.name}`
		    })
		  } else {
		    uni.setNavigationBarTitle({
		      title: '话题'
		    })
		  }
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin(){
				return store.hasLogin
			},
			likeVideoIds() {
				return this.likeList.map(x => x.video_id);
			},
			collectVideoIds() {
				return this.collectList.map(x => x.video_id);
			},
		},
		methods: {
			getTags(item) {
				if (!this.tags.length) return [];
				return this.tags.filter(x => item.tags.includes(x._id));
			},
			getTopicTags() {
				cmsTopicCollectDB.getList().then(res => {
					this.tags = res.data || [];
				})
			},
			getTotal() {
				cmsVideoCo.getTotalByTag(this.topic.id).then(res => {
					this.total = res.total;
				})
			},
			getLikesAndCollect() {
				cmsVideoLikeDB.getList({id: this.userInfo._id}).then(res => {
					let tmps = res.data || [];
					this.likeList = tmps.map(x => {
						return {
							id: x._id,
							video_id: x.video_id
						}
					});
				})
				cmsVideoCollectDB.getList({id: this.userInfo._id}).then(res => {
					let tmps = res.data || [];
					this.collectList = tmps.map(x => {
						return {
							id: x._id,
							video_id: x.video_id
						}
					})
				})
			},
			async upCallback(page) {
				let pageNum = page.num; // 页码, 默认从1开始
				let pageSize = page.size; // 页长, 默认每页10条
				try {
					let res = await cmsVideoCo.getListByTag(pageNum, pageSize, this.topic.id);
					let curPageData = res.data || [];
					if (curPageData.length) {
						let coverImages = curPageData.map(x => x.cover);
						let userAvators = curPageData.filter(x => x.user_id && x.user_id[0].avatar_file && x.user_id[0].avatar_file.url)
													.map(y => y.user_id[0].avatar_file.url);
						let resCoverImgs = await parseImageUrl(coverImages);
						let resUserUrls = await parseImageUrl(userAvators);
						curPageData.forEach(x => {
							let img = resCoverImgs.find(y => y.source == x.cover)
							if (img) {
								x.cover_src = img.src;
							}
							let tmpAvator = resUserUrls.find(y => {
								if (!x.user_id[0].avatar_file) return false;
								return y.source == x.user_id[0].avatar_file.url;
							})
							if (tmpAvator) {
								x.avatar_url = tmpAvator.src || '/static/logo.jpg';
							} else {
								x.avatar_url = '/static/logo.jpg';
							}
							if (x.user_id && x.user_id[0]) {
								x.autorName = x.user_id[0].nickname || x.user_id[0].username || '无名氏'
							}
						})
					}
					if(pageNum == 1) this.list = [];
					this.list = this.list.concat(curPageData);
					this.mescroll.endSuccess(curPageData.length);
				} catch(err) {
					this.mescroll.endErr()
				}
			},
			tapTag(tag) {
				uni.navigateTo({
					url: `/pages/videos/search/search?tagId=${tag._id}&tagName=${tag.name}`
				})
			},
			tapAutor(item) {
				uni.navigateTo({
					url: `/pages/followers/detail/detail?id=${item.uploadUser}`
				})
			},
			tapLike(item) {
				console.log(item)
				console.log(this.likeList)
				if (this.isInOper) return;
				if (!this.hasLogin) {
					uni.showToast({
						title: "请先登录",
						icon: "none"
					});
					return;
				}
				let fdItem = this.likeList.find(x => x.video_id === item._id);
				if (fdItem) {
					this.isInOper = true;
					cmsVideoLikeDB.delete({id: fdItem.id}).then(res => {
						if (res.status == 0) {
							item.like_count--;
							cmsVideoCo.incLikeCount(fdItem.video_id, -1).then(res => {
								this.likeList = this.likeList.filter(x => x.id !== fdItem.id);
							});	
						}
					}).finally(res => {
						this.isInOper = false;
					})
				} else {
					this.isInOper = true;
					cmsVideoLikeDB.add({
						"user_id": this.userInfo._id,
						"video_id": item._id,
						"cover": item.cover,
						"src": item.src,
						"title": item.title,
						"description": item.description,
						"read_type": item.read_type,
						"create_date": Date.now()
					}).then(res => {
						item.like_count++;
						let tmpValue = {
							id: res.id || '',
							video_id: item._id
						}
						cmsVideoCo.incLikeCount(tmpValue.video_id, 1).then(res => {
							this.likeList.push(tmpValue);
						});
					}).finally(res => {
						this.isInOper = false
					})
				}
			},
			tapCollect(item) {
				if (this.isInOper) return;
				if (!this.hasLogin) {
					uni.showToast({
						title: "请先登录",
						icon: "none"
					});
					return;
				}
				let fdItem = this.collectList.find(x => x.video_id === item._id);
				if (fdItem) {
					this.isInOper = true;
					cmsVideoCollectDB.delete({id: fdItem.id}).then(res => {
						if (res.status == 0) {
							item.collect_count--;
							cmsVideoCo.incCollectCount(fdItem.video_id, -1).then(res => {
								this.collectList = this.collectList.filter(x => x.id !== fdItem.id);
							});	
						}
					}).finally(res => {
						this.isInOper = false;
					})
				} else {
					this.isInOper = true;
					cmsVideoCollectDB.add({
						"user_id": this.userInfo._id,
						"video_id": item._id,
						"cover": item.cover,
						"src": item.src,
						"title": item.title,
						"description": item.description,
						"read_type": item.read_type,
						"create_date": Date.now()
					}).then(res => {
						item.collect_count++;
						let tmpValue = {
							id: res.id || '',
							video_id: item._id
						}
						cmsVideoCo.incCollectCount(tmpValue.video_id, 1).then(res => {
							this.collectList.push(tmpValue);
						});
					}).finally(res => {
						this.isInOper = false
					})
				}
			},
			tapCover(item) {
				if (!item.cover_src) return;
				uni.navigateTo({
					url: '/pages/myVideo/preView/preView?id=' + item._id + '&from=search'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
page {
	background-color: #f1f1f1;
	box-sizing: border-box;
}

.search-header {
	padding: 15px 12px;
	background-color: #d4e4ff;
	display: flex;
	flex-direction: column;
	.name {
		display: flex;
		flex-direction: row;
		align-items: center;
		.icon {
			position: relative;
			.text-t {
				position: absolute;
				color: #fff;
				font-weight: bold;
				font-size: 14px;
				top: 6px;
				left: 11px;
			}
		}
		.name-t {
			font-weight: bold;
			color: #000;
			font-size: 16px;
			margin-left: 3px;
			margin-bottom: 3px;
		}
	}
	.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 12px;
		color: #6a6a6a;
		.title-1 {
			padding: 0 10px 0 5px;
		}
		.fge {
			width: 1px;
			background-color: #6a6a6a;
			height: 8px;
		}
		.title-2 {
			padding: 0 5px 0 10px;
		}
	}
}
.search-content {
	width: 100%;
	.video-item-box {
		background-color: #fff;
		margin-bottom: 3px;
		box-sizing: border-box;
		padding: 15px;
		.header {
			display: flex;
			flex-direction: row;
			align-items: center;
			.name {
				margin-left: 6px;
				display: flex;
				flex-direction: column;
				line-height: 1.3;
				.first {
					font-size: 18px;
					//font-weight: bold;
				}
				.second {
					font-size: 12px;
					color: #909399;
				}
			}
			image {
				width: 42px;
				height: 42px;
				border-radius: 50%;
			}
		}
		.desc {
			display: flex;
			flex-direction: column;
			padding: 8px 0;
			.title {
				font-size: 14px;
			}
			.tags {
				font-size: 12px;
				color: #3782ff;
				.tag {
					margin-right: 5px;
				}
			}
		}
		.opers {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding: 8px 0 0;
			.oper {
				display: inline-flex;
				flex-direction: row;
				align-items: center;
				.num {
					margin-left: 2px;
					font-size: 14px;
				}
			}
		}
		.cover {
			width: 100%;
			image {
				width: 100%;
				border-radius: 8px;
			}
		}
	}
}

</style>