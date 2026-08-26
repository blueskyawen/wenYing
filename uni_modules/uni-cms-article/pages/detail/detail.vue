<template>
	<view class="detail-page">
<!-- 		<unicloud-db v-if="id" v-slot:default="{data, loading, error, options}" collection="uni-cms-articles" 
				   :getone="true" :where="where" ref="detail" :field="fields" @load="loadData" class="article">
			<template v-if="!isLoading">
			  <view class="meta">
				<view class="title">
				  <text class="text">{{ dataInfo.title }}</text>
				</view>
				<view class="excerpt">
				  <text class="text">{{ dataInfo.excerpt }}</text>
				</view>
				<view class="author">
					<view>
						<template v-if="author.id">
							<text class="at autor-name">{{ author.nickname || author.username || '' }}</text>
							<text class="split">·</text>
						</template>
						<text class="date" v-if="dataInfo.publish_date">{{ publishTime(dataInfo.publish_date) }}</text>
					</view>
					<view class="likes">
						<u-icon v-if="!isInLikes" name="heart" color="#b9b9b9" size="20" title="喜欢" @tap="clickLike"></u-icon>
						<u-icon v-else name="heart-fill" color="#fa3534" size="20" title="喜欢" @tap="clickLike"></u-icon>
						<u-icon class="like-2" v-if="!isInCollect" name="star" color="#b9b9b9" size="20" title="收藏" @tap="clickCollect"></u-icon>
						<u-icon class="like-2" v-else name="star-fill" color="#f3a73f" size="20" title="已收藏" @tap="clickCollect"></u-icon>
					</view>
				</view>
			  </view>
			  <render-article-detail
				:content="dataInfo.content"
				:content-images="dataInfo.content_images"
				:ad-config="{ adpId, watchAdUniqueType }"
			  ></render-article-detail>
			</template>
			<view class="detail-loading" v-else>
			  <uni-icons type="spinner-cycle" size="35px"/>
			</view>
		</unicloud-db> -->
		<view class="article">
			<view v-if="!isLoading">
			  <view class="meta">
				<view class="title">
				  <text class="text">{{ docData.title }}</text>
				</view>
				<view class="excerpt">
				  <text class="text">{{ docData.excerpt }}</text>
				</view>
				<view class="author">
					<view>
						<template v-if="docData.nickname || docData.username">
							<text class="at autor-name" @click="tapAutor">{{ docData.nickname[0] || docData.username[0] || '' }}</text>
							<text class="split">·</text>
						</template>
						<text class="date" v-if="docData.publish_date">{{ publishTime(docData.publish_date) }}</text>
					</view>
					<view class="likes">
						<u-icon v-if="!isInLikes" name="heart" color="#b9b9b9" size="20" title="喜欢" @tap="clickLike"></u-icon>
						<u-icon v-else name="heart-fill" color="#fa3534" size="20" title="喜欢" @tap="clickLike"></u-icon>
						<u-icon class="like-2" v-if="!isInCollect" name="star" color="#b9b9b9" size="20" title="收藏" @tap="clickCollect"></u-icon>
						<u-icon class="like-2"  v-else name="star-fill" color="#f3a73f" size="20" title="已收藏" @tap="clickCollect"></u-icon>
					</view>
				</view>
			  </view>
			  <render-article-detail
				:content="docData.content"
				:content-images="docData.content_images"
				:ad-config="{ adpId, watchAdUniqueType }"
			  ></render-article-detail>
			</view>
			<view class="detail-loading" v-else>
			  <uni-icons type="spinner-cycle" size="35px"/>
			</view>
		</view>
		<view class="infrite-action" v-if="!isLoading">
			<view class="action">
				<view class="action-i" @tap.stop="clickLike">
					<u-icon v-if="!isInLikes" name="heart" color="#b9b9b9" size="26"></u-icon>
					<u-icon v-else="isInLikes" name="heart-fill" color="#fa3534" size="26"></u-icon>
					<text>{{ likeTitle }}</text>
				</view>
				<view class="action-i i-2" @tap.stop="clickCollect">
					<u-icon v-if="!isInCollect" name="star" color="#b9b9b9" size="26"></u-icon>
					<u-icon v-else="isInCollect" name="star-fill" color="#f3a73f" size="26"></u-icon>
					<text>{{ collectTitle }}</text>
				</view>
			</view>
		</view>
		<view v-if="!isLoading" class="botton-line"></view>
		<u-back-top :scroll-top="scrollTop" :iconStyle="iconStyle" :top="200"></u-back-top>
	</view>
