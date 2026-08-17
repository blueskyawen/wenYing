<template>
	<view class="user-page">
		<view class="user-info">
			<view class="user-avtor">
				<image v-if="userData.avator_src" :src="userData.avator_src"></image>
			</view>
			<view class="user-name">
				<view class="name">{{ userData.nickname }}</view>
				<view class="opers" v-if="isShowOper">
					<text v-if="isFollow">已关注</text>
					<button v-if="isFollow" class="mini-btn" type="warn" size="mini">取消关注</button>
					<button v-else class="mini-btn" type="primary" size="mini">关注</button>
				</view>
			</view>
		</view>
		<view class="ge-line"></view>
		<u-sticky bgColor="#fff" :offsetTop="0">
			<u-tabs :list="tablist" @click="clickTab" :current="curTab"></u-tabs>
		</u-sticky>
		<swiper class="swiper" :style="{height: heighth + 'px'}" :current="curTab" @change="swiperChange">
			<swiper-item>
				<doc-list v-if="id" ref="list-0"  :udbWhere="udbWhere.doc"></doc-list>
			</swiper-item>
			<swiper-item>
				<note-list v-if="id" ref="list-1" :udbWhere="udbWhere.note"></note-list>
			</swiper-item>
			<swiper-item>
				<video-list v-if="id" ref="list-2" :udbWhere="udbWhere.video"></video-list>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import parseImageUrl from "@/common/parseImageUrl.js";
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
				id: '',
				userData: {},
				followers: [],
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
				heighth: 600,
				udbWhere: {
					doc: '',
					note: '',
					video: ''
				},
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.heighth = uni.getWindowInfo().windowHeight - 44;
			this.udbWhere.doc = `user_id == '${this.id}' && article_status == 1`;
			this.udbWhere.note = `user_id == '${this.id}'`;
			this.udbWhere.video = `uploadUser == '${this.id}' && read_type == 1`;
			if (this.id) {
				this.getFollowers();
				this.getUserInfo();
			}
		},
		onPullDownRefresh() {
			this.$refs[`list-${this.curTab}`].refreshData();
		},
		onReachBottom() {
			this.$refs[`list-${this.curTab}`].loadMore();
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			isFollow(){
				return this.followers.includes(this.id);
			},
			isShowOper() {
				return this.userInfo._id !== this.id;
			}
		},
		methods: {
			async getUserInfo() {
				const cmsUserCollectDB = uniCloud.importObject('cms-user-co');
				let res = await cmsUserCollectDB.getByUserId({ user_id: this.id})
				if (res.data && res.data.length) {
					let tmps = res.data;
					if (tmps[0].avatar_file && tmps[0].avatar_file.url) {
						let coverImages = tmps.map(x => x.avatar_file.url);
						let resCoverImgs = await parseImageUrl(coverImages);
						tmps.forEach(x => {
							let img = resCoverImgs.find(y => y.source == x.avatar_file.url)
							if (img) {
								x.avator_src = img.src;
							}
						})
					}
					this.userData = tmps[0];
					console.log('getUserInfo')
					console.log(this.userData)
				}
			},
			getFollowers() {
				const cmsFollowerCollectDB = uniCloud.importObject('cms-follower-co');
				cmsFollowerCollectDB.get({
					user_id: this.userInfo._id
				}).then(res => {
					let tmps = []
					if (res.data.length) {
						tmps = res.data[0].followers ? res.data[0].followers.map(x => x.user_id) : []
					}
					this.followers = tmps;
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
page {
	background-color: #fff;
}
.user-page {
	background-color: #fff;
	width: 100%;
	.user-info {
		background-color: #fff;
		margin-bottom: 6px;
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		padding: 18px 12px;
		.user-avtor {
			height: 60px;
			width: 60px;
			border: solid 2px #ededed;
			border-radius: 100%;
			image {
				width: 100%;
				height: 100%;
				border-radius: 100%;
			}
		}
		.user-name {
			flex: 1;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			padding-left: 15px;
			.name {
				font-size: 20px;
				word-break: break-all;
			}
			.opers {
				display: inline-flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				margin-top: 8px;
				text {
					font-size: 12px;
					padding: 5px;
					background-color: #f2f2f2;
				}
				button {
					margin: 0;
				}
			}
		}
	}
	.ge-line {
		background-color: #f2f2f2;
		height: 6px;
		width: 100%;
	}
	.content {
		background-color: #fff;
	}
}
</style>