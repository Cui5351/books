<template>
	<view class="container">
		<navigation  :head_height='head_height_child' :user_info="user_info" :login_state="login_state" ></navigation>
		<scroll-view scroll-y="true" class="eidt_bar" :style="{marginTop:head_height_child*3.2+'px'}">
			<view class="eidts" :style="{maxHegiht:info+'px',minHeight:info+'px'}">
				<view class="edit_item" @click="sign_in_today">
					<view>
						<uni-icons type="calendar"></uni-icons>
						每日签到
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
				<view class="edit_item" @click='gotoPage("/pages/store_page/store_page")'>
					<view>
						<uni-icons type="cart"></uni-icons>
						源暮商城
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
				<view class="edit_item" @click="toggle_base_info">
					<view>
						<uni-icons type="person"></uni-icons>
						基本信息
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
				<view class="edit_item" @click="no_develop">
					<view>
						<uni-icons type="eye"></uni-icons>
						最近阅读(暂未开放)
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
				<view class="edit_item" @click='gotoPage("/pages/chat/chat")'>
					<view>
						<uni-icons type="chatboxes"></uni-icons>
						书友会
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
				<view class="edit_item" @click="toggle_other_page">
					<view>
						<uni-icons type="tune"></uni-icons>
						实用工具
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
			<view class="edit_item" @click="feedback">
					<view>
						<uni-icons type="email"></uni-icons>
						小程序反馈
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
			</view>
			<view class="quit_login" @click="exitLogin">
				退出账号
			</view>
			<view :style="{height:height_each+'px',marginTop:0+'px',color:'gray'}" class="flex_bottom">
				v3.0.0
			</view>
			<view style="height:200px;">
				
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {ref,reactive,computed} from 'vue'
 	import navigation from './my_navigation.vue'
	import {useStore} from 'vuex'
	export default {
		setup(){
			const store=reactive(useStore())
			// 每20s(20000ms)发送一次网络请求（更新数据）
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
						let value=res.data.value
						if(value.avatarUrl!=store.getters.user_avatar||value.nickName!=store.getters.user_name||value.score!=store.getters.user_score||value.gender!=store.getters.user_gender){
								// 修改avatarUrl
							if(value.avatarUrl!=store.getters.user_avatar){
								store.state.portraitUrl=value.avatarUrl
							}
							// 修改name
							if(value.nickName!=store.getters.user_name){
								store.state.name=value.nickName
							}
							// 修改score
							if(value.score!=store.getters.user_score){
								store.state.score=value.score
							}
							// 修改gender
							if(value.gender!=store.getters.user_gender){
								store.state.gender=value.gender
							}
							// 写入本地
							uni.setStorage({
								key:'user_info',
								data:{
									gender:store.state.gender,
									name:store.state.name,
									openid:store.state.openid,
									portraitUrl:store.state.portraitUrl,
									score:store.state.score,
									telephone:store.state.telephone,
									introduction:store.state.introduction
								}
							})
						}
						let {author_answer,data_provide_answer}=res.data.value
						if(author_answer!=store.state.author_answer||data_provide_answer!=store.state.data_provide_answer){
							store.state.author_answer=author_answer
							uni.showToast({
								title:'收到了新消息'
							})
							// 将回复存入本地
							uni.setStorage({
								key:'answer',
								data:{
									author_answer,data_provide_answer
								}
							})
						}
					}
				})
			},20000)
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let height_each=ref(uni.getSystemInfoSync().statusBarHeight*2)
			
			function exitLogin(){
				// 设置store里的数据
				uni.setStorage({
					key:'user_info',
					data:'',
					success() {
						// 清除所有缓存
						uni.clearStorage()
						store.dispatch('setLoginState',0);
					}
				})
			}
			let info=ref(uni.getSystemInfoSync().windowHeight/1.7);
			let user_info=reactive({
				portraitUrl:computed(()=>store.getters.user_avatar),
				name:computed(()=>store.getters.user_name),
				telephone:'无',
				openid:computed(()=>store.getters.user_openid),
				gender:computed(()=>store.getters.user_gender),
				score:computed(()=>store.getters.user_score),
				introduction:computed(()=>store.getters.user_introduction)
			})
			let login_state=computed(()=>store.getters.login_state)
			function feedback(){
				if(user_info.name&&store.getters.login_state)
					uni.navigateTo({
						url:'/pages/feedback/feedback?user_name='+user_info.name
					})
				else
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
			}
			function no_develop(){
				uni.showToast({title:"此功能暂时未开放",icon:'none'})
			}
			
			function toggle_base_info(){
				if(!store.getters.login_state){
					uni.showToast({
						icon:'error',
						title:'请先登录'
					})
					return
				}
				uni.navigateTo({
					url:'/pages/base_info/base_info'
				})
			}
			function toggle_other_page(){
				uni.navigateTo({
					url:'/pages/other_page/other_page'
				})
			}
			
			function sign_in_today(){
				if(!store.getters.login_state){
					uni.showToast({
						icon:'error',
						title:'请先登录'
					})
					return
				}
				
				// 1发送网络请求，拿到签到日期
				
				
				// 2跳转页面
				uni.navigateTo({
					url:'/pages/sign_in_today/sign_in_today'
				})
			}
			function gotoPage(url){
				uni.navigateTo({
					url:url
				})
			}
			
			return {gotoPage,store,sign_in_today,toggle_other_page,toggle_base_info,head_height_child,feedback,login_state,user_info,height_each,exitLogin,info,no_develop}
		},
		components:{
			navigation
		}
	}
</script>

<style lang="less">
@import url('@/general.less');
	.container {
		font-size:16px;
		// font-size: 14px;
		line-height: 24px;
		width:100%;
		height:100%;
	}
	.eidt_bar{
		padding:20px 0;
		box-sizing: border-box;
		width:100%;
		height:100%;
	}
	.eidts{
		overflow: auto;
		display: flex;
		width:100%;
		flex-direction:column;
		&>view{
			flex-grow: 1;
		}
		&>.edit_item{
			&:active{
				background-color: rgba(0,0,0,.1);
			}
			padding:0 20px;
			box-sizing: border-box;
			background-color: white;
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom:1px;
		}
	}
		.quit_login{
			&:active{
				background-color: rgba(0,0,0,.1);
			}
			padding:10px 20px;
			box-sizing: border-box;
			background-color: white;
			font-size:17px;
			margin-top:20px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
</style>
