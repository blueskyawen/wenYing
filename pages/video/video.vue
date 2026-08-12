<template>
	<view>
		<wy-video ref="vidRef" :list="list" :total="count" :likeItems="likeList" :collectItems="collectList" 
		@action-change="handleActionChange" @loadMore="loadMoreData"></wy-video>
	</view>
</template>

<script>
	const tagList = [
		{ id: '111111', name: '生活日常'},
		{ id: '222222', name: '坚持健身'},
		{ id: '333333', name: '旅行经历分享'},
		{ id: '444444', name: '宠物用品推荐'},
		{ id: '555555', name: '在你的全世界经过'}
	];
	import parseImageUrl from "@/common/parseImageUrl.js"
	const cmsVideoCo = uniCloud.importObject('cms-video-co')
	const cmsVideoLikeDB = uniCloud.importObject('cms-video-like-co');
	const cmsVideoCollectDB = uniCloud.importObject('cms-video-collect-co');
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		data() {
			return {
				list: [],
				page: {
					pageNum: 0,
					pageSize: 10
				},
				count: 0,
				hasMore: true,
				isLoaded: false,
				timerId: null,
				likeList: [],
				collectList: [],
				isFirst: true,
			}
		},
		onLoad() {
			console.log('cmsVideoCo == onLoad')
			this.init();
		},
		onUnload() {
			if (this.timerId) {
				clearTimeout(this.timerId);
				this.timerId = null;
			}
		},
		created() {
			console.log('cmsVideoCo == created')
		},
		beforeDestroy() {
			console.log('cmsVideoCo == beforeDestroy')
		},
		destroyed() {
			console.log('cmsVideoCo == destroyed')
		},
		onShow() {
			console.log('cmsVideoCo == onShow')
			// console.log(JSON.stringify(this.list))
			if (!this.isLoaded) {
				this.getList();
				this.isLoaded = true;
			} else {
				this.autoPlay();
			}
			if (this.timerId) {
				clearTimeout(this.timerId);
				this.timerId = null;
			}
		},
		onHide() {
			console.log('cmsVideoCo == onHide');
			if (!this.timerId) {
				this.timerId = setTimeout(() => {
					this.init();
					this.isLoaded = false;
				}, 600000);
			}
		},
		onReady() {
			console.log('cmsVideoCo == onReady')
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin(){
				return store.hasLogin
			},
		},
		methods: {
			init() {
				this.page.pageNum = 0;
				this.count = 0;
				this.hasMore = true;
				this.list = [];
			},
			async getList(isLoadMore) {
				console.log('count='+this.count+';hasMore='+this.hasMore)
				console.log('pageNum='+this.page.pageNum+';pageSize='+this.page.pageSize);
				let pageNum = this.page.pageNum;
				let pageSize = this.page.pageSize;
				try {
					if (this.isFirst && this.hasLogin) {
						let res2 = await cmsVideoLikeDB.getList({
							id: this.userInfo._id
						})
						let res3 = await cmsVideoCollectDB.getList({
							id: this.userInfo._id
						})
						if (res2.data && res2.data.length) {
							this.likeList = res2.data.map(x => {
								return {
									id: x._id,
									video_id: x.video_id
								}
							});
						}
						if (res3.data && res3.data.length) {
							this.collectList = res3.data.map(x => {
								return {
									id: x._id,
									video_id: x.video_id
								}
							})
						}
						this.isFirst = false
					}

					let res = await cmsVideoCo.getList(pageNum, pageSize);
					console.log('*****cmsVideoCo')
					console.log(res.data)
					let curPageData = res.data || [];
					if (curPageData.length) {
						let coverImages = curPageData.map(x => x.cover);
						let videoUrls = curPageData.map(x => x.src);
						let userAvators = curPageData.filter(x => x.user_id && x.user_id[0].avatar_file && x.user_id[0].avatar_file.url)
													.map(y => y.user_id[0].avatar_file.url);
						let resCoverImgs = await parseImageUrl(coverImages);
						let resVideoUrls = await parseImageUrl(videoUrls);
						let resUserUrls = await parseImageUrl(userAvators);
						curPageData.forEach(x => {
							let img = resCoverImgs.find(y => y.source == x.cover)
							if (img) {
								x.cover_src = img.src;
							}
							let tmpurl = resVideoUrls.find(y => y.source == x.src)
							if (tmpurl) {
								x.url = tmpurl.src;
							}
							let tmpAvator = resUserUrls.find(y => y.source == x.user_id[0].avatar_file.url)
							if (tmpAvator) {
								x.avatar_url = tmpAvator.src || '/static/yhdsl/car.png';
							}

							if (x.user_id && x.user_id[0]) {
								x.autorName = x.user_id[0].nickname || '无名氏'
							}
							x.isLike = !!this.likeList.find(t => t.video_id == x._id)
							x.isCollect = !!this.collectList.find(t => t.video_id == x._id)
							
							x.tagList = tagList.filter(y => x.tags.includes(y.id));
						});
					}
					if(pageNum == 0) {
						this.list = []; //如果是第一页需手动制空列表
						this.count = 0;
					}
					let curPageLen = curPageData.length;
					this.list = this.list.concat(curPageData); //追加新数据
					this.hasMore = curPageLen >= pageSize;
					if (curPageLen !==0) {
						if (this.hasMore) {
							this.page.pageNum = pageNum++; // 下一页码
						}
						this.count += curPageLen; //记录当前加载的总数	
					}
					if (!isLoadMore) {
						this.autoPlay();	
					}
	
				} catch(e) {
					console.error(e)
				}
			},
			loadMoreData() {
				//还有几种情况需要处理
				// 多次调用getList重复获取数据, 
				// this.page.pageNum, this.count, hasMore list越来越多, 数据混乱的场景
				if (!this.hasMore) return;
				this.getList(isLoadMore)
			},
			autoPlay() {
				this.$nextTick(() => {
					this.$refs.vidRef.tapVideo(true);
				})
			},
			handleActionChange(e) {
				if (e.type == 'like') {
					if (e.action == 'add') {
						cmsVideoCo.incLikeCount(e.value.video_id, 1).then(res => {
							this.likeList.push({...e.value});
						});
					}
					if (e.action == 'del') {
						cmsVideoCo.incLikeCount(e.value.video_id, -1).then(res => {
							this.likeList = this.likeList.filter(x => x.id !== e.value.id);
						});	
					}
				}
				if (e.type == 'collect') {
					if (e.action == 'add') {
						cmsVideoCo.incCollectCount(e.value.video_id, 1).then(res => {
							this.collectList.push({...e.value});
						});						
					}
					if (e.action == 'del') {
						cmsVideoCo.incCollectCount(e.value.video_id, -1).then(res => {
							this.collectList = this.collectList.filter(x => x.id !== e.value.id);
						});	
					}	
				}
			}
		}
	}
</script>

<style>

</style>