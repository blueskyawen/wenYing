<template>
	<view>
		<unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}" :where="udbWhere"
			collection="cms-video-collect" @load="loadData" @error="isLoading == false"
			:page-size="10">
			<uni-grid :column="3" :square="false" :showBorder="false">
				<uni-grid-item v-for="(item,index) in list" :index="index" :key="index">
					<view class="note-item" @tap="goDetail(item)">
						<image :src="item.cover_src"></image>
						<view class="title">{{ item.title }}</view>
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
					let images = data.map(x => x.cover);
					let resImgs = await parseImageUrl(images);
					data.forEach(x => {
						let img = resImgs.find(y => y.source == x.cover)
						if (img) {
							x.cover_src = img.src;
						}
					});
					this.list = pagination['current'] == 1 ? data : this.list.concat(data);
				}
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
					url: '/pages/myVideo/preView/preView?id=' + item.video_id
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.note-item {
	border: solid 1px #dcdcdc;
	border-radius: 3px;
	display: flex;
	flex-direction: column;
	margin: 3px;
	position: relative;
	image {
		width: 100%;
		display: block;
		object-fit: cover;
		aspect-ratio: 1;
		height: auto;
		border-radius: 6px 6px 0 0;
	}
	.title {
		font-size: 12px;
		margin: 10px 6px;
		box-sizing: border-box;
		color: #fcfcfc;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		position: absolute;
		left: 0;
		bottom: 0;
	}
}
</style>