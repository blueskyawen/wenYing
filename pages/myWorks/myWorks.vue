<template>
	<view class="my-works">
	  <u-sticky bgColor="#fff">
		<u-tabs :list="tablist" @click="clickTab"></u-tabs>
	  </u-sticky>
	  <unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}" :where="udbWhere"
	  	collection="opendb-news-articles" @load="isLoading == false" @error="isLoading == false"
	  	:page-size="10">
	  	<uni-list>
	  		<uni-list-item v-for="(item, index) in data" :key="index" :clickable="!isSetting"
	  			@click="handleItemClick(item)">
	  			<template v-slot:body>
	  				<view class="item">
	  					<text>{{item.title}}</text>
	  					<view class="time-row">
							<view class="time-l">
								<text class="t-text">分类: </text>
								<text class="r-text">{{ categaryObj[item.category_id] }} </text>
							</view>
							<view class="time-l">
								<text class="t-text">{{ timeTitle }}: </text>
								<uni-dateformat class="article-date" :date="showTime(item)" format="yyyy-MM-dd hh:mm:ss"></uni-dateformat>
							</view>
	  					</view>
						<view v-if="isSetting" class="oper-row">
							<view>
								<view v-if="curTab == 0" class="oper-i" @tap.stop="clickEdit(item)">
									<u-icon name="edit-pen" size="16"></u-icon>
									<text>编辑</text>
								</view>
								<view v-if="curTab == 0" class="oper-i ml-2" @tap.stop="clickReview(item)">
									<u-icon name="attach" size="16"></u-icon>
									<text>发布审核</text>
								</view>
								<view v-if="curTab == 2" class="oper-i ml-2" @tap.stop="closeReview(item)">
									<u-icon name="close-circle" size="16"></u-icon>
									<text>撤销审核</text>
								</view>
								<view v-if="curTab == 0 || curTab == 1" class="oper-i ml-2 oper-r" @tap.stop="clickDelete(item)">
									<u-icon name="trash" size="16" color="#fff"></u-icon>
									<text>删除</text>
								</view>
							</view>
						</view>
						<view v-if="item.reviewRejectReason" class="error-row">
							<u-alert :title="item.reviewRejectReason" type="error" :closable="true" 
								:showIcon="true" :fontSize="12" style="max-width: 100%;"></u-alert>
						</view>
					</view>
	  			</template>
	  		</uni-list-item>
	  	</uni-list>
	  	<uni-load-state @networkResume="refreshData" :state="{data,pagination,hasMore, loading, error}" @loadMore="loadMore"></uni-load-state>
	  </unicloud-db>
	  <view class="action-tabbar">
		  <view class="action-row">
			  <view class="a-item" @tap.stop="clickSeting">
				  <u-icon name="setting" size="16"></u-icon>
				  <text>{{ setTitle }}</text>
			  </view>
			  <view class="a-item action-r" @tap.stop="clickAdd">
				  <u-icon name="plus" size="16"></u-icon>
				  <text>创建</text>
			  </view>
		  </view>
	  </view>
	</view>
</template>

