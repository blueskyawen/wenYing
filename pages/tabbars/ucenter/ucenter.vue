<template>
	<view class="ucenter">
		<uni-sign-in ref="signIn"></uni-sign-in>
		<view class="userInfo" @click.capture="toUserInfo"  :style="{ height: heighth + 'px' }">
			<view class="user">
				<u-avatar v-if="hasLogin && (userInfo.nickname || (userInfo.avatar_file && userInfo.avatar_file.url))" 
					:src="avatorImg" :text="nameText" :size="60" :font-size="24" bg-color="#ffb34b"></u-avatar>
				<view v-else class="defaultAvatarUrl">
					<uni-icons color="#ffffff" size="50" type="person-filled" />
				</view>

				<view class="logo-title">
					<text class="uer-name" v-if="hasLogin">{{userInfo.nickname||userInfo.username||userInfo.mobile|| '未设置'}}</text>
					<text class="uer-name" v-else>请登录</text>
				</view>
			</view>
		</view>
<!-- 		<u-grid class="grid" :border="false" col="3">
			<u-grid-item class="item" v-for="(item,index) in gridList" @click.native="tapGrid(index)" :key="index">
				<u-icon class="icon" :name="item.icon" color="#007AFF" size="26"></u-icon>
				<text class="text">{{item.text}}</text>
			</u-grid-item>
		</u-grid> -->
		<view class="status-wrap">
			<view class="status-list">
				<view class="status-item" hover-class="btn-hover" v-for="(item, index) in gridList" :key="index" @click="tapGrid(index)">
					<u-icon class="icon" :name="item.icon" color="#007AFF" size="26"></u-icon>
					<view class="item-text">{{ item.text }}</view>
				</view>
			</view>
		</view>
		<uni-list class="center-list">
			<uni-list-item v-for="(item,index) in ucenterList" :key="index" :title="item.title" link :rightText="item.rightText" 
				:clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#999'}">
				<template v-slot:footer>
					<view v-if="item.showBadge" class="item-footer">
						<text class="item-footer-text">{{item.rightText}}</text>
						<view class="item-footer-badge"></view>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js';
	// #ifdef APP
	import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update';
	import callCheckVersion from '@/uni_modules/uni-upgrade-center-app/utils/call-check-version';
	// #endif
	const db = uniCloud.database();
	import parseImageUrl from "@/common/parseImageUrl.js"
	
	export default {
		data() {
			return {
				gridList: [
					{
						"text": '喜欢',
						"icon": "heart",
						"title": "myLikes"
					},
					{
						"text": '收藏',
						"icon": "star",
						"title": "myCollect"
					},
					{
						"text": '浏览记录',
						"icon": "order",
						"title": "readLog"
					}
				],
				ucenterList: [
					{
						"title": '我关注的',
						"to": '/pages/followers/followers',
						"icon": "auth-filled"
					},
					{
						"title": '我的文章',
						"to": '/pages/myWorks/myWorks',
						"icon": "wallet"
					},
					{
						"title": '我的小记',
						"to": '/pages/myNotes/myNotes',
						"icon": "paperplane"
					},
					{
						"title": '我的视频',
						"to": '/pages/myVideo/myVideo',
						"icon": "videocam"
					},
					// #ifdef APP-PLUS
					{
						"title": '看广告签到',
						"event": 'signInByAd',
						"icon": "compose"
					},
					// #endif
					{
						"title": '签到',
						"event": 'signIn',
						"icon": "compose"
					},
					// #ifdef APP-PLUS
					{
						"title": '去评分',
						"event": 'gotoMarket',
						"icon": "chat"
					},
					//#endif
					{
						"title": '我的积分',
						"to": '',
						"event": 'getScore',
						"icon": "fire"
					},
					// #ifdef APP
					// #ifndef APP-HARMONY
					{
						"title": '分销推荐',
						"event": 'share',
						"icon": "redo"
					},
					// #endif
					// #endif
					{
						"title": '问题与反馈',
						"to": '/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback',
						"icon": "help"
					},
					{
						"title": '设置',
						"to": '/pages/mine/settings/settings',
						"icon": "gear"
					}
					// #ifdef APP
					,{
						"title": '关于',
						"to": '/pages/mine/about/about',
						"icon": "info"
					},
					// #endif
				],
				avatorImg: '',
				heighth: 160
			}
		},
		computed: {
			nameText() {
				return this.avatorImg ? '' : this.userInfo && this.userInfo.nickname ? this.userInfo.nickname[0] : '';
			},
			userInfo() {
				return store.userInfo
				// return {
				// 	nickname: '蓝天白云',
				// 	username: 'awen',
				// 	mobile: '15555555555',
				// 	avatar_file: {}
				// }
			},
			hasLogin(){
				// return true
				return store.hasLogin
			},
			// #ifdef APP-PLUS
			appVersion() {
				return getApp().appVersion
			},
			// #endif
			appConfig() {
				return getApp().globalData.config
			}
		},
		onLoad() {
			//#ifdef APP-PLUS
			this.ucenterList[this.ucenterList.length - 2].unshift({
				title: "检查更新",
				rightText: this.appVersion.version + '-' + this.appVersion.versionCode,
				event: 'checkVersion',
				icon: 'loop',
				showBadge: this.appVersion.hasNew
			})
			//#endif
			this.heighth = Math.floor((uni.getWindowInfo().windowHeight * 33) / 100);
		},
		onReady() {
			this.getAvatorImg()
		},
		methods: {
			async getAvatorImg() {
				if (this.userInfo.avatar_file && this.userInfo.avatar_file.url) {
					let images = [this.userInfo.avatar_file.url];
					let resImgs = await parseImageUrl(images);
					this.avatorImg = resImgs[0] ? resImgs[0].src : '';
				}
			},
			toUserInfo() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
				})
			},
			tapGrid(index) {
				let path = this.gridList[index].title;
				uni.navigateTo({
					url: `/pages/mine/${path}/${path}`
				})
			},
			ucenterListClick(item) {
				if (!item.to && item.event) {
					this[item.event]();
				}
			},
			signIn() { //普通签到
				this.$refs.signIn.open()
			},
			signInByAd(){ //看激励视频广告签到
				this.$refs.signIn.showRewardedVideoAd()
			},
			gotoMarket() {
				// #ifdef APP-PLUS
				const platform = uni.getSystemInfoSync().platform.toLocaleLowerCase();
				if (platform === "ios") {
					// 这里填写appstore应用id
					let appstoreid = this.appConfig.marketId.ios; // 'id1417078253';
					console.log({appstoreid});
					plus.runtime.openURL("itms-apps://" + 'itunes.apple.com/cn/app/wechat/' + appstoreid + '?mt=8',err=>{
						console.log('plus.runtime.openURL err:' + JSON.stringify(err));
					});
				}
				if (platform === "android") {
					var Uri = plus.android.importClass("android.net.Uri");
					var uri = Uri.parse("market://details?id=" + this.appConfig.marketId.android);
					var Intent = plus.android.importClass('android.content.Intent');
					var intent = new Intent(Intent.ACTION_VIEW, uri);
					var main = plus.android.runtimeMainActivity();
					main.startActivity(intent);
				}
				if (platform === "harmonyos") {
					uni.showToast({
						title: "当前平台暂不支持跳转应用市场",
						icon: "none"
					});
				}
				// #endif
			},
			getScore() {
				if (!this.userInfo) {
					return uni.showToast({
						title: '请登录后查看积分',
						icon: 'none'
					});
				}

				uni.showLoading({
					mask: true
				})
				db.collection("uni-id-scores")
					.where('"user_id" == $env.uid')
					.field('score,balance')
					.orderBy("create_date", "desc")
					.limit(1)
					.get()
					.then((res) => {
						console.log(res);
						const data = res.result.data[0];
						let msg = '';
						msg = data ? ('当前积分为 ' + data.balance) : '当前无积分';
						uni.showToast({
							title: msg,
							icon: 'none'
						});
					}).finally(()=>{
						uni.hideLoading()
					})
			},
			async checkVersion() {
				let res = await callCheckVersion()
				console.log(res);
				if (res.result.code > 0) {
					checkUpdate()
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					});
				}
			},
			share() {
				uni.showToast({
					title: '点击分享',
					icon: 'none'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
page {
	background: #f2f2f2;
	// height: 100%;
}
/* #ifndef APP-NVUE */
view {
	display: flex;
	box-sizing: border-box;
	flex-direction: column;
}

page {
	background-color: #f8f8f8;
	//height: 100%;
}
/* #endif*/
.ucenter {
	height: 100%;
	// display: flex;
	// flex: 1;
	// flex-direction: column;
	background-color: #f2f2f2;
	.userInfo {
		height: 40%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		display: flex;
		background-color: #c4c6c9;
		.user {
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.defaultAvatarUrl{
			width: 150rpx;
			height: 150rpx;
			background-color: #3c9cff;
			border-radius: 100%;
			justify-content: center;
			align-items: center;
		}
		.logo-title {
			flex: 1;
			align-items: center;
			justify-content: space-between;
			flex-direction: row;
			.uer-name {
				height: 70rpx;
				line-height: 70rpx;
				font-size: 38rpx;
				color: #FFFFFF;
			}
		}
	}
	.grid {
		background-color: #FFFFFF;
		margin-bottom: 6px;
		//padding: 36rpx 0;
		.item {
			padding: 36rpx 0;
		}
		.text {
			font-size: 16px;
			height: 25px;
			line-height: 25px;
			color: #817f82;
		}
		.item ::v-deep .uni-grid-item__box {
			justify-content: center;
			align-items: center;
		}
	}
	.status-wrap {
		overflow: hidden;
		.status-list {
			display: flex;
			flex-direction: row;
			align-items: center;
			background: #fff;
			padding-top: 36rpx;
			padding-bottom: 36rpx;
			margin-bottom: 5px;
			.status-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				.item-icon {
					line-height: 1;
					font-size: 65rpx;
					color: #bbb;
				}
				.item-text {
					font-size: 28rpx;
					color: #666;
					margin-top: 5rpx;
				}
			}
		}
	}

	.center-list {
		//margin-bottom: 30rpx;
		background-color: #f9f9f9;
	}
	/*修改边线粗细示例*/
	/* #ifndef APP-NVUE */
	.center-list ::v-deep .uni-list--border:after {
		-webkit-transform: scaleY(0.2);
		transform: scaleY(0.2);
		margin-left: 80rpx;
	}
	
	.center-list ::v-deep .uni-list--border-top,
	.center-list ::v-deep .uni-list--border-bottom {
		display: none;
	}
	
	/* #endif */
	.item-footer {
		flex-direction: row;
		align-items: center;
	}
	
	.item-footer-text {
		color: #999;
		font-size: 24rpx;
		padding-right: 10rpx;
	}
	
	.item-footer-badge {
		width: 20rpx;
		height: 20rpx;
		/* #ifndef APP-NVUE */
		border-radius: 50%;
		/* #endif */
		/* #ifdef APP-NVUE */
		border-radius: 10rpx;
		/* #endif */
		background-color: #DD524D;
	}
}
</style>