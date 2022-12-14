<template>
		<view class="head" :style="{background:head_toggle?'rgb(248,216,102)':'white'}">
		<navigation>我的</navigation>
		<image style="position: absolute;width: 100%;height: 100%;opacity: 0.8;top:0;left: 0;z-index:999999999999;" mode="bottom right" src="https://www.mynameisczy.asia/my_image/stars_sky.jpg"></image>
		<view class="userPortrait" :style="{height:head_height*1.4+'px',marginTop:head_height+'px'}">
			<view class="portraitEdit" style="position: relative;z-index:9999999999991;">
				<view class="portrait" :style="{width:portraitW+'px'}">
					<image :src="user_info.portraitUrl" mode=""></image>
				</view>
				<view class="user_info" v-if="login_state">
					<view class="user_name">{{user_info.name}}</view>
					<view class="user_tel">
							<view>{{user_info.telephone}}</view>
							<view class="set"><uni-icons type="notification-filled"></uni-icons>积分:{{user_info.score}}</view>
					</view>
				</view>
				<view class="login_btn" v-if="!login_state" @click="login">
						登录/注册
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import search from './book_search/search.vue'
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
					this.portraitW=data.height-15
				}).exec()
				uni.showLoading({
					title:'加载中'
				})
				console.log(this);
				if(this.user_info.openid&&this.login_state){
					uni.request({
						url:'https://www.mynameisczy.asia:5351/getAnswer',
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
							console.log(e)
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
			watch(()=>props.state,(v)=>{
				console.log('change',v);
				head_toggle.value=v
			})
			const store=reactive(useStore())
			function login(){
				uni.getUserProfile({
					desc:'hello',
					success(res) {
						// 登录成功后拿到数据
						// 并获取openid
					// 通过openid拿到answer
						uni.showLoading({
							title:'加载中'
						})
						uni.login({
							provider:'weixin',
							success(e) {
								uni.request({
									url:'https://www.mynameisczy.asia:5351/getOpenid',
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
										// 每1分钟(60000ms)发送一次网络请求（更新数据）
										let timer=setInterval(()=>{
											
											// 如果退出登录了，清除定时器
											if(store.state.openid.length<=1){
												store.dispatch('setLoginState',0)
												clearInterval(timer)
											}
											
											uni.request({
												url:'https://www.mynameisczy.asia:5000/user_data_auto_update',
												method:'POST',
												data:{openid:store.state.openid},
												success(res) {
													if(!res.data.state){
														uni.showToast({
															icon:'error',
															title:'请重新登录'
														})
														store.dispatch('setLoginState',0)
														return
													}
													console.log(res,'更新的数据');
												},
												fail() {
													store.dispatch('setLoginState',0)
												}
											})
											
									return
										// 获取用户回复
										uni.request({
											url:'https://www.mynameisczy.asia:5351/getAnswer',
											method:'POST',
											data:{
												openid:openid
											},success(e) {
												console.log(e.data.value[0]);
												if(e.data.value[0].author_answer.length){
													uni.setStorage({
														key:'answer',
														data:e.data.value[0]
													})
													uni.showToast({
														icon:'none',
														title:'author给您回复'
													})
												}
												// 小说提供猿
												if(e.data.value[0].data_provide_answer.length){
													
													uni.showToast({
														icon:'none',
														title:'小说提供猿给您回复'
													})
												}
											},fail(e) {
												console.log(e);
											}
										})
										},5000)
										
									uni.request({
										url:'https://www.mynameisczy.asia:5351/login_user',
										method:'POST',
										data:{
											nickName,gender,avatarUrl,openid
										},success(res2) {
											
											console.log('res2',res2);
											// 将信息进行替换
											if(res2.data.value instanceof Object){
												value=res2.data.value
												
												nickName=value.nickName
												gender=value.gender
												avatarUrl=value.avatarUrl
												score=value.score
												author_answer=value.author_answer
												data_provide_answer=value.data_provide_answer
											}
											
											store.state.name=nickName
											store.state.portraitUrl=avatarUrl
											store.state.score=score
											store.state.author_answer=author_answer
											store.state.data_provide_answer=data_provide_answer
											uni.hideLoading()
											
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
										console.log(e,'my_navigation150');
									}
								})
							}
						})
					},
					faile(err){
						// 提示错误信息
						uni.hideLoading()
						console.log(err);
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
	background-color: @background;
	display:flex;
	justify-content: flex-start;
	align-items: center;
	&>.portraitEdit{
		width:70%;
		height:80%;
		display: flex;
		font-size:18px;
		&>.portrait{
			height:95%;
			border-radius:50%;
			overflow: hidden;
			&>image{
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
		}
		&>.user_info{
			padding:10px 10px;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			flex-grow: 1;
			&>.user_name{
				flex-grow: 1;
				font-weight:bold;
				max-height: 50%;
				min-height: 50%;
			}

			&>.user_tel{
				flex-grow: 1;
				display: flex;
				max-height: 50%;
				min-height: 50%;
				justify-content: space-between;
				&>.set{
					font-size:14px;
					border-radius:10rpx;
				}
			}
		}
	}
}
</style>