<template>
	<view class="head" :style="{background:head_toggle?'rgb(248,216,102)':'white'}">
		<view class="status_bar">
		</view>
		
		<view class="content" v-if="head_toggle" :style="{height:head_height+'px'}">
			<view>
				<text>我的</text>
			</view>
		</view>
		
		<view class="userPortrait" :style="{height:head_height*2+'px'}">
			<view class="portraitEdit">
				<view class="portrait" :style="{width:portraitW+'px'}">
					<image :src="user_info.portraitUrl" mode=""></image>
				</view>
				<view class="user_info" v-if="login_state.state">
					<view class="user_name">{{user_info.name}}</view>
					<view class="user_tel">
							<view>{{user_info.telephone}}</view>
							<view class="set"><uni-icons type="color-filled"></uni-icons>修改</view>
					</view>
				</view>
				<view class="login_btn" v-if="!login_state.state" @click="login">
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
	export default {
		components:{
			search
		},
		mounted(){
				uni.current_this=this
				const query = uni.createSelectorQuery().in(this);
				query.select('.userPortrait').boundingClientRect(data => {
					this.portraitW=data.height-15
				}).exec()
				uni.showLoading({
					title:'加载中'
				})
				let user=uni.getStorageSync('user_info')
				if(user){
					this.user_info.name=user.nickName
					this.user_info.portraitUrl=user.avatarUrl
					this.login_state.state=true
					
					uni.request({
						url:'https://www.mynameisczy.asia:5351/getAnswer',
						method:'POST',
						data:{
							openid:user.openid
						},success(e) {
							uni.current_this.store.dispatch('setLoginState',1)
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
			// let user_info=reactive({
			// 	portraitUrl:'https://49.234.39.223/static/dog.png',
			// 	name:'mdn528464093',
			// 	telephone:'130****1793'
			// })
			let head_height=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let head_toggle=ref(true)
			let portraitW=ref(0)
			watch(()=>props.state,(v)=>{
				head_toggle.value=v
			})
			const store=useStore()
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
										const {nickName,gender,avatarUrl}=res.userInfo
										uni.request({
											url:'https://www.mynameisczy.asia:5351/getAnswer',
											method:'POST',
											data:{
												openid:openid
											},success(e) {
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
											},fail(e) {
												console.log(e);
											}
										})
										uni.setStorage({
											key:'user_info',
											data:{
												nickName,gender,avatarUrl,openid
											}
										})
										store.dispatch('setLoginState',1)
										uni.request({
											url:'https://www.mynameisczy.asia:5351/login_user',
											method:'POST',
											data:{
												nickName,gender,avatarUrl,openid
											}
										})
									},fail(e) {
										console.log(e,'my_navigation158');
									}
								})
							}
						})
						uni.current_this.user_info.name=res.userInfo.nickName
						uni.current_this.user_info.portraitUrl=res.userInfo.avatarUrl
						uni.current_this.login_state.state=true
						uni.hideLoading()
					},
					faile(err){
						// 提示错误信息
						uni.hideLoading()
						console.log(err)
					}
				})
			}
			return {head_toggle,portraitW,login,head_height,store}
		}
	}
</script>

<style scoped lang="less">
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
	background-color: rgb(248,216,102);
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
					background-color: rgba(255,255,255,.6);
					border-radius:10rpx;
				}
			}
		}
	}
}
</style>
