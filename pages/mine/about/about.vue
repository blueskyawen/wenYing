<template>
	<view class="about">
		<view class="box">
			<image class="logoImg" :src="about.logo"></image>
			<text class="tip appName">{{about.appName}}</text>
			<text class="tip">Version {{version}}</text>
			<view class="qrcode">
				<!--uqrcode 组件来源，插件Sansnn-uQRCode 链接地址：https://ext.dcloud.net.cn/plugin?id=1287-->
				<uqrcode :size="100" canvas-id="qrcode" :value="about.download"></uqrcode>
			</view>
			
			<text class="tip">扫描二维码，下载 {{about.appName}} 客户端</text>
		</view>
		<view class="copyright">
			<view class="agreement-box">
			<text v-for="(agreement,index) in agreements" :key="index">
				<text class="agreement" @click="navigateTo(agreement)">《{{agreement.title}}》</text>
				<text class="hint" v-if="agreements.length-1 > index">和</text>
			</text>
			</view>
			<text class="hint">Copyright © {{year}}</text>
			<text class="hint">{{about.company}}</text>
		</view>
	</view>
</template>

<script>
	import uniIdPagesConfig from '@/uni_modules/uni-id-pages/config.js';
	import uqrcode from "@/uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode"
	
	export default {
		components:{
			uqrcode
		},
		data() {
			return {
				version: "V1.0.0",
				year: "2020",
				about: {}
			}
		},
		computed: {
			uniStarterConfig() {
				return getApp().globalData.config
			},
			agreements() {
				if(!uniIdPagesConfig.agreements){
					return []
				}
				let {serviceUrl,privacyUrl} = uniIdPagesConfig.agreements
				return [
					{
						url:serviceUrl,
						title:"用户服务协议"
					},
					{
						url:privacyUrl,
						title:"隐私政策条款"
					}
				]
			}
		},
		created() {
			this.about = this.uniStarterConfig.about
			uni.setNavigationBarTitle({
				title: "关于 " + this.about.appName
			})
			this.year = (new Date).getFullYear()
		},
		onLoad() {
			// #ifdef APP-PLUS
			this.version = plus.runtime.version
			// #endif
		},
		methods: {
			navigateTo({
				url,
				title
			}) {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/common/webview/webview?url=' + url + '&title=' + title,
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	view{
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}
	/* #endif */
	.about {
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.box {
		margin-top: 60px;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.logoImg {
		margin-bottom: 10rpx;
		width: 160rpx;
		height: 160rpx;
		border-radius: 15px;
	}

	.tip {
		text-align: center;
		font-size: 24rpx;
		margin-top: 10px;
		padding: 10rpx;
	}

	.appName {
		margin-top: 20px;
		font-size: 42rpx;
		font-weight: 500;
	}

	.qrcode ,.qrcode .uqrcode{
		margin: 10px 0;
		width: 100px;
		height: 100px;
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
	}

	.copyright {
		font-size: 32rpx;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		bottom: 20px;
		// left: 0;
		position: fixed;
	}

	.agreement-box {
		justify-content: center;
		flex-direction: row;
	}

	.agreement {
		color: #2285ff;
		font-size: 26rpx;
	}

	.hint {
		text-align: center;
		color: #999999;
		font-size: 26rpx;
	}
</style>