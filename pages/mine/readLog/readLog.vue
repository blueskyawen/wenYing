<template>
	<view class="container">
		<unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}" :where="udbWhere"
			collection="uni-cms-articles" @load="isLoading == false" @error="isLoading == false"
			field="title,_id" :page-size="10">
			<uni-list>
				<uni-list-item v-for="(item, index) in data" :key="index" :clickable="true"
					@click="handleItemClick(item)">
					<template v-slot:body>
						<view class="item">
							<text>{{item.title}}</text>
							<uni-dateformat class="article-date" :date="readHistoryLogs[index].last_time" format="yyyy-MM-dd hh:mm:ss"></uni-dateformat>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<uni-load-state @networkResume="refreshData" :state="{data,pagination,hasMore, loading, error}" 
				@loadMore="loadMore"></uni-load-state>
		</unicloud-db>
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
				isLoading: true,
				readHistoryLogs:[],
				udbWhere:''
			}
		},
		onLoad() {
			this.readHistoryLogs = uni.getStorageSync('readHistory')||[];
			let readLogIds = this.readHistoryLogs.map(({article_id})=>article_id)
			this.udbWhere = `"_id" in ${JSON.stringify(readLogIds)}`
		},
		onPullDownRefresh() {
			this.refreshData();
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
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
					url: '/uni_modules/uni-cms-article/pages/detail/detail?id=' + item._id
				})
			}
		}
	}
</script>

<style scoped>
	.item{
		display: flex;
		flex-direction: column;
	}
	.article-date {
		color: #C8C7CC;
		margin-top: 16rpx;
	}
</style>