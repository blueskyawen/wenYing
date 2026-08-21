<template>
	<view class="wy-video">
		<swiper class="swiper" :style="{ height: heighth + 'px' }" vertical circular @change="changeVideo">
			<swiper-item v-for="(item,index) in showList" :key="index">
				<view class="swiper-item">
					<video class="video" :src="item.url" :id="`video_${index}`" :controls="false" loop 
						:show-fullscreen-btn="false" :show-center-play-btn="false" play-btn-position="center" objectFit="cover" preload 
						:enable-play-gesture="true" :enable-progress-gesture="true" ref="video_url" @click="tapVideo" @pause="pauseChange"></video>
					
					<cover-image class="play" v-if="pauseFlag" src="/static/yhdsl/play.png" @click="tapVideo"></cover-image>
				</view>
			</swiper-item>
		</swiper>
		<view class="cover-view-left">
			<view class="view-left-text">@{{ curItem.autorName }}</view>
			<view class="view-title">{{ curItem.title }}</view>
			<view class="view-left-text-content" id="desRef">
				<view class="text-content-text" :class="{'visive': isExpand}">{{ curItem.description }}</view>
<!-- 				<u-icon v-if="isShowDesMore" class="more" :name="isExpand ? 'arrow-up-fill' : 'arrow-down-fill'"
					color="#fcfcfc" size="13" @click="isExpand = !isExpand"></u-icon> -->
				<image v-if="isShowDesMore" class="more" src="/static/yhdsl/shouqi.png" :class="{'zhankai': !isExpand}" @click="isExpand = !isExpand"></image>
			</view>
			<view class="view-tags" v-if="curItem.tagList">
				<text v-for="tag in curItem.tagList" :key="tag._id" @tap="cilckTag(tag)">#{{tag.name}}</text>
			</view>
		</view>
		<cover-view class="cover-view-right">
			<cover-view class="item-img">
				<cover-image class="avator img r-item" :src="curItem.avatar_url" @tap="tapAutor"></cover-image>
				<cover-view v-if="!showOpers && !isFollow" class="right-follow" @tap="tapfollow">+</cover-view>
			</cover-view>
			<cover-view class="item-img" v-if="!showOpers">
				<cover-image
					:src="curItem.isLike ? '/static/yhdsl/like2.png' : '/static/yhdsl/like1.png'"
					class="img-left" @tap="tapLike"
				></cover-image>
				<cover-view class="right-text">{{ curItem.like_count || 0 }}</cover-view>
			</cover-view>
			<cover-view class="item-img" v-if="!showOpers">
				<cover-image :src="curItem.isCollect ? '/static/yhdsl/shouchang2.png' : '/static/yhdsl/shouchang1.png'" 
					class="img-left" @tap="tapCollect"></cover-image>
				<cover-view class="right-text">{{ curItem.collect_count || 0 }}</cover-view>
			</cover-view>
			<cover-view class="item-img" v-if="!showOpers">
				<cover-image src="/static/yhdsl/zhuanfa.png" class="img-left"></cover-image>
				<cover-view class="right-text" @tap="tapShare">{{ curItem.zhuanfa_count || 0 }}</cover-view>
			</cover-view>
			<cover-view class="item-img" v-if="showOpers">
				<cover-image src="/static/yhdsl/more-opers.png" 
					class="img-left"  @tap="openActionsPlane"></cover-image>
				<cover-view class="right-text"@tap="openActionsPlane">更多</cover-view>
			</cover-view>
			<cover-image src="/static/yhdsl/changp.png" class="carIcon img"></cover-image>
		</cover-view>
		<view id="curDes" class="cur-des">
			<text>{{ curItem.description }}</text>
		</view>
	</view>
</template>

