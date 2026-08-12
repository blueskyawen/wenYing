<template>
	<!-- #ifdef APP-NVUE -->
	<text :style="styleObj" class="uni-icons" @click="_onClick">{{unicode}}</text>
	<!-- #endif -->
	<!-- #ifndef APP-NVUE -->
	<text :style="styleObj" class="uni-icons" :class="['uniui-'+type,customPrefix,customPrefix?type:'']" @click="_onClick">
		<slot></slot>
	</text>
	<!-- #endif -->
</template>

<script>
	import { fontData } from './uniicons_file_vue.js'

	const getVal = (val) => {
		const reg = /^[0-9]*$/g
		return typeof val === 'number' || reg.test(val) ? val + 'px' : val
	}

	// #ifdef APP-NVUE
	const domModule = weex.requireModule('dom')
	const iconUrl = require('./uniicons.ttf')
	domModule.addRule('fontFace', {
		fontFamily: 'uniicons',
		src: "url('" + iconUrl + "')"
	})
	// #endif

	export default {
		name: 'UniIcons',
		props: {
			type: {
				type: String,
				default: ''
			},
			color: {
				type: String,
				default: '#333333'
			},
			size: {
				type: [Number, String],
				default: 16
			},
			customPrefix: {
				type: String,
				default: ''
			},
			fontFamily: {
				type: String,
				default: ''
			}
		},
		computed: {
			unicode() {
				const code = fontData.find((item) => item.font_class === this.type)
				return code ? code.unicode : ''
			},
			iconSize() {
				return getVal(this.size)
			},
			styleObj() {
				if (this.fontFamily !== '') {
					return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`
				}
				return `color: ${this.color}; font-size: ${this.iconSize};`
			}
		},
		methods: {
			_onClick(e) {
				this.$emit('click', e)
			}
		}
	}
</script>

<style lang="scss">
	/* #ifndef APP-NVUE */
	@import './uniicons.css';

	@font-face {
		font-family: uniicons;
		src: url('./uniicons.ttf');
	}

	/* #endif */
	.uni-icons {
		font-family: uniicons;
		text-decoration: none;
		text-align: center;
	}
</style>
