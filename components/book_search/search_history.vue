<template>
		<view class="history" :style="{height:(info.windowHeight/2)*0.5+'px',marginTop:10+'px'}">
			<view class="title" :style="{maxHeight:head_height*0.8+'px',minHeight:head_height*0.8+'px'}">
				<view class="">历史搜索</view>
				<uni-icons type="trash" @click='clear_search_record' size="25"></uni-icons>
			</view>
			<view class="search_record">
				<view v-for="(item,index) in search_record" :key="index" @click="search(item)">{{item}}</view>
			</view>
		</view>
</template>

<script>
	export default {
		name:"search_history",
		props:['search_record','clear_search_record','search','head_height','info','default_search_text'],
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="less">

	.history{
		display: flex;
		flex-direction: column;
		background-color: white;
		padding:5px 20px 10px 20px;
		box-sizing: border-box;
		&>.search_record{
			width:100%;
			display: flex;
			column-count: 3;
			flex-wrap: wrap;
			&>view{
				padding:5px 10px;
				background:rgba(0,0,0,0.05);
				height:23px;
				line-height: 23px;
				color: gray;
				margin:5px 5px;
				border-radius:15px;
			}
		}
	}
	.title{
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom:5px;
		box-sizing: border-box;
		border-bottom:1px solid rgb(234,234,234);
		&>view{
			flex-grow: 1;
		}
	}
</style>