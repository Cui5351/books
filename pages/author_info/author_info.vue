<template>
	<navigation show_back='true' >
		作者集
	</navigation>
	<scroll-view  v-if="store_infos.length" @scrolltolower="fn" :scroll-y="true" :style="{marginTop:container_margin+30+'px',height:info.screenHeight-container_margin-50+'px'}">
		<view  class="bill" v-for="(item,index) in store_infos" :key="index">
		<view class="store_infos" @click.stop="toggle(item)" :style="{height:book_wh*1.1+'px',minHeight:book_wh*1.1+'px',maxHeight:book_wh*1.1+'px'}" >
			<view :style="{maxWidth:book_wh+'px',minWidth:book_wh+'px',minHeight:book_wh*1.2+'px',maxHeight:book_wh*1.2+'px'}">
				<image  @error="image_load_err(item)" :src="item.avatar?item.avatar:'https://www.mynameisczy.asia/author/'+item.name+'.jpg'" :style="{maxWidth:book_wh*0.8+'px',minWidth:book_wh*0.8+'px',minHeight:book_wh*1+'px',maxHeight:book_wh*1+'px'}"></image>
			</view>
			<view class="title">
				{{item.name}}
			</view>
		</view>
<!-- 		<view class="bottom">{{refresh_info}}
		<uni-icons :type="refresh_state_info"></uni-icons>
		</view> -->
		</view>
	</scroll-view>
	<view v-if="!store_infos.length" class="sorry">
		<view>此书暂时未上线,请敬请期待</view>
	</view>
</template>

<script>
	import {reactive,ref} from 'vue'
	import navigation from '../navigation/navigation_all.vue'
	export default {
		components:{
			navigation
		},
		mounted() {
			this.get_data()
		},
		setup() {
			let container_margin=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let info=reactive(uni.getSystemInfoSync())
			const store_infos=reactive([])
			let book_wh=ref(100)
			let skip=ref(0)
			function fn(){
				get_data()
			}
			// 添加数据
			function get_data(){
				uni.showLoading({
					title:'加载中',
				mask:true
				})
				uni.request({
					method:"POST",
					url:'https://www.mynameisczy.asia:5351/get_author_info',
					data:{count:10,skip:skip.value},
					success(res) {
						if(res.data.state==1){
							store_infos.push(...res.data.value)
							skip.value+=10
						}
					},
					complete() {
						uni.hideLoading()
					}
				})
			}
			let err_image=[]
			function image_load_err(item){
				if(err_image.indexOf(item.name)<0){
					err_image.push(item.name)
				}
				item.avatar='https://www.mynameisczy.asia/image/image_load_error.jpeg'
			}
			function toggle(item){
				uni.navigateTo({
					url:'/pages/author_info/author_inner_info/author_inner_info?item='+JSON.stringify(item)
				})
			}
			return {fn,store_infos,image_load_err,skip,toggle,book_wh,container_margin,info,get_data,container_margin}
		}
	}
</script>

<style scoped lang="less">
	.popup-content{
		box-sizing: border-box;
		padding:20px;
		&>text:first-child{
			margin-bottom:15px;
			font-weight:bold;
		}
		&>text{
			text-align: center;
			display: block;
			font-size:20px;
		}
	}
	.title{
		justify-content: center;
		align-items: center;
		display: flex;
		width: 50%;
		font-size:20px;
		color: gray;
		flex-direction: column;
	}
	.bill:first-child{
		margin-top:0px;
	}
	.bill{
		margin-top:10px;
		background-color: white;
		display: flex;
		flex-direction: column;
		padding:0px 10px 0px 10px;
		box-sizing: border-box;
			&>.bottom{
				height:30px;
				display: flex;
				justify-content: center;
				align-items: center;
				width:100%;
				color:gray;
			}
			&>.store_infos{
				margin:5px 0;
				&:active{
					background-color: rgba(0,0,0,.1);
				}
				.title{
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					height:100%;
					&>view{
						flex-grow: 1;
					}
				}
				&>view{
					flex-grow: 1;
					padding:10px 10px;
					box-sizing: border-box;
				}
				justify-content: center;
				align-items: center;
				display: flex;
				background-color: white;	
			}
		}
		.sorry{
			padding:20px;
			box-sizing: border-box;
			display: flex;
			justify-content: center;
			align-items: center;
			&>view{
				color: gray;
			}
		}
</style>