</template>

<script>
// import uniNavBar from '@/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.vue';
import renderArticleDetail from "@/uni_modules/uni-cms-article/components/render-article-detail/index.vue";
import translatePublishTime from "@/uni_modules/uni-cms-article/common/publish-time";
import { store} from '@/uni_modules/uni-id-pages/common/store.js';
const db = uniCloud.database()
const articleDBName = 'uni-cms-articles'
const userDBName = 'uni-id-users'

export default {
  components: {
    // uniNavBar,
    renderArticleDetail
  },
  data() {
    return {
		dataInfo: {},
		docData: {},
		isLoading: true,
		id: "", // 文章ID
		title: "", // 文章标题
		formData: {}, // 表单数据
		isInLikes: false,
		likeData: {},
		isInCollect: false,
		collectData: {},
		scrollTop: 0,
		iconStyle: {
			fontSize: '45rpx',
			color: '#fff'
		},
		// 广告相关配置
		adpId: "", // TODO: 请填写广告位ID
		watchAdUniqueType: "device" ,// TODO: 观看广告的唯一标识类型，可选值为 user 或者 device，user 表示用户唯一，device 表示设备唯一
		from: '',
		saveOldFlag: {
			like: false,
			collect: false
		},
		author: {
			id: '',
			nickname: '',
			username: ''
		},
		fields: 'user_id,thumbnail,excerpt,publish_date,title,content'
    }
  },
  computed: {
	loginUserId() {
		return uniCloud.getCurrentUserInfo() ? uniCloud.getCurrentUserInfo().uid : '';
	},
	likeTitle() {
		return this.isInLikes ? '喜欢' : '喜欢'
	},
	collectTitle() {
		return this.isInCollect ? '已收藏' : '收藏'
	},
	hasLogin() {
		return store.hasLogin
	},
    where() {
      //拼接where条件 查询条件 ,更多详见 ：https://uniapp.dcloud.net.cn/uniCloud/unicloud-db?id=jsquery
      return `_id=="${this.id}"`
    },
    collection() {
      return [
        db.collection(articleDBName).field('user_id,thumbnail,excerpt,publish_date,title,content').getTemp(),
        db.collection(userDBName).field('_id, nickname, username').getTemp()
      ]
    }
  },
  onReady() {
    // 开始加载数据，修改 where 条件后才开始去加载 clinetDB 的数据 ，需要等组件渲染完毕后才开始执行 loadData，所以不能再 onLoad 中执行
    if (this.id) { // ID 不为空，则发起查询
      // this.$refs.detail.loadData()
    } else {
      uni.showToast({
        icon: 'none',
        title: 'id 不能为空'
      })
    }
  },
  onLoad(event) {
    //获取文章id，通常 id 来自上一个页面
	this.from = event.from;
    if (event.id) {
      this.id = event.id;
	  this.getDocData();
	  this.getDocFavorite();
    }

    // 监听解锁内容事件
    uni.$on('onUnlockContent', this.onUnlockContent)
  },
  onUnload() {
    // 页面卸载时，移除监听事件
    uni.$off('onUnlockContent', this.onUnlockContent);
	this.checkIfUpdate();
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
	  getDocDataJQL() {
		  const db = uniCloud.databaseForJQL();
		  if (this.id) {
			this.isLoading = true;
			const articleDb = db.collection(articleDBName).field('user_id,thumbnail,excerpt,publish_date,title,content').getTemp();
			const userDb = db.collection(userDBName).field('_id, nickname, username').getTemp();

			db.collection(articleDb, userDb)
			  .where(`_id == "${this.id}"`)
			  .get()
			  .then(res => {
				console.log('databaseForJQL==');
				if (res.data) {
					this.docData = res.data[0] || {};
				}
				this.loadData(this.docData);
			  }).catch(err => {
				console.error(err)
			  }).finally(() => {
				  this.isLoading = false;
			  })
		  }
	  },
	  updateViewCount() {
		  const cmsArticleCo = uniCloud.importObject('cms-article-co', {
			  customUI: true
		  })
		  cmsArticleCo.updateViewCount(1).then(res => {});
	  },
	  getDocData() {
		  if (this.id) {
			  this.isLoading = true;
			  const dbCmd = db.command
			  const $ = dbCmd.aggregate
			  db.collection(articleDBName)
			    .aggregate()
			    .lookup({
			      from: userDBName,
			      let: {
			        user_id: '$user_id'
			      },
			      pipeline: $.pipeline()
			        .match(dbCmd.expr(
			          $.eq(['$_id', '$$user_id'])
			        ))
			        .project({
			          nickname: true,
					  username: true
			        })
			        .done(),
			      as: 'name'
			    })
			    .match({
			      _id: this.id
			    })
			    .project({
			      user_id: true,
			      thumbnail: true,
				  excerpt: true,
				  publish_date: true,
				  title: true,
				  content: true,
				  name: true,
				  nickname: "$name.nickname",
				  username: "$name.username"
			    })
			    .end()
				.then(res => {
					if (res.result && res.result.data) {
						this.docData = res.result.data[0] || {}
					}
					this.loadData(this.docData);
					this.updateViewCount();
				}).catch(err => {
			      console.error(err)
			    }).finally(() => {
					this.isLoading = false;
				})
		  }
	  },
	  getDocFavorite() {
		  if (this.id && this.loginUserId) {
			const cmsFavoriteCo = uniCloud.importObject('cms-favorite-co')
			const cmsLikesCo = uniCloud.importObject('cms-likes-co')
			cmsFavoriteCo.get({
				article_id: this.id, 
				user_id: this.loginUserId
			}).then(res => {
				if (res.data && res.data.length) {
					this.collectData = {
						id: res.data[0]._id
					};
					this.isInCollect = true;
					this.saveOldFlag.collect = true;
				}
			});
			cmsLikesCo.get({
				article_id: this.id, 
				user_id: this.loginUserId
			}).then(res => {
				if (res.data && res.data.length) {
					this.likeData = {
						id: res.data[0]._id
					};
					this.isInLikes = true;
					this.saveOldFlag.like = true;
				}
			});
		  }
	  },
	  clickCollect() {
		  if (!this.hasLogin) {
			  uni.showToast({
			  	title: "请先登录后操作",
			  	icon: "none"
			  });
			  return;
		  }
		  const cmsFavoriteCo = uniCloud.importObject('cms-favorite-co')
		  if (!this.isInCollect && !this.collectData.id) {
			  cmsFavoriteCo.add({
				  "user_id": this.loginUserId,
				  "article_id": this.id,
				  "article_title": this.title,
				  "create_date": Date.now()
			  }).then(res => {
				this.isInCollect = true;
				this.collectData = {
					id: res.id || ''
				}
			  	uni.showToast({
			  		title: "收藏成功",
			  		icon: "none"
			  	});
			  });
		  } else {
			  if (this.collectData.id) {
				cmsFavoriteCo.delete({
					id: this.collectData.id
				}).then(res => {
					this.isInCollect = false;
					this.collectData = {};
				});  
			  }
		  }
	  },
	  clickLike() {
		  if (!this.hasLogin) {
			  uni.showToast({
				title: "请先登录后操作",
				icon: "none"
			  });
			  return;
		  }
		  const cmsLikesCo = uniCloud.importObject('cms-likes-co')
		  if (!this.isInLikes && !this.likeData.id) {
			  cmsLikesCo.add({
				  "user_id": this.loginUserId,
				  "article_id": this.id,
				  "article_title": this.title,
				  "create_date": Date.now()
			  }).then(res => {
					this.likeData = {
						id: res.id || ''
					}
				  this.isInLikes = true;
				uni.showToast({
					title: "已加入喜欢",
					icon: "none"
				});
			  });
		  } else {
			  if (this.likeData.id) {
				cmsLikesCo.delete({
					id: this.likeData.id
				}).then(res => {
					this.isInLikes = false;
					this.likeData = {};
				});  
			  }
		  }
	  },
	// 将时间戳转换为可读的时间格式
	publishTime(timestamp) {
		return translatePublishTime(timestamp)
	},
    // 将文章加入阅读历史
    setReadHistory() {
      // 获取阅读历史缓存，如果不存在则为空数组
      const historyCache = uni.getStorageSync('readHistory') || []
      // 过滤掉当前文章的阅读历史
      const readHistory = historyCache.filter(item => item.article_id !== this.id)
      // 将当前文章的阅读历史添加到数组最前面
      readHistory.unshift({
        article_id: this.id,
        last_time: Date.now()
      })
      // 将更新后的阅读历史缓存到本地
      uni.setStorageSync('readHistory', readHistory)

    },
    // 加载数据
    loadData(data) {
      // 设置文章标题
      this.title = data.title;
	  this.dataInfo = data;
	  // this.getDocAutor(data);
	  // this.isLoading = false;
      // 将文章添加进阅读历史
      this.setReadHistory()
    },
	getDocAutor(data) {
		if (data.user_id && !this.author.id) {
			const cmsUserCo = uniCloud.importObject('cms-user-co', {
				customUI: true
			});
			cmsUserCo.getByUserId({
				user_id: data.user_id
			}).then(res => {
				if (res.data && res.data.length) {
					this.author = {
						id: data.user_id,
						nickname: res.data[0].nickname,
						username: res.data[0].username
					}
				}
			})
		}
	},
    // 监听解锁内容事件，解锁内容后重新加载数据
    async onUnlockContent() {
      this.$refs.detail.loadData()
    },
	tapAutor() {
		if (this.docData.user_id) {
			uni.navigateTo({
				url: `/pages/followers/detail/detail?id=${this.docData.user_id}`
			})
		}
	},
	checkIfUpdate() {
		if (this.from == 'likes' && this.saveOldFlag.like !== this.isInLikes) {
			uni.$emit('refresh-like-list',{});
		}
		if (this.from == 'collects' && this.saveOldFlag.collect !== this.isInCollect) {
			uni.$emit('refresh-collect-list',{});
		}
	}
  }

}
</script>

