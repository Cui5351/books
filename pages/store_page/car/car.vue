<template>
	<navigation show_back='true'>我的商品</navigation>
	<innerpage>
		<view class="container">
			<uni-notice-bar show-icon scrollable style="width: 100%;"
				text="每 周 三 / 周 六 可 以 在 长 艺 2 栋 教 学 楼 下 领 取 兑 换 的 礼 品" />
			<scroll-view class="bills" scroll-y="true">
				<view class="bill" v-for="(item,index) in user_car" :index='index' >
					<view class="img">
						<image :src="item.picture"></image>
					</view>
					<view class="title">
						{{item.name}}
						<uni-icons type="closeempty"></uni-icons>{{item.count2}}
					</view>
				</view>
				<view class="none" v-show="user_car.length<=0">
					暂无商品
				</view>
			</scroll-view>
		</view>
	</innerpage>
</template>

<script>
	import innerpage from '../../inner_page/inner_page.vue'
	import navigation from '../../navigation/navigation_all.vue'
	import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/popup.js'
	import {reactive} from 'vue'
	export default {
		components:{
			innerpage,navigation,uniPopup
		},
		onLoad(res) {
			this.user_car.push(...JSON.parse(res.user_car))
		},
		setup(){
			let user_car=reactive([])
			return {user_car}
		}
	}
</script>

<style lang="less">
.container{
	width: 100%;
	height:100%;
	overflow: hidden;
}
.bills{
		padding:0 10px;
		box-sizing: border-box;
		height:90%;
		width:100%;
}
.bill{
	box-sizing: border-box;
	padding:0 20px;
	border-radius: 15px;
	margin-bottom:10px;
	background-color: white;
	align-items: center;
	justify-content: space-between;
	display: flex;
}
.img{
	width:80px;
	height:100px;
	display: flex;
	justify-content: center;
	align-items: center;
	&>image{
		width: 90%;
		height:90%;
	}
}
.none{
	width: 100%;
	justify-content: center;
	align-items: center;
	display: flex;
	color: gray;
}
</style>
