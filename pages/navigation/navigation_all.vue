<template>
	<view>
		<view class="head">
			<view class="status_bar">
			</view>
			
			<view class="content" :style="{height:head_height+'px'}">
				<view>
					<!-- <image src="" mode=""></image> -->
					<uni-icons @click="back" type="left" size="25" v-if="show_back"></uni-icons>
				</view>
				<view>
					<slot></slot>
				</view>
				<view>
					&emsp;
				</view>
			</view>
			
		</view>
	</view>
</template>

<script>
	import {ref} from 'vue'
	export default {
		name:"navigation_all",
		props:['show_back'],
		setup(){
			let head_height=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			function back(){
				// uni.getImageInfo({
					// src:''
				// })
				if(getCurrentPages().length>1)
					uni.navigateBack();
				else
					uni.switchTab({
						url:'/pages/home/home'
					})
			}
			return {head_height,back}
		}
	}
</script>

<style lang="less" scoped>
@import url('@/general.less');
.head{
	position: fixed;
	top:0;
	z-index:9999;
	left:0;
	width:100%;
	transition:0.5s ease;
	background-color: @background;
	// border-bottom:1px solid rgba(0,0,0,.1);
	box-shadow:-1px 1px 10px -7px gray;
}
.status_bar{
	height:var(--status-bar-height);
}
.content{	
	padding:0 15px 0;
	box-sizing: border-box;
	display: flex;
	justify-content:center;
	align-items: center;	
	font-weight:bold;
	font-size:20px;
	&>view:first-child{
		justify-content: flex-start;
	}
	&>view{
		flex-grow: 1;
		display: flex;
		justify-content:center;
		align-items: center;	
	}
}
</style>