<template>
	<view class="container">
		<navigation>
			
		</navigation>
		<view class="tip">
			此页面暂未开放,请谅解1
		</view>
	</view>
</template>

<script>
	import navigation from '../navigation/navigation_all.vue'
	export default {
		components:{
			navigation
		},
		data() {
			return {
				href: 'https://uniapp.dcloud.io/component/README?id=uniui'
			}
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
		box-sizing: border-box;
		width:100%;
		height:100%;
		&>.tip{
			width:100%;
			height:100%;
			display: flex;
			justify-content: center;
			font-size:30px;
			align-items: center;
		}
	}
</style>