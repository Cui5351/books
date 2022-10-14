<template>
	<view style="width: 100%;height:100%;">
		<navigation>源暮书城</navigation>
		<view class="container" :style="{marginTop:head_height+'px'}">
			<view class="vessel">
				<view class="portrait_container">
					<view class="portrait_vessel">
						<image src="https://www.mynameisczy.asia/image/small_program_portrait.jpg"></image>
					</view>
				</view>
				<view class="content">
						小程序当前正在维护当中，请耐心等待1-2小时...
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {ref} from 'vue'
	import navigation from '../navigation/navigation_all.vue'
	export default {
		components:{
			navigation
		},
		setup() {
			let head_height=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			return{head_height}
		}
	}
</script>

<style scoped lang="less">
	.container {
		overflow: hidden;
		font-size:16px;
		// font-size: 14px;
		line-height: 24px;
		width:100%;
		height:100%;
		position: relative;
		&>.vessel{
			position: absolute;
			width:300px;
			height: 350px;
			left:50%;
			top:50%;
			transform: translate(-50%,-80%);
			display: flex;
			flex-direction: column;
			&>view{
				flex-grow: 1;
				font-size:20px;
			}
			&>.portrait_container{
				display: flex;
				justify-content: center;
				align-items: center;
				&>.portrait_vessel{
					width:100px;
					border-radius: 50%;
					overflow: hidden;
					height:100px;
					&>image{
						width:100%;
						height: 100%;
					}
				}
			}
		}
	}
</style>
