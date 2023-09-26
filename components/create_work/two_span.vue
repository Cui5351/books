<template>
	<view class="vessel">
		<view class="head" style="overflow: hidden;">
			<image style="position: absolute;width: 100%;height: 100%;top:0;left: 0;" mode="widthFix"  src="https://mynameisczy.cn/play_loop/露营车.svg"></image>
			<view class="t" @click="title_state=true">
				<!-- <view style="background-color: rgb(53,212,199);"></view> -->
				{{title1}}
			</view>
			<view class="t" @click="title_state=false">
				<!-- <view style="background-color: rgb(53,212,199);"></view> -->
				{{title2}}
			</view>
			<view class="c" :style="{left:title_state?'25%':'75%'}">
			</view>
		</view>
		<view class="body">
			<scroll-view scroll-y="true" :style="{height:(container_height-101)+'px'}">
				<view v-if="title_state">
					<slot name="title1"/>
				</view>
				<view v-else>
					<slot name="title2"/>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	// 这是其他页
	// 不是tab页，tab页还需要减去底部
	import {reactive,ref} from 'vue'
	export default {
		props:['title1','title2'],
		setup(props) {
			let title_state=ref(true)
			console.log(props,'props');
			let head_height_child=ref(uni.global.rect*1.7)
			let container_height=ref(uni.global.height)
			let width=ref(uni.global.width)
			return {head_height_child,container_height,width,title_state}
		}
	}
</script>

<style lang="less">
.vessel{
	width:100%;
	.head{
		background-color: white;
		width:100%;
		padding-top: 50px;
		border-bottom: 1px solid rgba(0,0,0,.01);
		box-shadow:-1px 1px 10px -7px gray;
		// background-color: red;
		height:50px;
		position: relative;
		display: flex;
		.c{
			position: absolute;
			height:5px;
			width:30px;
			border-radius: 10px;
			top:90%;
			transition: .5s ease;
			left:25%;
			background-color: rgb(53,212,199);
			transform: translate(-50%);
		}
		&>.t{
			position: relative;
			z-index:9;
			flex-grow: 1;
			font-weight:bold;
			text-align: center;
			line-height:50px;
			&>view{
				height:10px;width:10px;display: inline-block;
			}
		}
	}
	scroll-view{
		padding:0 20px;
		box-sizing: border-box;
	}
}
</style>
