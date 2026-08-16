<template>
	<view class="content-d">
		<view class="content" v-if="!loading && title">
			<view class="meta">
				<view class="title">
				  <text class="text">{{ title }}</text>
				</view>
				<view class="excerpt">
				  <text class="text">{{ detailData.excerpt || '' }}</text>
				</view>
				<view class="author">
					<view class="like-1">
						<text class="t-text">分类: </text>
						<text class="r-text">{{ categary }} </text>
					</view>
					<view class="like-1">
						<text class="t-text">创建时间: </text>
						<uni-dateformat class="article-date" :date="detailData.create_date" format="yyyy-MM-dd hh:mm:ss"></uni-dateformat>
					</view>
				</view>
			</view>
			<u-parse class="article-content" :content="articleContent"></u-parse>
		</view>
		<u-loading-page v-if="loading"></u-loading-page>
		<u-empty class="ui-empty" v-if="!loading && !title" mode="data"></u-empty>
		<u-back-top :scroll-top="scrollTop" :iconStyle="iconStyle" :top="200"></u-back-top>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				categary: '',
				title: '',
				articleContent: '',
				detailData: {},
				loading: true,
				scrollTop: 0,
				iconStyle: {
					fontSize: '45rpx',
					color: '#fff'
				},
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.categary = options.categary;
			this.getData();
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
		  // 根据滚动位置判断是否显示导航栏
		  if (e.scrollTop > 100) {
		    uni.setNavigationBarTitle({
		      title: this.title
		    })
		  } else {
		    uni.setNavigationBarTitle({
		      title: ''
		    })
		  }
		},
		methods: {
			getData() {
				this.loading = true;
				let cmsWorksDB = uniCloud.importObject('cms-works-co');
				cmsWorksDB.get({
					id: this.id
				}).then(res => {
					if (res.data && res.data.length) {
						this.detailData = res.data[0];
						this.title = this.detailData.title;
						this.articleContent = this.detailData.content;
					}
					this.loading = false;
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	@mixin cp {
	  padding: 0 30rpx;
	}
.content-d {
	background-color: #fff;
	padding-bottom: 60px;
	padding: 20rpx 30rpx;
	.meta {
	  position: relative;
	  z-index: 1;
	  // padding-top: 20rpx;
	  .title {
	    .text {
	      font-size: 40rpx;
	      line-height: 66rpx;
	      font-weight: bold;
	      color: #333;
	    }
	  }
	
	  .excerpt {
	    margin-top: 10rpx;
	    .text {
	      font-size: 26rpx;
	      line-height: 40rpx;
	      color: #999;
	    }
	  }
	
	  .author {
	    display: flex;
	    align-items: center;
	    justify-content: space-between;
	    flex-direction: row;
	    margin-top: 20rpx;
		.like-1 {
			font-size: 12px;
		}
		.likes {
			display: inline-flex;
			align-items: center;
			.like-2 {
				margin-left: 10px;
			}
		}
	
	    .at,
	    .split,
	    .date {
	      font-size: 26rpx;
	      color: #ccc;
	    }
	
	    .split {
	      margin: 0 10rpx;
	    }
	  }
	}
	.article-content {
		line-height: 1.75;
		font-size: 32rpx;
		margin-top: 40rpx;
		padding-bottom: 80rpx;
		word-break: break-word;
		color: #333;
	}
	.ui-empty {
		position: relative;
		top: 50px;
	}
}
</style>