<script>
	const cmsVideoLikeDB = uniCloud.importObject('cms-video-like-co');
	const cmsVideoCollectDB = uniCloud.importObject('cms-video-collect-co');
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		props: {
			list: {
				type: Array,
				default: () => []
			},
			total: {
				type: Number,
				default: 0
			},
			showOpers: {
				type: Boolean,
				default: false
			},
			likeItems: {
				type: Array,
				default: () => []
			},
			collectItems: {
				type: Array,
				default: () => []
			},
			followers: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				preIndex: 0,
				current: 0,
				videoCtx: null,
				pauseFlag: true,
				heighth: 500,
				pauseUrl: '',
				isExpand: false,
				curRefWidth: 0,
				allRefWidth: 0,
				start: 0
			}
		},
		created() {
			this.heighth = uni.getWindowInfo().windowHeight;
		},
		computed: {
			showList() {
				return this.list.slice(this.start, this.start + 10)
			},
			curItem() {
				return this.list.length ? this.list[this.current + this.start] : {}
			},
			isShowDesMore() {
				console.log('curRefWidth='+this.curRefWidth+';allRefWidth='+this.allRefWidth)
				return (this.curRefWidth * 2) < this.allRefWidth;
			},
			userInfo() {
				return store.userInfo
			},
			hasLogin(){
				return store.hasLogin
			},
			isFollow() {
				return this.followers.includes(this.curItem.uploadUser)
			}
		},
		methods: {
			pauseChange() {
				this.pauseFlag = true;
				this.pauseUrl = this.showList[this.current].url;
			},
			tapVideo(check) {
				console.log('pauseChange')
				if (this.pauseFlag) {
					let seek_0 = false
					if (check) {
						if (this.current + this.start > this.total) {
							// 切换页面切回重新获取新列表数比暂停视频index小, 重置current
							this.current = 0;
							this.start = 0;
						} else {
							// 切换页面切回重新获取新列表数比暂停视频index大, 但对应索引视频不一样,重新进度条
							if (this.showList[this.current].url !== this.pauseUrl) {
								seek_0 = true;
							}	
						}
					}
					this.videoPlay(seek_0);
					this.pauseFlag = false;
				} else {
					this.pauseVideo(this.current);
					// this.pauseFlag = true;
				}
			},
			pauseVideo(index) {
				uni.createVideoContext(`video_${index}`, this).pause();
			},
			changeVideo(e) {
				console.warn('e.detail.current == ' + e.detail.current)
				console.log('total =' + this.total +'; this.start=' + this.start)
				console.log('preIndex =' + this.preIndex +'; this.current=' + this.current)
				// 判断是否到顶或到底
				// if (this.preIndex == 0) {
				// 	uni.showToast({
				// 		title: '到顶了',
				// 		duration: 1000
				// 	});
				// 	return false;
				// }
				// if (this.preIndex + 1 >= this.total) {
				// 	uni.showToast({
				// 		title: '到底了',
				// 		duration: 1000
				// 	});
				// 	return false;
				// }
				if (e.detail.current == 0 && this.current > 1) {
					if (this.total > (this.current + this.start + 1)) {
						console.log('aaaaaaaaaaaaa')
						this.pauseVideo(this.preIndex);
						this.start += 10;
						setTimeout(() => {
							this.current = e.detail.current;
							this.preIndex = this.current;
							this.pauseFlag = false;
							this.videoPlay();
						}, 100);
						return;
					}
				} else if (e.detail.current == (this.total - this.start - 1)) {
					if (this.total > (this.current + this.start + 1)) {
						console.log('bbbbbbbbbbbbbbbbb')
						this.pauseVideo(this.preIndex);
						this.start -= 10;
						setTimeout(() => {
							this.current = e.detail.current;
							this.preIndex = this.current;
							this.pauseFlag = false;
							this.videoPlay();
						}, 100);
						return;
					}
				}
				
				this.current = e.detail.current;
				// 暂停之前的视频
				this.pauseVideo(this.preIndex);
				// 先重置视频进度，然后播放现在的视频
				setTimeout(() => {
					this.preIndex = this.current;
					this.pauseFlag = false;
					this.videoPlay();
				}, 100);
				
				// 判断是否到最后3条数据, 提前加载数据
				this.checkTouthBottom();
			},
			checkTouthBottom() {
				if (this.current + 3 >= this.total) {
					this.$emit('loadMore');
				}
			},
			videoPlay(seek_0) {
				this.checkShowDespMore()
				this.videoCtx = uni.createVideoContext(`video_${this.current}`, this);
				if (!this.pauseFlag || seek_0) {
					this.videoCtx.seek(0);	
				}
				this.videoCtx.play();
			},
			playVideo() {
				if (!this.list.length) return;
				let _this = this;
				// 获取视频列表
				let trailer = this.list;
				trailer.forEach((item, index) => { // 获取json对象并遍历, 停止非当前视频
					if (item.url != null && item.url != "") {
						let temp = 'video_' + index;
						if (index != this.current) {
							// 暂停其余视频
							uni.createVideoContext(temp, _this).pause(); //暂停视频播放事件
						}
					}
							
				})
				let currentId = 'video_' + this.current; // 获取当前视频id
				this.videoCtx = uni.createVideoContext(currentId, _this)
				this.videoCtx.play();
			},
			animationfinish(e) {
				this.current = e.detail.current;
				console.warn('animationfinish == ' + e.detail.current)
				// this.playVideo()
			},
			cilckTag(tag) {
				uni.navigateTo({
					url: `/pages/videos/search/search?tagId=${tag._id}&tagName=${tag.name}`
				})
			},
			checkShowDespMore() {
				uni.createSelectorQuery().in(this).select("#desRef").boundingClientRect().exec(e => {
					this.curRefWidth = e[0] ? e[0].width : 0
				})
				uni.createSelectorQuery().in(this).select("#curDes").boundingClientRect().exec(e => {
					this.allRefWidth = e[0] ? e[0].width : 0
				})
				// this.isShowDesMore = (innerwidth * 2) < scrollwidth;
			},
			tapLike() {
				if (!this.hasLogin) {
					uni.showToast({
						title: "请先登录",
						icon: "none"
					});
					return;
				}
				this.$emit('action-change', {
					type: 'tapLike',
					action: 'click',
					value: {
						...this.curItem
					}
				});
			},
			tapCollect() {
				if (!this.hasLogin) {
					uni.showToast({
						title: "请先登录",
						icon: "none"
					});
					return;
				}
				this.$emit('action-change', {
					type: 'tapCollect',
					action: 'click',
					value: {
						...this.curItem
					}
				});
			},
			tapShare() {},
			openActionsPlane() {
				this.$emit('show-aciton', {...this.curItem})
			},
			tapfollow() {
				if (!this.hasLogin) {
					uni.showToast({
						title: "请先登录",
						icon: "none"
					});
					return;
				}
				this.$emit('action-change', {
					type: 'follow',
					action: '',
					value: {
						user_id: this.curItem.uploadUser,
						name: this.curItem.autorName,
						avatar: this.curItem.avatar_url == '/static/logo.jpg' ? '' : this.curItem.avatar_url
					}
				})
			},
			tapAutor() {
				if (this.showOpers) return;
				uni.navigateTo({
					url: `/pages/followers/detail/detail?id=${this.curItem.uploadUser}`
				})
			}
		}
	}
