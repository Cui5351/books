<template>
	<view class="head" :style="{marginTop:show_e?'0%':'-100%',background:color.color?'rgb(241,229,201)':'#1A1A1A'}">
		<view class="status_bar">
		</view>
		<view class="edit_bar" :style="{height:head_height_child+'px',background:color.color?'rgb(241,229,201)':'#1A1A1A',color:color.color?'black':' #B1B1B1'}">
			<view class="back"><uni-icons  :color="color.color?'black':' #B1B1B1'" class="edit_btn" type="left" size="25" @click="back"></uni-icons></view>
			<view style="text-overflow: ellipsis;white-space: nowrap;">{{current_book_passage_name}}</view>
			<view></view>
		</view>
		<!-- 方案一 -->
			<!-- 上左侧为章节名 -->
			<!-- 上中间为一个滑杆，对应显示的字号大小 -->
		
		<!-- 方案二 -->
			<!-- 上左侧为一个可点击的按钮，点击后从左侧显示一个可以设置的面板(字号设置,颜色设置,章节切换) -->
			<!-- 上中间为当前章节 -->
	</view>
</template>

<script>
	import {ref} from 'vue';
	export default {
		name:"booksPageNavigation",
		props:["head_height_child","current_book_passage_name",'color','show_e'],
		setup(){
			function back(){
				uni.navigateBack({
					delta: 1,
					animationType: 'pop-out',
					animationDuration: 200
				});
			}
			return {back}
		}
	}
</script>

<style scoped lang="less">
.head{
	box-shadow:0 4px 10px -3px gray;
	// font-family: '楷体';
	position: fixed;
	transition: .3s ease;
	top:0;
	z-index:9999;
	left:0;
	width:100%;
	// background-color: rgb(248,216,102);
}
.status_bar{
	height:var(--status-bar-height);
}
.edit_bar{
	transition:1s ease;
	overflow: hidden;
	// background-color:red ;
	display: flex;
	padding: 0 20px;
	box-sizing: border-box;
	&>.back{
		justify-content: flex-start;
	}
	&>view{
		flex-grow: 1;
		font-size: 18px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
</style>

