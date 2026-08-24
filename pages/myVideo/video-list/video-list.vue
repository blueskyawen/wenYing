<template>
	<view class="video-list">
		<uni-grid :column="3" :square="false" :showBorder="false">
			<uni-grid-item v-for="(item,index) in list" :index="index" :key="index">
				<view class="note-item" @tap="goDetail(item)">
					<image :src="item.cover_src"></image>
					<view class="like-c">
						<uni-icons type="heart" size="12" color="#fcfcfc"></uni-icons>
						<text class="text1">{{ item.like_count }}</text>
					</view>
				</view>
			</uni-grid-item>
		</uni-grid>
		<u-empty v-if="!list.length"></u-empty>
	</view>
</template>

<script>
	export default {
		props: {
			list: {
				type: Array,
				default: () => []
			},
			isSetting: {
				type: Boolean
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
			goDetail(item) {
				uni.navigateTo({
					url: '/pages/myVideo/preView/preView?id=' + item._id + '&autor=me'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.video-list {
	overflow-y: auto;
	.note-item {
		border: solid 1px #dcdcdc;
		border-radius: 2px;
		display: flex;
		flex-direction: column;
		margin: 3px;
		position: relative;
		.img-item {
			position: relative;
		}
		image {
			width: 100%;
			display: block;
			object-fit: cover;
			aspect-ratio: 1;
			height: auto;
			border-radius: 6px 6px 0 0;
		}
		.title {
			font-size: 10px;
			padding: 0 5px;
			box-sizing: border-box;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			position: absolute;
			left: 0;
			color: #fcfcfc;
			bottom: 12px;
		}
		.like-c {
			position: absolute;
			left: 0;
			bottom: 10rpx;
			display: inline-flex;
			flex-direction: row;
			align-items: center;
			.text1 {
				margin-left: 6px;
				font-size: 12px;
				color: #fcfcfc;
			}
		}
		.oper-row {
			display: flex;
			flex-direction: row;
			justify-content: flex-end;
			margin: 12rpx;
			align-items: center;
			.oper-i {
				font-size: 10px;
				display: inline-flex;
				border: solid 1px #d4e4ff;
				padding: 1px 2px;
				border-radius: 8px;
				background-color: #d4e4ff;
				&.ml-2 {
					margin-left: 6px;
				}
			}
			.oper-r {
				border-color: #e43d33;
				background-color: #e43d33;
				color: #fff;
			}
		}
	}
}
</style>