</script>

<style lang="scss">
.wy-video {
	position: relative;
	.cur-des {
		position: fixed;
		z-index: -1;
		top: 0;
		color: transparent;
		width: max-content;
		//z-index: 999;
		//color: red;
	}
	.cover-view-left {
		position: absolute;
		margin-left: 28upx;
		width: 580upx;
		bottom: 20px;
		z-index: 9999;
		font-size: 12px;
		color: #fcfcfc;
		.view-left-text {
			color: #fcfcfc;
			font-size: 20px;
			margin-bottom: 12rpx;
			font-weight: bold;
		}
		.view-title {
			font-size: 14px;
			margin-bottom: 6rpx;
		}
		.view-left-text-content {
			flex: 1;
			position: relative;
			// height: 80upx;
			.text-content-text {
				color: #fcfcfc;
				font-size: 13px;
				line-height: 40upx;
				display: -webkit-box;
				-webkit-line-clamp: 2;    /* 限制显示行数 */
				-webkit-box-orient: vertical;
				overflow: hidden;
				white-space: normal;
				text-overflow: ellipsis;
				&.visive {
					display: block;
				}
				::v-deep .uni-cover-view {
					display: inherit;
					-webkit-line-clamp: 2;    /* 限制显示行数 */
					-webkit-box-orient: vertical;
					overflow: hidden;
					white-space: normal;
					text-overflow: ellipsis;
				}
			}
			.more {
				position: absolute;
				right: 0;
				bottom: 2px;
				color: #fcfcfc;
				width: 13px;
				height: 13px;
				&.zhankai {
					transform: rotate(180deg);
				}
			}
		}
		.view-tags text {
			margin-left: 3px;
			color: #94bcff;
		}
	}
	.cover-view-right {
		position: absolute;
		bottom: 20px;
		right: 30upx;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.item-img {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
			.avator {
				border-radius: 50%;
				border-width: 6upx;
				border-style: solid;
				border-color: #ffffff;
				height: 90upx;
				width: 90upx;
				background-color: #15b5f6;
			}
			.right-follow {
				position: absolute;
				z-index: 100;
				left: 36upx;
				top: 78upx;
				color: #ffffff;
				font-size: 34rpx;
				width: 34upx;
				height: 34upx;
				background-color: #f12f5b;
				text-align: center;
				line-height: 34upx;
				border-radius: 50%;
			}
		.r-item {
			margin-bottom: 100upx;
		}
		@keyframes turn {
			from {
				-webkit-transform: rotate(0deg);
				transform: rotate(0deg);
			}			
			to {
				-webkit-transform: rotate(360deg);
				transform: rotate(360deg);
			}
		}
		.carIcon {
			height: 90upx;
			width: 90upx;
			border-radius: 100%;
			animation: turn 3s linear infinite;
		}
		.img-left {
			width: 80upx;
			height: 66upx;
		}
		.right-text {
			color: #ffffff;
			font-size: 11px;
			text-align: center;
			margin-bottom: 40upx;
			margin-top: 8upx;
		}
	}
}
.wy-video .swiper {
	width: 100vw;
	position: relative;
	top: 0;
	left: 0;
	.swiper-item {
		width: 100%;
		height: 100%;
		.video {
			width: 100%;
			height: 100%;
		}
		.play {
			position: absolute;
			width: 20vw;
			height: 20vw;
			left: 40vw;
			top: 40vh;
			opacity: 0.5;
		}
		.cover-view-right2 {
			position: absolute;
			bottom: 20px;
			right: 30upx;
			z-index: 9999;
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.item-img {
				position: relative;
				display: flex;
				flex-direction: column;
				align-items: center;
			}
				.avator {
					border-radius: 50%;
					border-width: 6upx;
					border-style: solid;
					border-color: #ffffff;
					height: 90upx;
					width: 90upx;
				}
				.right-follow {
					position: absolute;
					z-index: 100;
					left: 36upx;
					top: 78upx;
					color: #ffffff;
					font-size: 18px;
					width: 34upx;
					height: 34upx;
					background-color: #f12f5b;
					text-align: center;
					line-height: 34upx;
					border-radius: 50%;
				}
			.r-item {
				margin-bottom: 100upx;
			}
			@keyframes turn {
				0% {
					-webkit-transform: rotate(0deg);
				}
					
				25% {
					-webkit-transform: rotate(90deg);
				}
					
				50% {
					-webkit-transform: rotate(180deg);
				}
					
				75% {
					-webkit-transform: rotate(270deg);
				}
					
				100% {
					-webkit-transform: rotate(360deg);
				}
			}
			.carIcon {
				height: 90upx;
				width: 90upx;
				border-radius: 100%;
				animation: turn 3s linear infinite;
			}
			.img-left {
				width: 80upx;
				height: 66upx;
			}
			.right-text {
				color: #ffffff;
				font-size: 11px;
				text-align: center;
				margin-bottom: 40upx;
			}
		}
		.cover-view-left2 {
			position: absolute;
			margin-left: 28upx;
			width: 580upx;
			bottom: 20px;
			z-index: 9999;
			font-size: 12px;
			color: #fcfcfc;
			.view-left-text {
				color: #fcfcfc;
				font-size: 20px;
				margin-bottom: 12rpx;
				font-weight: bold;
			}
			.view-title {
				font-size: 14px;
				margin-bottom: 6rpx;
			}
			.view-left-text-content {
				flex: 1;
				position: relative;
				height: 80upx;
				.text-content-text {
					color: #fcfcfc;
					font-size: 13px;
					line-height: 40upx;
					display: -webkit-box;
					-webkit-line-clamp: 2;    /* 限制显示行数 */
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
				.more {
					position: absolute;
					right: 0;
					bottom: 2px;
					color: #fcfcfc;
				}
			}
			.view-tags text {
				margin-left: 3px;
				color: #94bcff;
			}
		}
	}
}
</style>