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
					<view style="display: flex;">
					<image style="width:23px;height:23px;margin-right:5px;" src="../../static/icons/coin.svg"></image>
					积分:{{score}}
					</view>
				</view>
				<view class="show_day" style="position: relative;">
					<image style="position: absolute;border-radius:10px;width: 100%;height: 100%;opacity: 0.9;top:0;left: 0;" mode="aspectFill"  src="https://mynameisczy.cn/play_loop/书中奇遇阅读.svg"></image>
					<view v-for="(item,index) in week" style="position: relative;z-index:2;">
						<view style="color: white;">{{item.day}}</view>
						<view style="min-height:80%;width: 70%;">
							<image v-if="item.state==1" src="https://www.mynameisczy.cn/svgs/sign_selected_icon.svg" style="width: 100%;height:100%;"></image>
							<image v-else src="https://www.mynameisczy.cn/svgs/sign_in_icon.svg" style="width: 100%;height:100%;"></image>
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
				title:'加载中',
				mask:true
			})
			uni.current_this10=this
			let date=new Date()
			
			let current_date=this.format(date)
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
				url:'https://www.mynameisczy.cn:5000/get_sign_in_day',
				method:'POST',
				data:{
					openid:this.openid
				},
				success(res) {
					let date_date=res.data.value
					uni.current_this10.date_date.date_date.push(...date_date)
					if(!date_date){
						uni.showToast({
							icon:'error',
							title:'发声未知的错误'
						})
					}
					
					// 查看星期一的日期
					let monday=date.setDate(date.getDate()-(date.getDay()?date.getDay():7))
					// 推演出一个星期的日期
					uni.current_this10.week.forEach((item,index)=>{
						item.date=uni.current_this10.format(new Date(monday+1000*(index+1)*60*60*24))
					})
					
					uni.current_this10.date_date.date_date.forEach(item=>{
						uni.current_this10.week.forEach(item2=>{
							if(item==item2.date){
								item2.state=1
							}
						})
					})
					// 检索是否存在
					if(date_date.indexOf(current_date)>=0){
						// 已签到
						uni.current_this10.sign=true
					}
					uni.hideLoading()
				},fail(e) {
					console.log(e,'e');
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
			let date_date=reactive({
				date_date:[]
			})
			let openid=computed(()=>store.getters.user_openid)
			// 当前积分分数
			let score=computed(()=>store.getters.user_score)
			// 当前日期
			let week_info=reactive([])
			
			function format(date){
				let month=date.getMonth()==12?1:date.getMonth()+1
				let day=date.getDate()
				return `${date.getFullYear()}-${month<10?'0'+month:month}-${day<10?'0'+day:day}`
			}
			
			let week=reactive([
				{
					day:'星期一',
					state:0
				},{
					day:'星期二',
					state:0
				},{
					day:'星期三',
					state:0
				},{
					day:'星期四',
					state:0
				},{
					day:'星期五',
					state:0
				},{
					day:'星期六',
					state:0
				},{
					day:'星期天',
					state:0
				}
			])
			// 默认未签到
			let sign=ref(false)
			let sign_icon=computed(()=>{
				if(sign.value==true)
					return 'https://www.mynameisczy.cn/svgs/sign_in_selected.svg'
				else
					return 'https://www.mynameisczy.cn/svgs/sign_in.svg'
			})
			
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*2.5)
			function sign_fun(){
				if(sign.value==true)
					return
				uni.request({
					url:'https://www.mynameisczy.cn:5000/sign_in_day',
					method:'POST',
					data:{
						openid:openid._value
					},success(res) {
						console.log(res,'res');
						if(res.data.error==3){
							uni.showToast({
								title:'请重新登录'
							})
							throw 'err'
						}
						uni.current_this10.date_date.date_date.push(uni.current_this10.format(new Date()))
						uni.current_this10.sign=true
						uni.current_this10.date_date.date_date.forEach(item=>{
							uni.current_this10.week.forEach(item2=>{
								if(item==item2.date){
									item2.state=1
								}
							})
						})
						uni.current_this10.store.state.score=Number(uni.current_this10.store.state.score)+10
						uni.showToast({
							icon:'success',
							title:'签到成功'
						})
					},fail(e) {
						uni.showToast({
							icon:'error',
							title:'签到失败'
						})
					}
				})
			}
			return {head_height_child,openid,week_info,sign,sign_fun,sign_icon,score,store,week,date_date,format}
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
	margin-bottom: 20px;
}
}
.sgin_in{
	display: flex;
	margin-top:100px;
	flex-direction: column;
}
.sign_icon{
	width: 100px;
	height: 100px;
}
.show_day{
	padding:10px 0 20px 0;
	box-sizing: border-box;
	height:370px;
	border-radius: 10px;
	box-shadow:0px 2px 10px 5px rgba(0,0,0,.1);
	background-color:rgba(255,0,0,.5);
	display: grid;
	grid-row: 2;
	grid-gap:10px 10px;
	grid-template-columns: 1fr 1fr 1fr;
	&>view{
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		&>view{
			flex-grow: 1;
		}
	}
}
</style>
