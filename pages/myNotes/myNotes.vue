<template>
	<view class="my-note">
		<uni-grid :column="3" :square="false" :showBorder="false">
			<uni-grid-item v-for="(item,index) in list" :index="index" :key="index">
				<view class="note-item" @tap="goDetail(item)">
					<image :src="item.cover_src"></image>
					<view class="descript">{{ item.content }}</view>
					<view class="publish-date">
						<uni-dateformat  :date="item.publish_date" format="yyyy-MM-dd"></uni-dateformat>
					</view>
					<view v-if="isSetting" class="oper-row">
						<view class="oper-i" @tap.stop="clickEdit(item)">
							<u-icon name="edit-pen" size="14"></u-icon>
							<text>编辑</text>
						</view>
						<view class="oper-i ml-2 oper-r" @tap.stop="clickDelete(item, index)">
							<u-icon name="trash" size="14" color="#fff"></u-icon>
							<text>删除</text>
						</view>
					</view>
				</view>
			</uni-grid-item>
		</uni-grid>
		<u-empty v-if="!isLoading && !list.length"></u-empty>

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
	const cmsNoteDB = uniCloud.importObject('cms-note-co');
	import parseImageUrl from "@/common/parseImageUrl.js";
	const cmsScoreDB = uniCloud.importObject('cms-score-co', {
		customUI: true
	});
	export default {
		data() {
			return {
				list: [],
				isSetting: false,
				isLoading: true,
				score: 0
			}
		},
		computed: {
			loginUserId() {
				return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
			},
			setTitle() {
				return this.isSetting ? '退出管理' : '管理'
			},
		},
		onLoad() {
			this.refreshData();
			this.getMyScore();
			uni.$on('add-note-sucess', this.handleAddNote);
		},
		onUnload() {
			uni.$off('add-note-sucess')
		},
		onHide() {
			this.isSetting = false;
		},
		methods: {
			getMyScore() {
				cmsScoreDB.get({
					user_id: this.loginUserId
				}).then(res => {
					this.score = res.data && res.data[0] ? res.data[0].balance : 0;
				})
			},
			handleAddNote(v) {
				this.refreshData();
				if (v.type == 'add' && v.usescore) {
					cmsScoreDB.updateScore({
						user_id: this.loginUserId,
						value: -10
					}).then(res => {})
				}
			},
			async refreshData() {
				this.isLoading = true;
				let res = await cmsNoteDB.getList({
					id: this.loginUserId
				})
				let templist = res.data || [];
				let images = templist.map(x => x.cover);
				let resImgs = await parseImageUrl(images);
				templist.forEach(x => {
					let img = resImgs.find(y => y.source == x.cover)
					if (img) {
						x.cover_src = img.src;
					}
				});
				this.list = templist;
				this.isLoading = false;
			},
			clickSeting() {
				this.isSetting = !this.isSetting;
			},
			clickAdd() {
				if (this.list.length >= 50) {
					uni.showModal({
						title: "提示",
						content: "个人最多可创建50篇小记, 新建需消耗10个积分, 确认吗",
						showCancel: true,
						success: (e) => {
							if (e.confirm) {
								if (this.score >= 10) {
									uni.navigateTo({
										url: '/pages/myNotes/add/add?usescore=1'
									})
								} else {
									uni.showToast({
										title: '当前积分不足10个, 请签到获取积分',
										icon: 'none',
										duration: 2000
									})
								}
							}
						}
					})
				} else {
					uni.navigateTo({
						url: '/pages/myNotes/add/add'
					})
				}
			},
			clickEdit(item) {
				uni.navigateTo({
					url: '/pages/myNotes/add/add?id=' + item._id
				})
			},
			goDetail(item) {
				if (!this.isSetting) {
					uni.navigateTo({
						url: '/pages/notes/noteView/noteView?id=' + item._id
					})
				}
			},
			clickDelete(item, index) {
				uni.showModal({
					title: '确认删除',
					content: '执行删除后数据将不可恢复, 确定要删除吗?',
					confirmColor: '#e43d33',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							this.procDel(item, index);
						}
					}
				});
			},
			procDel(item, index) {
				cmsNoteDB.delete({
					id: item._id
				}).then(res => {
					if (res.status == 0) {
					  uni.showToast({
						title: res.msg,
						icon: "none"
					  });
					  cmsNoteDB.delCoverFile({
						  cover: item.cover
					  }).then(res => {})
					  this.list.splice(index, 1);
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
.my-note {
	padding-bottom: 50px;
	.note-item {
		border: solid 1px #dcdcdc;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		margin: 3px;
		image {
			width: 100%;
			display: block;
			object-fit: cover;
			aspect-ratio: 1;
			height: auto;
			border-radius: 6px 6px 0 0;
		}
		.descript {
			font-size: 14px;
			margin: 12px 8px;
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
			font-size: 12px;
			margin-bottom: 8px;
			margin-right: 8px;
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