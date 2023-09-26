<template>
		<view class="search" :style="{height:head_height+'px',width:head_width+'%'}" @click="toSearchPage" >
			<view>
				<uni-icons size="20" color="gray" class="searchIcon" type="search"></uni-icons>
				<view type="text" class="txt" placeholder="请输入书名或作者名">{{suggest_book}}</view>
				<button :style="{fontSize:size+'rpx',color:'white'}">搜索</button>
			</view>
		</view>
</template>

<script>
	import {ref,computed} from 'vue'
	import {useStore} from 'vuex'
	export default {
		name:"search",
		props:['head_height','book_wh','head_width'],
		setup(props){
				let size=ref(32)
				let to_hid=ref(0)
				let suggest_book=ref('')
				let store=useStore()
				let login_state=computed(()=>store.getters.login_state)
				function toSearchPage(){
					if(login_state.value<=0){
						uni.showToast({
							icon:'error',
							title:'清先登录'
						})
						return
					}
					if(to_hid.value!==2)
						uni.navigateTo({
							url:'/components/searchPage/searchPage?head_height='+props.head_height_child+'&book_wh='+props.book_wh+'&default_search_text='+suggest_book.value
						})
					else{
						uni.showToast({
							title:'刚开始学小程序，这只是个普通控件',
							icon:'none'
						})
						return
					}
				}
					uni.request({
						url:'https://www.mynameisczy.cn:5351/getRandomBook',
						method:'POST',
						data:{
							count:1
						},success(val) {
							suggest_book.value=val.data.value[0].book_name
						},fail(err) {
						}
					})
			return {
				size,toSearchPage,suggest_book,login_state,to_hid
			}
		}
	}
</script>

<style lang="less">
@import url('@/general.less');
.search{
	padding:0 15px;
	box-sizing: border-box;
	display: flex;
	justify-content:flex-start;
	align-items: flex-end;
	&>view{
		box-sizing: border-box;
		width:100%;
		height:100%;
		display: flex;
		justify-content: center;
		align-items: center;
		border:1px solid rgb(223,160,95);
		border-radius:40rpx;
		// border-bottom-right-radius:10px;
		&>view,button{
			height:100%;
		}
		&>view{
			width:65%;
		}
		&>.searchIcon{
			width:10%;
			height:100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.txt{
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			justify-content: flex-start;
			color:gray;
			font-size:16px;
			display: flex;
			align-items: center;
		}
		&>button{
			margin:0;
			padding:0;
			width:25%;
			height:100%;
			// background-color: @btn_color;
			color: rgb(223,160,95);
			background-color: rgb(191,84,57);
			
			border-radius:40rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
	}
</style>
