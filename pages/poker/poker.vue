<template>
	<navigation show_back='true'>斗地主</navigation>
	<page>
		<view class="invitation">
			<view class="title">
				斗地主
			</view>
			<view class="users">
				<view class="user" v-for="(item,index) in users" :key="index">
					<view class="avatar">
						<image :src="item.avatar"></image>
					</view>
					<view class="name">
						{{item.name}}
					</view>
				</view>
			</view>
			<view class="btns">
				<view class="btn2">
					邀请好友
				</view>
				<view class="btn" @click="rand_persons">
					{{solo_state?'匹配队友':'匹配中:'+time}}
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	import page from '../inner_page/inner_page.vue'
	import navigation from '../navigation/navigation_all.vue'
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,page
		},
		onLoad() {
			uni.current_this18=this
			const store=useStore()
			// 连接socket
			uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.asia:7086/poker?openid=${store.getters.user_openid}&&user_name=${store.getters.user_name}哈哈&&user_avatar=${store.getters.user_avatar}`),
			success() {
				console.log('连接成功');
			},fail() {
				console.log('连接失败');
			}})
			uni.onSocketMessage(function(res){
				console.log(res,'res');
				let data=JSON.parse(res.data)
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.unshift(...data.current_persons)
					while(uni.current_this18.users.length<3){
						uni.current_this18.users.push({
							avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
							name:''
						})
					}
				
			})
		},
		onUnload() {
			uni.closeSocket()
		},
		setup() {
			let solo_state=ref(true)
			let time=ref(0)
			const store=useStore()
			let users=reactive([{
				avatar:store.getters.user_avatar,
				name:store.getters.user_name
			},{
				avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
				name:''
			},{
				avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
				name:''
			}])
			let timer
			function rand_persons(){
				solo_state.value=!solo_state.value
				if(solo_state.value){
					time.value=0
					clearInterval(timer)
				}
				timer=setInterval(function(){
					time.value++
				// 匹配人
				console.log('随机匹配~');
				// 多人匹配：3
				// 单人匹配：2
				uni.sendSocketMessage({
					data:JSON.stringify({
						openid:store.getters.user_openid,
						user_name:store.getters.user_name,
						avatar:store.getters.user_avatar,
						state:2
					})
				})
				// 将信息发送
			},1000)
			}
			return{users,rand_persons,solo_state,time}
		}
	}
</script>

<style lang="less">
	@import url('@/general.less');
.invitation{
	position: absolute;
	display: flex;
	flex-direction: column;
	top:50%;
	transform: translateY(-70%);
	height:300px;
	width:100%;
	border:10px solid orangered;
	box-sizing: border-box;
	&>.users{
		justify-content: space-around;
		&>.user{
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			box-sizing: border-box;
			&>.name{
				height:20px;
			}
			&>.avatar{
				margin-bottom:10px;
				width:80px;
				height:80px;
				&>image{
					border-radius:50%;
					width:100%;height:100%;
				}
			}
		}
	}
	&>.title{
		font-size:30px;
	}
	&>.btns{
		justify-content: space-around;
		&>view{
			width:100px;
		}
	}
	&>view{
		flex-grow: 1;
		justify-content: center;
		display: flex;
		align-items: center;
	}
}
</style>
