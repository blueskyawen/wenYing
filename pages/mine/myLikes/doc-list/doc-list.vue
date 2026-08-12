<template>
	<view>
		<unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}" :where="udbWhere"
			collection="cms-acticles-like" @load="isLoading == false" @error="isLoading == false"
			:page-size="10">
			<uni-list>
				<uni-list-item v-for="(item, index) in data" :key="index" :clickable="true"
					@click="handleItemClick(item)">
					<template v-slot:body>
						<view class="item">
							<text>{{item.article_title}}</text>
							<view class="time-row">
								<text>加入时间: </text>
								<uni-dateformat class="article-date" :date="item.create_date" format="yyyy-MM-dd hh:mm:ss"></uni-dateformat>
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
					url: '/uni_modules/uni-cms-article/pages/detail/detail?id=' + item.article_id
				})
			}
		}
	}
</script>

<style>

</style>