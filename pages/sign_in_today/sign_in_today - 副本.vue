<template>
	<view>
		<navigation show_back='1'>
			每日签到
		</navigation>
		<page>
			<view class="container">
				<view class="user_info">
					<view>
					</view>
					<view>
						我的积分:{{score}}
					</view>
				</view>
				<view class="week">
					<view class="" v-for="(item,index) in 7" :key="index">
						<view class="">
							<image style="width: 50px;height:50px;" src="https://www.mynameisczy.asia/svgs/sign_manage.svg" mode=""></image>
						</view>
						<view class="">
							星期{{item}}
						</view>
					</view>
				</view>
				<view class="sgin_in">
					<view class="flex_center">
						<image @click="sign_fun" :src="sign_icon" class="sign_icon "></image>
					</view>
					<view style="text-align: center;padding-top:10px;">
						{{sign?'已签到':'立刻签到'}}
					</view>
				</view>
			</view>
		</page>
	</view>
</template>

<script>
	import {ref,computed,reactive} from 'vue'
	import {useStore} from 'vuex'
	import page from '../inner_page/inner_page.vue'
	import uniDatTimePicker from '@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/calendar-item.vue'
	import navigation from '../navigation/navigation_all.vue'
	export default {
		components:{
			navigation,uniDatTimePicker,page
		},
		mounted() {
			uni.showLoading({
				title:'加载中'
			})
			uni.current_this10=this
			let date=new Date()
			let month=date.getMonth()==12?1:date.getMonth()+1
			let day=date.getDate()
			let current_date=`${date.getFullYear()}-${month<10?'0'+month:month}-${day<10?'0'+day:day}`
			// 从服务器内获取签到的次数
			// uni.request({
				// url:''
			// })
			
			// 查询最近7天内的登录情况，
			
			// 数据库表结构(arrary string):['','']
			
			// 一，使用pop推出7个
				// 检测今天星期几
			if(!this.openid){
				uni.navigateBack()
			}
			uni.request({
				url:'https://www.mynameisczy.asia:5351/get_sign_in_day',
				method:'POST',
				data:{
					openid:this.openid
				},
				success(res) {
					let date_date=res.data.value
					console.log(res,'res');
					if(!date_date){
						uni.showToast({
							icon:'error',
							title:'发声未知的错误'
						})
					}
					// 检索是否存在
					if(date_date.indexOf(current_date)>=0){
						// 已签到
						uni.current_this10.sign=true
					}
					uni.hideLoading()
				},fail() {
					uni.showToast({
						icon:'error',
						title:'请重新登录'
					})
					uni.hideLoading()
				}
			})
			

		},
		setup(){
			let store=reactive(useStore())
			let openid=computed(()=>store.getters.user_openid)
			// 当前积分分数
			let score=computed(()=>store.getters.user_score)
			// 当前日期
			let week_info=reactive([])
			// 默认未签到
			let sign=ref(false)
			let sign_icon=computed(()=>{
				if(sign.value==true)
					return 'https://www.mynameisczy.asia/svgs/sign_in_selected.svg'
				else
					return 'https://www.mynameisczy.asia/svgs/sign_in.svg'
			})
			
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*2.5)
			function sign_fun(){
				if(sign.value==true)
					return
				uni.request({
					url:'https://www.mynameisczy.asia:5351/sign_in_day',
					method:'POST',
					data:{
						openid:openid._value
					},success(res) {
						if(res.data.error){
							throw 'err'
						}
						uni.current_this10.sign=true
						uni.current_this10.store.state.score=Number(uni.current_this10.store.state.score)+10
						uni.showToast({
							icon:'success',
							title:'签到成功'
						})
					},fail(e) {
						console.log('fail',e);
						uni.showToast({
							icon:'error',
							title:'签到失败'
						})
					}
				})
			}
			return {head_height_child,openid,week_info,sign,sign_fun,sign_icon,score,store}
		}
	}
</script>

<style lang="less">
@import url("@/general.less");
.container{
padding:10px 20px;
background-color: white;
box-sizing: border-box;
height:100%;
&>.week{
	display: flex;
	margin-top:20px;
	justify-content: space-around;
}
&>.user_info{
	display: flex;
	justify-content: space-between;
}
}
.sgin_in{
	display: flex;
	margin-top:200px;
	flex-direction: column;
}
.sign_icon{
	width: 100px;
	height: 100px;
}
</style>
