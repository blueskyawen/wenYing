<script>
	import uniIdPageInit from '@/uni_modules/uni-id-pages/init.js';
	import initApp from '@/common/appInit.js';
	export default {
		onLaunch: async function() {
			console.log('App Launch')
			initApp();
			await uniIdPageInit()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uview-ui/index.scss";
	/*每个页面公共css */
</style>
