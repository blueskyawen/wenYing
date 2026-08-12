<template>
	<view class="my-video">
		<u-sticky bgColor="#fff">
			<u-tabs :list="tablist" @click="clickTab" :current="curTab"></u-tabs>
		</u-sticky>
		<swiper class="swiper" :style="{height: heighth + 'px'}" :current="curTab" @change="swiperChange">
			<swiper-item>
				<video-list v-if="!isLoading" :isSetting="isSetting" :list="pulicList" :style="{height: heighth + 'px'}"></video-list>
			</swiper-item>
			<swiper-item>
				<video-list v-if="!isLoading" :isSetting="isSetting" :list="privateList" :style="{height: heighth + 'px'}"></video-list>
			</swiper-item>
		</swiper>
		<view class="action-tabbar">
			<view class="action-row">
			  <view class="a-item action-r" @tap.stop="clickAdd">
				  <u-icon name="plus" size="16"></u-icon>
				  <text>创建</text>
			  </view>
			</view>
		</view>
	</view>
</template>

<script>
	import videoList from "./video-list/video-list.vue";
	import parseImageUrl from "@/common/parseImageUrl.js"
	export default {
		components: {
			videoList
		},
		data() {
			return {
				list: [],
				isSetting: false,
				tablist: [
					{
						name: '公开',
						value: 'public'
					},
					{
						name: '私有',
						value: 'private'
					}
				],
				curTab: 0,
				heighth: 400,
				isLoading: true
			}
		},
		computed: {
			loginUserId() {
				return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
			},
			setTitle() {
				return this.isSetting ? '退出管理' : '管理'
			},
			pulicList() {
				return this.list.filter(x => x.read_type == 1);
			},
			privateList() {
				return this.list.filter(x => x.read_type == 0);
			}
		},
		onLoad() {
			this.heighth = uni.getWindowInfo().windowHeight - 94;
		},
		onShow() {
			this.getList();
		},
		onHide() {
			this.isSetting = false;
		},
		methods: {
			async getList() {
				this.isLoading = true;
				uni.showLoading({})
				const cmsVideoCo = uniCloud.importObject('cms-video-co')
				try {
					let res = await cmsVideoCo.getMyList(0,10,{
						userId: this.loginUserId
					})
					let tmpList = res.data || [];
					if (tmpList.length) {
						let coverImages = tmpList.map(x => x.cover);
						let resCoverImgs = await parseImageUrl(coverImages);
						tmpList.forEach(x => {
							let img = resCoverImgs.find(y => y.source == x.cover)
							if (img) {
								x.cover_src = img.src;
							}
							x.dianzan = 999
						})
						this.list = tmpList;
						this.isLoading = false;
						uni.hideLoading();
					}
				} catch(e) {
					this.isLoading = false;
					uni.hideLoading();
					console.error(e);
				}
			},
			clickSeting() {
				this.isSetting = !this.isSetting;
			},
			clickAdd() {
				uni.navigateTo({
					url: '/pages/myVideo/add/add'
				})
			},
			clickTab(e) {
				this.curTab = e.index;
			},
			swiperChange(e){
				this.clickTab({
					index: e.detail.current
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
.my-video {
	padding-bottom: 50px;
	height: 100%;
	.action-tabbar {
		background-color: #fff;
		box-shadow: 0 0 2px #ceccca;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		.action-row {
			display: flex;
			align-items: center;
			.a-item {
				display: inline-flex;
				align-items: center;
				border: solid 1px #dcdcdc;
				padding: 3px 6px;
				border-radius: 12px;
			    font-size: 14px;
				text {
					margin-left: 3px;
				}
			}
			.action-r {
				margin-left: 24px;
			}
		}
	}
}
</style>