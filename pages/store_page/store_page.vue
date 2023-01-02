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
					<uni-badge class="uni-badge-left-margin" :text="user_car.length" absolute="rightTop" :offset="[-3, -3]" size="small">
					<uni-icons type="cart" size="27"></uni-icons>
					</uni-badge>
					<!-- 购物车 -->
				</view>
			</view>
			<scroll-view class="content" scroll-y="true">
				<view class="shops">
					<view class="shop" v-for="(item,index) in shops" :index="index">
						<view class="title">
							<view class="tit">
								{{item.name}}({{item.count}})
							</view>
							<view class="set" style="margin-bottom: 10px">
								<image style="width:23px;height:23px;margin-right:5px;" src="../../static/icons/coin.svg"></image>
								{{item.price}}
							</view>
						</view>
						<view class="img">
							<image :src="item.picture" mode=""></image>
						</view>
						<view class="btn" @click="buy(item)" :style="{background:item.count<=0?'lightgray':'orange',border:item.count<=0?'1px solid lightgray':'1px solid orange'}">
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
				uni.sendSocketMessage({
						data:JSON.stringify({
							state:1,
							name:'狗子'
						})
					})
				console.log('e');
			})
			// 关闭连接
			uni.onSocketError(function(){
				
			})
			uni.current_this16=this
			uni.onSocketMessage(function(res){
				let data=JSON.parse(res.data)
				console.log(data,'data');
				// 加载商品信息
				if(data.state==1){
					uni.current_this16.shops.push(...data.value)
					// 获取用户的购物车信息
					uni.request({
						url:'https://www.mynameisczy.asia:5000/get_user_shop',
						method:'POST',
						data:{
							openid:uni.current_this16.store.getters.user_openid
						},success(res) {
							if(res.data.state==0){
								uni.showToast({
									title:'购物车加载失败',
									icon:'error'
								})
								return
							}
							let shops=JSON.parse(res.data.value.shops)
							if(shops.length)
								uni.current_this16.user_car.push(...shops)
						},fail() {
							uni.showToast({
								title:'购物车加载失败',
								icon:'error'
							})
						}
					})
				}
			})
		},
		onUnload() {
			uni.closeSocket()
		},
		setup() {
			const store=reactive(useStore())
			let shops=reactive([])
			let user_car=reactive([])
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
					url:'/pages/store_page/car/car?user_car='+JSON.stringify(user_car)
				})
			}
			function buy(item){
				if(item.count<=0){
					console.log('存货不足');
					return
				}
				uni.showToast({
					title:'购买成功',
					icon:'success'
				})
			}
			return {store,score,car,buy,shops,user_car}
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
			&>.title{
				display: flex;
				width: 100%;
				justify-content: space-around;
			}
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
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
				&:active{
					border: 1px solid orange !important;
					background-color: white !important;
				}
			}
		}
	}
}
</style>
