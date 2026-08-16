<template>
	<view>
		搜索 {{ this.topic.name }}
	</view>
</template>

<script>
	export default {
		data() {
			return {
				topic: {
					id: '',
					name: ''
				},
				tagList: [],
				tagOptions: []
			}
		},
		onLoad(options) {
			this.topic.id = options.tagId;
			this.topic.name = options.tagName;
		},
		methods: {
			
		}
	}
</script>

<style>

</style>