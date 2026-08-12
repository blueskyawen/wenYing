<template>
	<view class="container">
		<u-sticky bgColor="#fff">
			<u-tabs :list="tablist" @click="clickTab" :current="curTab"></u-tabs>
		</u-sticky>
		<swiper class="swiper" :style="{height: heighth + 'px'}" :current="curTab" @change="swiperChange">
			<swiper-item>
				<doc-list ref="list-0" :udbWhere="udbWhere"></doc-list>
			</swiper-item>
			<swiper-item>
				<note-list ref="list-1" :udbWhere="udbWhere"></note-list>
			</swiper-item>
			<swiper-item>
				<video-list ref="list-2" :udbWhere="udbWhere"></video-list>
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
				isLoading: true,
				udbWhere:'',
				options: [{
					text: '删除'
				}],
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
			this.heighth = uni.getWindowInfo().windowHeight - 44;
			this.udbWhere = `user_id=='${this.loginUserId}'`
		},
		onPullDownRefresh() {
			console.log('doclist====onPullDownRefresh')
			this.$refs[`list-${this.curTab}`].refreshData();
		},
		onReachBottom() {
			console.log('doclist====onReachBottom');
			this.$refs[`list-${this.curTab}`].loadMore();
			// this.$refs.udb.loadMore()
		},
		methods: {
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
	.container {
		height: 100%;
	}
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