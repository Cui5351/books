<template>
		<view class="head">
		<navigation></navigation>
		<image style="position: absolute;width: 100%;height: 100%;opacity: 0.8;top:0;left: 0;z-index:10000;" src="https://www.mynameisczy.cn/rabbit/my_navigation.jpg"></image>
		<view class="userPortrait" :style="{height:head_height*1.4+'px',marginTop:head_height+'px'}">
			<view @click="login" class="portraitEdit" style="position: relative;z-index:9999999999991;">
				<view class="portrait" :style="{width:portraitW+'px',height:portraitW+'px'}">
					<image :src="user_info.portraitUrl" style="filter: saturate(1.1);"></image>
				</view>
				<view class="user_info" v-if="login_state">
					<view class="user_name">{{user_info.name}}</view>
					<view class="user_tel">
							<!-- <view>{{user_info.telephone}}</view> -->
							<view style="width:20px;height: 20px;">
								<image v-show="user_info.gender=='未知'" style="width: 100%;height: 100%;" src="/static/icons/unknow_gender.svg"></image>
								<image v-show="user_info.gender!='未知'" style="width: 100%;height: 100%;" :src="'/static/icons/'+(user_info.gender=='男'?'male.svg':'female.svg')" mode="'"></image>
							</view>
						<view class="set">
							<image style="width:23px;height:23px;margin-right:5px;" src="../static/icons/coin.svg"></image>
						积分:{{user_info.score}}</view>
					</view>
				</view>
				<view class="login_btn" v-if="!login_state">
						登录/注册 
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import search from '@/components/book_search/search.vue'
	import {ref,onMounted,watch,reactive} from 'vue'
	import {useStore} from 'vuex'
	import navigation from '@/pages/navigation/navigation_all.vue'
	export default {
		components:{
			search,navigation
		},
		mounted(){
				uni.current_this12=this
				const query = uni.createSelectorQuery().in(this);
				query.select('.userPortrait').boundingClientRect(data => {
					this.portraitW=data.height-25
				}).exec()
				uni.showLoading({
					title:'加载中',
				mask:true
				})
				if(this.user_info.openid&&this.login_state){
					uni.request({
						url:'https://www.mynameisczy.cn:5000/getAnswer',
						method:'POST',
						data:{
							openid:this.user_info.openid
						},success(e) {
							uni.current_this12.store.dispatch('setLoginState',1)
							uni.getStorage({
								key:'answer',
								success(value) {
									uni.hideLoading()
								if(value.data.author_answer!=e.data.value[0].author_answer||value.data.data_provide_answer!=e.data.value[0].data_provide_answer)
									if(e.data.value[0].author_answer.length||e.data.value[0].data_provide_answer.length){
										uni.setStorage({
											key:'answer',
											data:e.data.value[0]
										})
										uni.showToast({
											icon:'none',
											title:'收到消息了'
										})
									}
									}
									})
						},fail(e) {
							uni.hideLoading()
						}
					})
				}
				uni.hideLoading()
		},
		props:["login_state","user_info"],
		setup(props){
			let head_height=ref(uni.getMenuButtonBoundingClientRect().height*2.5)
			let head_toggle=ref(true)
			let portraitW=ref(0)
			const store=reactive(useStore())
			watch(()=>props.state,(v)=>{
				head_toggle.value=v
			})
			function login(){
				if(store.getters.login_state){
					uni.navigateTo({
						url:'/pages/base_info/base_info'
					})
					return
				}
				uni.getUserInfo({
					desc:'hello',
					success(res) {
						// 登录成功后拿到数据
						// 并获取openid
					// 通过openid拿到answer
						uni.showLoading({
							title:'加载中',
							mask:true
						})
						uni.login({
							provider:'weixin',
							success(e) {
								uni.request({
									url:'https://www.mynameisczy.cn:5000/getOpenid',
									method:'POST',
									data:{
										code:e.code
									},success(value) {
										// 这里的value是session_key和openi
										let openid=value.data.value.openid
										// 默认的用户信息
										let {nickName,gender,avatarUrl}=res.userInfo
								
										store.state.openid=openid
										let score=0
										let author_answer=''
										let data_provide_answer=''
										
									uni.request({
										url:'https://www.mynameisczy.cn:5000/login_user',
										method:'POST',
										data:{
											nickName,gender,avatarUrl,openid
										},success(res2) {
											
											if(res2.state==1){
												return
											}
											// 将信息进行替换
											if(res2.data.value instanceof Object){
												value=res2.data.value
												nickName=value.nickName
												gender=value.gender
												avatarUrl=value.avatarUrl
												score=value.score
												author_answer=value.author_answer
												data_provide_answer=value.data_provide_answer
												store.state.introduction=value.introduction
											}
											store.state.name=nickName
											store.state.portraitUrl=avatarUrl
											store.state.score=score
											if(gender==0)
												gender='男'
											store.state.gender=gender
											store.state.author_answer=author_answer
											store.state.data_provide_answer=data_provide_answer
											uni.hideLoading()
										
											// 将回复存入本地
											uni.setStorage({
												key:'answer',
												data:{
													author_answer,data_provide_answer
												}
											})
											
											// 将原始信息存入本地
											uni.setStorage({
												key:'user_info',
												data:{
													...uni.current_this12.user_info
												}
											})
											store.dispatch('setLoginState',1)
										}
									})
									},fail(e) {
									}
								})
							}
						})
					},
					faile(err){
						// 提示错误信息
						uni.hideLoading()
					}
				})
			}
			return {head_toggle,portraitW,login,head_height,store}
		}
	}
</script>

<style scoped lang="less">
@import url('@/general.less');
.head{
	// font-family: '楷体';
	position: fixed;
	top:0;
	z-index:9999;
	left:0;
	width:100%;
	transition:0.5s ease;
	// background-color: rgb(248,216,102);
}
.status_bar{
	height:var(--status-bar-height);
}
.content{	
	font-size:36rpx;
	font-weight:bold;
	box-sizing: border-box;
	display: flex;
	justify-content:center;
	align-items: center;	
}
.userPortrait{
	padding:0 20px;
	box-sizing: border-box;
	background-color: white;
	display:flex;
	width:100%;
	justify-content: flex-start;
	align-items: center;
	&>.portraitEdit{
		width:100%;
		height:80%;
		display: flex;
		font-size:18px;
		&>.portrait{
			height:95%;
			&>image{
				border-radius:50%;
				width:100%;
				height:100%;
			}
		}
		.login_btn{
			display: flex;
			padding:0 20px;
			box-sizing: border-box;
			font-weight:bold;
			align-items: center;
			flex-grow: 1;
			color:white;
		}
		&>.user_info{
			padding:10px 10px;
			box-sizing: border-box;
			width:50%;
			display: flex;
			color:white;
			flex-direction: column;
			flex-grow: 1;
			&>.user_name{
				flex-grow: 1;
				font-weight:bold;
				max-height: 50%;
				color: black;
				letter-spacing: 2px;
				min-height: 50%;
			}

			&>.user_tel{
				flex-grow: 1;
				color:white;
				display: flex;
				max-height: 50%;
				min-height: 50%;
				justify-content: space-between;
				&>.set{
					color:white;
					font-size:14px;
					margin-left:10px;
					display: flex;
					justify-content: space-around;
					align-items: center;
					border-radius:10rpx;
				}
			}
		}
	}
}
</style>