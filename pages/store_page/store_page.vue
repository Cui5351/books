<template>
	<navigation show_back='1'>源暮商城</navigation>
	<innerpage >
		<view class="container">
			<view class="navigation">
					<view class="set">
						<image style="width:23px;height:23px;margin-right:5px;" src="../../static/icons/coin.svg"></image>
						{{score}}
					</view>
				<view @click="car">
					<uni-badge class="uni-badge-left-margin" :text="2" absolute="rightTop" :offset="[-3, -3]" size="small">
					<uni-icons type="cart" size="27"></uni-icons>
					</uni-badge>
					<!-- 购物车 -->
				</view>
			</view>
			<scroll-view class="content" scroll-y="true">
				<view class="shops">
					<view class="shop" v-for="(item,index) in 7" :index="index">
					<view class="set" style="margin-bottom: 10px">
						<image style="width:23px;height:23px;margin-right:5px;" src="../../static/icons/coin.svg"></image>
						100
					</view>
						<view class="img">
							<image src="../../static/icons/bills_active.jpg" mode=""></image>
						</view>
						<view class="btn">
							兑换
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</innerpage>
</template>

<script>
	import {useStore} from 'vuex'
	import {ref,computed,reactive} from 'vue'
	import innerpage from '../inner_page/inner_page.vue'
	import navigation from '../navigation/navigation_all.vue'
	import uniBadge from '@/uni_modules/uni-badge/components/uni-badge/uni-badge.vue'
	export default {
		components:{
			innerpage,navigation,uniBadge
		},
		onLoad(){
			// 连接
			uni.connectSocket({url:'wss://www.mynameisczy.asia:5000/store_info',fail(e) {
				console.log('fail',e);	
			},success(e) {
				console.log('success',e);
				
			}})
			// 打开连接
			uni.onSocketOpen(function(res){
				console.log('e');
			})
			// 关闭连接
			uni.onSocketError(function(){
				
			})
			uni.onSocketMessage(function(res){
				console.log(res,'res');
				uni.sendSocketMessage({
						data:JSON.stringify({
							state:1,
							name:'狗子'
						})
					})
			})
		},
		onUnload() {
			uni.closeSocket()
		},
		setup() {
			const store=reactive(useStore())
			let score=ref(store.getters.user_score)
			function car(){
				if(!store.getters.login_state){
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
					return
				}
				uni.navigateTo({
					url:'/pages/store_page/car/car'
				})
			}
			return {store,score,car}
		}
	}
</script>

<style lang="less">
.set{
		color:gray;
		font-size:14px;
		margin-left:10px;
		display: flex;
		justify-content: space-around;
		align-items: center;
		border-radius:10rpx;
	}
.container{
	width: 100%;
	overflow: hidden;
	height:100%;
	// background-color: rgba(255,0,0,.1);
	display: flex;
	flex-direction: column;
	&>view{
		flex-grow: 1;
		box-sizing: border-box;
		padding: 0 20px;
	}
	&>.navigation{
		width: 100%;
		max-height:8%;
		min-height:8%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: white;
	}
	&>.content{
		width:100%;
		box-sizing: border-box;
		height:92%;
		// background-color: skyblue;
	}
	.shops{
		display: flex;
		column-count: 2;
		width:100%;
		height:100%;
		flex-wrap: wrap;
		box-sizing: border-box;
		.shop{
			box-sizing: border-box;
			border-right:1px solid lightgray;
			border-bottom:1px solid lightgray;
			&>.price{
				margin-bottom:10px;
			}
			flex-grow:1;
			min-width:50%;
			max-width: 50%;
			width: 50%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			height:200px;
			&>.img{
				margin-bottom: 10px;
				width:80px;
				height:100px;
				&>image{
					width:100%;
					height:100%;
				}
			}
			&>.btn{
				color: white;
				border-radius: 10px;
				padding: 5px 10px;
				background-color: orange;
				box-sizing: border-box;
				&:active{
					border: 1px solid orange;
					background-color: white;
				}
			}
		}
	}
}
</style>
