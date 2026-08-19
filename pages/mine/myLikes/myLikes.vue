<template>
	<view class="container">
		<u-sticky bgColor="#fff">
			<u-tabs :list="tablist" @click="clickTab" :current="curTab"></u-tabs>
		</u-sticky>
		<swiper class="swiper" :style="{height: heighth + 'px'}" :current="curTab" @change="swiperChange">
			<swiper-item>
				<doc-list ref="likes-0" :udbWhere="udbWhere"></doc-list>
			</swiper-item>
			<swiper-item>
				<note-list ref="likes-1" :udbWhere="udbWhere"></note-list>
			</swiper-item>
			<swiper-item>
				<video-list ref="likes-2" :udbWhere="udbWhere"></video-list>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import docList from "./doc-list/doc-list.vue";
	import noteList from "./note-list/note-list.vue";
	import videoList from "./video-list/video-list.vue";
	export default {
		components: {
			docList,
			noteList,
			videoList
		},
		data() {
			return {
				udbWhere:'',
				tablist: [
					{
						name: '文章',
						value: 'doc'
					},
					{
						name: '小记',
						value: 'note'
					},
					{
						name: '短视频',
						value: 'video'
					}
				],
				curTab: 0,
				heighth: 400,
			}
		},
		computed: {
			loginUserId() {
				return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
			},
		},
		onLoad() {
			this.udbWhere = `user_id=='${this.loginUserId}'`;
			this.heighth = uni.getWindowInfo().windowHeight - 44;
			uni.$on('refresh-like-list', this.refreshData);
		},
		onUnload() {
			uni.$off('refresh-like-list')
		},
		onPullDownRefresh() {
			this.$refs[`likes-${this.curTab}`].refreshData();
		},
		onReachBottom() {
			this.$refs[`likes-${this.curTab}`].loadMore();
		},
		methods: {
			refreshData() {
				this.$refs[`likes-${this.curTab}`].refreshData();
			},
			clickTab(e) {
				this.curTab = e.index;
				setTimeout(() => {
					// this.refreshData();
				}, 100)
			},
			swiperChange(e){
				this.clickTab({
					index: e.detail.current
				});
			}
		}
	}
</script>

<style scoped>
	.item{
		display: flex;
		flex-direction: column;
	}
	.time-row {
		display: flex;
		align-items: center;
		margin-top: 24rpx;
		font-size: 14px;
	}
	.article-date {
		color: #C8C7CC;
		font-size: 14px;
		margin-left: 5px;
		margin-top: 4px;
	}
</style>