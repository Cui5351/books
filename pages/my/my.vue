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
				<view class="edit_item" @click='gotoPage("/pages/poker/poker")'>
					<view>
						<uni-icons type="eye"></uni-icons>
						斗地主
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
				if(url=='/pages/poker/poker')
					if(!store.getters.login_state){
						uni.showToast({
							icon:'error',
							title:'请先登录'
						})
						return
					}
						
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
