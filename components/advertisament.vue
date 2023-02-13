<template>
	<view class="advertisement_shell">
		<view class="advertisement" :style="{height:height_each+5+'px'}" v-for="(data,index) in ad_data" :key="index">
			<view>
				<image src="../static/icons/rice_active.jpg" mode="heightFix"></image>
				{{data.ad_text}}
			</view>
			<view class="btn">
				{{data.btn_text}}
			</view>
		</view>
	</view>
</template>

<script>
	import ad_data from "../static/json/advertisament_data.js"
	import {ref} from 'vue'
	export default {
		name:"advertisament",
		props:['height_each'],
		setup(){
			return {}
		}
	}
</script>
	
<style lang="less" scoped>
.advertisement_shell{
	padding:20rpx;
	box-sizing: border-box;
	background-color: white;
}	
.advertisement{
	padding:20rpx;
	display: flex;
	box-sizing: border-box;
	background-color: rgb(253,248,227);
	border-radius:10px;
	justify-content: space-between;
	&>view{
		height:100%;
		font-size:14px;
		&>image{
			height:100%;
		}
	}
	.btn{
		border:1px solid orange;
		border-radius:5px;
		width:60px;
		display: flex;
		justify-content: center;
		align-items: center;
		color:orange;
		box-sizing: border-box;
	}
}
</style>