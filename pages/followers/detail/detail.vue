<template>
	<view>
		个人想去 {{ this.id }}
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: ''
			}
		},
		onLoad(options) {
			this.id = options.id;
		},
		methods: {
			
		}
	}
</script>

<style>

</style>