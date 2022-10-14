<template>
	<view class="container">
		<navigation  :head_height='head_height_child' :user_info="user_info" :login_state="login_state" ></navigation>
		<view class="eidt_bar" :style="{marginTop:head_height_child*3+'px'}">
			<view class="eidts" :style="{maxHegiht:info+'px',minHeight:info+'px'}">
				<view class="edit_item" v-for="(item,index) in link" :key="index"  @click="no_develop">
					<view>
						<uni-icons type="fire-filled"></uni-icons>
						{{item.text}}
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
			<view class="edit_item" @click="feedback">
					<view>
						<uni-icons type="fire-filled"></uni-icons>
						小程序反馈
					</view>
					<uni-icons type="right"></uni-icons>
				</view>
			</view>
			<view class="quit_login" @click="exitLogin">
				退出账号
			</view>
			<view :style="{height:height_each+'px'}"></view>
		</view>
	</view>
</template>

<script>
	import link from '../../static/json/my_link_bar.js'
	import {ref,reactive} from 'vue'
 	import navigation from '../../components/my_navigation.vue'
	import {useStore} from 'vuex'
	export default {
		setup(){
			const store=useStore()
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let height_each=ref(uni.getSystemInfoSync().statusBarHeight*2)
			
			function exitLogin(){
				uni.setStorage({
					key:'user_info',
					data:'',
					success() {
						login_state.state=false
						user_info.name=''
						user_info.portraitUrl="https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132"
						telephone:'无'
						// 清除所有缓存
						uni.clearStorage()
						store.dispatch('setLoginState',0);
					}
				})
			}
			let info=ref(uni.getSystemInfoSync().windowHeight/2);
			let user_info=reactive({
				portraitUrl:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
				name:'',
				telephone:'无'
			})
			let login_state=reactive({state:false})
			function feedback(){
				uni.getStorage({
					key:'user_info'
				,success({user_name}){
					uni.navigateTo({
						url:'/pages/feedback/feedback?user_name='+user_name
					})
				},fail(){
					uni.showToast({
						title:'清先登录',
						icon:'error'
					})
				}})
			}
			function no_develop(){
				uni.showToast({title:"此功能暂时未开放",icon:'none'})
			}
			
			return {head_height_child,feedback,login_state,user_info,height_each,link,exitLogin,info,no_develop}
		},
		components:{
			navigation
		}
	}
</script>

<style lang="less">
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
			margin-top:10px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
</style>