<script>
	import uniLoadState from "@/uni_modules/uni-cms-article/components/uni-load-state/uni-load-state.vue";
	export default {
		components: {
			uniLoadState
		},
		data() {
			return {
				tablist: [
					{
						name: '草稿',
						value: 'draft'
					},
					{
						name: '已发布',
						value: 'publish'
					},
					{
						name: '待审核',
						value: 'reviewWait'
					}
				],
				curTab: 0,
				isLoading: true,
				categaryObj: {},
				isSetting: false
			}
		},
		computed: {
			loginUserId() {
				return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
			},
			udbWhere() {
				return `user_id=='${this.loginUserId}' && article_status==${this.curTab}`;
			},
			timeTitle() {
				return this.curTab == 0 ? '创建时间' : this.curTab == 1 ? '发布时间' : '送审时间';
			},
			setTitle() {
				return this.isSetting ? '退出管理' : '管理'
			},
			showSetBtn() {
				// return true;
				return this.isSetting && (this.curTab == 0 || this.curTab == 2);
			}
		},
		onPullDownRefresh() {
			this.refreshData();
		},
		onLoad() {
			this.init();
			uni.$on('add-doc-sucess', this.refreshData);
		},
		onUnload() {
			uni.$off('add-doc-sucess')
		},
		onHide() {
			this.isSetting = false;
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			init() {
				const uniCaptchaDemo = uniCloud.importObject('cms-categary-co')
				uniCaptchaDemo.getList().then(res => {
					let list = res.data || [];
					if (list.length) {
						this.categaryObj = {};
						list.forEach(x => {
							this.categaryObj[x._id] = x.name;
						})
					}
				});
			},
			showTime(i) {
				return this.curTab == 0 ? i.create_date : this.curTab == 1 ? i.publish_date  : i.review_date; 
			},
			clickTab(e) {
				this.curTab = e.index;
				setTimeout(() => {
					this.refreshData();
				}, 100)
			},
			refreshData() {
				this.$refs.udb.loadData({
					clear: true
				}, (res) => {
					uni.stopPullDownRefresh()
				})
			},
			loadMore() {
				this.$refs.udb.loadMore()
			},
			handleItemClick(item) {
				uni.navigateTo({
					url: '/pages/myWorks/detail/detail?id=' + item._id +'&categary=' + this.categaryObj[item.category_id]
				})
			},
			clickSeting() {
				this.isSetting = !this.isSetting;
			},
			clickAdd() {
				uni.navigateTo({
					url: '/pages/myWorks/add/add'
				})
			},
			clickEdit(item) {
				uni.navigateTo({
					url: '/pages/myWorks/add/add?id=' + item._id
				})
			},
			clickDelete(item) {
				let isDelPublish = this.curTab == 1 && item.article_status == 1;
				let texttitle = isDelPublish ? '已发布的文章要进行删除审核, 删除后不可恢复, 确定要删除吗?' : '执行删除后数据将不可恢复, 确定要删除吗?'
				uni.showModal({
					title: '确认删除',
					content: texttitle,
					confirmColor: '#e43d33',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							if (isDelPublish) {
								this.procReview(item, true);
							} else {
								this.procDel(item);
							}
						}
					}
				});
			},
			procDel(item) {
				let cmsWorksDB = uniCloud.importObject('cms-works-co');
				cmsWorksDB.delete({
					id: item._id
				}).then(res => {
					if (res.status == 0) {
					  uni.showToast({
						title: res.msg,
						icon: "none"
					  });
					  this.refreshData();
					} else {
						uni.showToast({
							title: res.msg,
							icon: "error"
						});
					}
				});
			},
			closeReview(item) {
				uni.showModal({
					title: '撤销审核',
					content: '执行后数据将返回草稿箱',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							this.procCloseReview(item);
						}
					}
				});
			},
			procCloseReview(item) {
				let cmsWorksDB = uniCloud.importObject('cms-works-co');
				cmsWorksDB.updateStatus({
					id: item._id,
					article_status: 0
				}).then(res => {
					if (res.status == 0) {
					  uni.showToast({
						title: res.msg,
						icon: "none"
					  });
					  this.refreshData();
					} else {
						uni.showToast({
							title: res.msg,
							icon: "error"
						});
					}
				});
			},
			clickReview(item) {
				uni.showModal({
					title: '发布审核',
					content: '执行后数据将发布审核, 审核通过后发布至公开数据库',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							this.procReview(item);
						}
					}
				});
			},
			procReview(item, isDelPublish) {
				let cmsWorksDB = uniCloud.importObject('cms-works-co');
				cmsWorksDB.updateStatus({
					id: item._id,
					article_status: isDelPublish ? 3 : 2,
					review_date: Date.now(),
					reviewRejectReason: ''
				}).then(res => {
					if (res.status == 0) {
					  uni.showToast({
						title: res.msg,
						icon: "none"
					  });
					  this.refreshData();
					} else {
						uni.showToast({
							title: res.msg,
							icon: "error"
						});
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
.my-works {
	padding-bottom: 30px;
	height: 100%;
	.item{
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.time-row {
		display: flex;
		flex-direction: column;
		margin-top: 24rpx;
		.time-l {
			font-size: 13px;
		}
		.r-text {
			color: #767a82;
		}
	}
	.oper-row {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		margin-top: 18rpx;
		align-items: center;
		.oper-i {
			font-size: 12px;
			display: inline-flex;
			border: solid 1px #d4e4ff;
			padding: 2px 4px;
			border-radius: 8px;
			background-color: #d4e4ff;
			&.ml-2 {
				margin-left: 10px;
			}
		}
		.oper-r {
			border-color: #e43d33;
			background-color: #e43d33;
			color: #fff;
		}
	}
	.error-row {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		margin-top: 15rpx;
	}
	.article-date {
		color: #C8C7CC;
		font-size: 14px;
		margin-left: 5px;
		margin-top: 4px;
	}
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