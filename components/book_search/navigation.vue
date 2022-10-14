<template>
	<view class="head" :style="{background:head_toggle?'rgb(248,216,102)':'white',height:head_height*1.2+25+'px'}">
		<view class="status_bar">
		</view>
		
		<view v-if="!head_toggle" :style="{height:head_height*1.2+'px',boxSizing:'border-box'}" class="search_container">
			<search head_width="70" :head_height_child="head_height_child" :book_wh="book_wh" :head_height="head_height" height="70%"></search>
		</view>
			
		<view class="content" v-if="head_toggle" :style="{height:head_height*1.2+'px'}">
			<view>
				<uni-icons size="25" type="location-filled"></uni-icons><text style="font-size: 18px;">源暮书城</text>
			</view>
		</view>
		
	</view>
</template>

<script>
	import search from './search.vue'
	import {ref,onMounted,watch} from 'vue'
	export default {
		components:{
			search
		},
		props:['state','head_height','head_height_child','book_wh'],
		setup(props){
			let head_toggle=ref(true)
			watch(()=>props.state,(v)=>{
				head_toggle.value=v
			})
			return {head_toggle}
		}
	}
</script>

<style scoped lang="less">
.head{
	position: fixed;
	top:0;
	z-index:9999;
	left:0;
	width:100%;
	flex-direction: column;
	display: flex;
	justify-content: space-between;
	transition:0.5s ease;
	// background-color: rgb(248,216,102);
}
.status_bar{
	width: 100%;
	height:var(--status-bar-height);
	// height:25px;
}
.search_container{
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}
.content{	
	padding:2px 15px 0;
	box-sizing: border-box;
	display: flex;
	width:100%;
	justify-content:flex-start;
	align-items: center;	
	&>view{
		
	}
}
</style>
