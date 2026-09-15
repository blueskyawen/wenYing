<template>
	<view class="page-list">
		<unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}" :where="udbWhere"
			collection="cms-notes-like" @load="loadData" @error="isLoading == false"
			:page-size="10">
			<uni-grid :column="3" :square="false" :showBorder="false">
				<uni-grid-item v-for="(item,index) in list" :index="index" :key="index">
					<view class="note-item" @tap="goDetail(item)">
						<view class="img-box">
							<image :src="item.cover_src"></image>
						</view>
						<view class="descript">{{ item.note_content }}</view>
						<view class="publish-date">
							<uni-dateformat  :date="item.publish_date" format="yyyy-MM-dd"></uni-dateformat>
						</view>
					</view>
				</uni-grid-item>
			</uni-grid>
			<uni-load-state @networkResume="refreshData" :state="{data,pagination,hasMore, loading, error}" 
				@loadMore="loadMore"></uni-load-state>
		</unicloud-db>
	</view>
</template>

<script>
	import uniLoadState from "@/uni_modules/uni-cms-article/components/uni-load-state/uni-load-state.vue";
	import parseImageUrl from "@/common/parseImageUrl.js"
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
		methods: {
			async loadData(data, ended, pagination) {
				if (data.length) {
					let images = data.map(x => x.note_cover);
					let resImgs = await parseImageUrl(images);
					data.forEach(x => {
						let img = resImgs.find(y => y.source == x.note_cover)
						if (img) {
							x.cover_src = img.src;
						}
					});
				}
				this.list = pagination['current'] == 1 ? data : this.list.concat(data);
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
			goDetail(item) {
				uni.navigateTo({
					url: '/pages/notes/noteView/noteView?id=' + item.note_id + '&from=likes'
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page-list {
		height: 100%;
		overflow-y: auto;
	}
.note-item {
	border: solid 1px #dcdcdc;
	border-radius: 14rpx;
	display: flex;
	flex-direction: column;
	margin: 7rpx;
	.img-box {
		background-color: #f2f2f2;
	}
	image {
		width: 100%;
		display: block;
		object-fit: cover;
		aspect-ratio: 1;
		height: auto;
		border-radius: 14rpx 14rpx 0 0;
	}
	.descript {
		font-size: 33rpx;
		margin: 28rpx 19rpx;
		box-sizing: border-box;
		line-height: 1.5em;
		display: -webkit-box;
		-webkit-line-clamp: 2;    /* 限制显示行数 */
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.publish-date {
		display: flex;
		justify-content: flex-end;
		font-size: 28rpx;
		margin-bottom: 19rpx;
		margin-right: 19rpx;
	}
	.oper-row {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		margin: 12rpx;
		align-items: center;
		.oper-i {
			font-size: 24rpx;
			display: inline-flex;
			border: solid 1px #d4e4ff;
			padding: 2rpx 5rpx;
			border-radius: 19rpx;
			background-color: #d4e4ff;
			&.ml-2 {
				margin-left: 14rpx;
			}
		}
		.oper-r {
			border-color: #e43d33;
			background-color: #e43d33;
			color: #fff;
		}
	}
}
</style>