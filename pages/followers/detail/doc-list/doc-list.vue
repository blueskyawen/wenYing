<template>
	<view class="page-list">
		<unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}" :where="udbWhere"
			collection="uni-cms-articles" @load="loadData" @error="isLoading == false"
			:page-size="10">
			<uni-list>
				<uni-list-item v-for="(item, index) in data" :key="index" :clickable="true"
					@click="handleItemClick(item)">
					<template v-slot:body>
						<view class="item">
							<text>{{item.title}}</text>
							<view class="time-row">
								<text>发布时间: </text>
								<uni-dateformat class="article-date" :date="item.publish_date" format="yyyy-MM-dd hh:mm:ss"></uni-dateformat>
							</view>
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
		props: {
			udbWhere: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				isLoading: true,
				list: []
			}
		},
		onLoad() {
			this.refreshData();
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
			},
			loadData(data) {
				for (let i=0;i < 10;i++) {
					this.list = this.list.concat(data);
				}
			}
		}
	}
</script>

<style scoped>
	.page-list {
		height: 100%;
		overflow-y: auto;
	}
	.time-row {
		margin-top: 8px;
		font-size: 14px;
		color: #8f939c;
	}
</style>