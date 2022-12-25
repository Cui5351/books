<template>
	<view class="search_navigator">
		<view class="status_bar" style="background-color: white;">
		</view>
		<view class="title" :style="{height:head_height+'px'}">
			<view  style="justify-content: flex-start;padding-left:20px;box-sizing: border-box;"><uni-icons @click="back" type="left"  size="25"></uni-icons></view>
			<view style="font-weight:bold;">源暮书城</view>
			<view> </view>
		</view>
		<view class="searchBar" :style="{minHeight:head_height+'px'}">
			<view class="searchInput">
				<uni-icons type="search" size="25"></uni-icons>
				<input type="tel" v-model="search_text.t" :placeholder="default_search_text">
				<uni-icons v-if="!search_state" @click="clear_text" type="clear" color="gray" size="25"></uni-icons>
			</view>
			<view class="searchBtn" @click="search2">搜索</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"search_navigator",
		props:['head_height','search_text','default_search_text','search_state','clear_text','search2'],
		setup(props) {
			function back(){
				
				uni.navigateBack()
			}
			return {back}
		}
	}
</script>

<style scoped lang="less">
.searchBar{
	background-color: white;
			display: flex;
			&>view{
				flex-grow: 1;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			padding:0 20px;
			box-sizing: border-box;
			&>.searchInput{
				min-height:100%;
				max-height:100%;
				max-width:85%;
				min-width:85%;
				background-color: rgb(244,244,244);
				padding:-5px 10px;
				justify-content: center;
				align-items: center;
				display: flex;
				box-sizing: border-box;
				&>uni-icon{
					flex-grow: 1;
				}
				&>input{
					height:100%;
					margin-left:5px;
					flex-grow: 1;
				}
			}
		}
.search_navigator{
	font-size:18px;
	position: fixed;
	top:0;
	display: flex;
	flex-direction: column;
	z-index:9999;
	left:0;
	width:100%;
	transition:0.5s ease;
}
.status_bar{
	height:var(--status-bar-height);
}
.title{
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: white;
}
.title>view{
	width:100%;
	height:100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-grow: 1;
}
</style>