<style scoped lang="scss">
/* #ifdef APP-NVUE */
.article {
  background-color: #fff;
  width: 100%;
}

/* #endif */

.detail-page {
	margin-bottom: 30px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 30rpx;
	width: 100%;
	box-sizing: border-box;
	.botton-line {
		height: 1px;
		background-color: #c8c9cc;
		width: 90%;
		margin: 50rpx 0;
	}
	.article {
	  width: 100%;
	}
	.infrite-action {
		display: flex;
		justify-content: center;
		.action {
			display: inline-flex;
			.action-i {
				display: inline-flex;
				align-items: center;
				text {
					font-size: 14px;
					color: #6a6a6a;
					margin-left: 4rpx;
				}
			}
			.i-2 {
				margin-left: 60rpx;
			}
			
		}
	}
}

@mixin cp {
  padding: 0 30rpx;
}

.detail-loading {
  margin: 100rpx auto 0;
  width: 35px;
  height: 35px;
  animation: rotate360 2s linear infinite;
}

@keyframes rotate360 {
  0% {
    transform: rotate(0deg);
    transform-origin: center center;
  }

  100% {
    transform: rotate(360deg);
    transform-origin: center center;
  }
}

.meta {
  //@include cp;
  position: relative;
  z-index: 1;
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
	.autor-name {
		font-weight: 600;
	}
    .split {
      margin: 0 10rpx;
    }
  }
}
</style>
