<template>
	<navigation show_back='true'>斗地主</navigation>
	<page>
		<view class="container">
		<image src="https://www.mynameisczy.asia/rabbit/back.jpg" style="position: absolute;top:0;height: 100%;width: 100%;opacity:0.8;" mode=""></image>
		<view class="invitation">
			<view class="title">
				我的队伍
			</view>
			<view class="users">
				<view class="user" v-for="(item,index) in users" :key="index">
					<view class="avatar" @click="invation(item)">
						<image :src="item.avatar"></image>
						<view class="ready" :style="{backgroundColor:item.ready?'rgb(102,188,39)':'orangered'}">
							{{item.ready?'已准备':'未准备'}}
						</view>
					</view>
					<view class="name">
						{{item.name}}
					</view>
				</view>
			</view>
			<view class="btns">
				<view class="btn2" @click="rand_persons" v-if='room_state'>
					{{solo_state?'匹配队友':'匹配中->'+time}}
				</view>
				<view class="btn" @click="change_user_state" :style="{backgroundColor:user_state?'rgb(79,70,229)':'rgba(255,255,255,0)',color:user_state?'white':'black'}" v-if="!room_state">
					{{user_state?'取消准备':'准备'}}
				</view>
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
			uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.asia:7086/poker?openid=${store.getters.user_openid}&&user_name=${store.getters.user_name}&&user_avatar=${store.getters.user_avatar}`),
			success() {
				console.log('连接成功');
			},fail() {
				console.log('连接失败');
			}})
			uni.onSocketMessage(function(res){
				console.log(res,'res');
				let data=JSON.parse(res.data)
				if(data.state==2){
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.unshift(...data.current_persons)
					uni.current_this18.room_id=data.room_id
					data.current_persons.forEach(item=>{
						if(item.openid==uni.current_this18.store.getters.user_openid){
							// 设置房间权限
							uni.current_this18.room_state=item.privilege
							if(item.privilege==false){
								clearInterval(uni.current_this18.timer)
							}
						}
					})
					while(uni.current_this18.users.length<3){
						uni.current_this18.users.push({
							avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
							name:''
						})
					}
					if(data.current_persons.length<=1){
						uni.current_this18.users[0].ready=true
						uni.current_this18.time=0
						uni.current_this18.solo_state=true
						uni.current_this18.room_state=true
						uni.current_this18.user_state=true
					}
				}else if(data.state==3){
					data.current_persons_ready.forEach(item=>{
						uni.current_this18.users.forEach(item2=>{
							if(item.openid==item2.openid){
								item2.ready=item.ready
								if(item.ready==false){
									uni.current_this18.time=0
									uni.current_this18.solo_state=true
									clearInterval(uni.current_this18.timer)
								}
							}
						})
					})
				}
			})
		},
		onUnload() {
			uni.closeSocket()
			clearInterval(this.timer)
		},
		setup() {
			let room_state=ref(true)
			let room_id=ref(0)
			let user_state=ref(true)
			let solo_state=ref(true)
			let time=ref(0)
			const store=reactive(useStore())
			let users=reactive([{
				avatar:store.getters.user_avatar,
				name:store.getters.user_name,
				openid:store.getters.user_openid,
				ready:true
			},{
				avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
				name:'邀请好友'
			},{
				avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
				name:'邀请好友'
			}])
			let timer=ref(0)
			function rand_persons(){
				for(let i=0;i<users.length;i++){
					if(users[i].ready==false&&users[i].hasOwnProperty('openid')){
						uni.showToast({
							icon:'none',
							title:'有人未准备'
						})
						return
					}
				}
				solo_state.value=!solo_state.value
				if(solo_state.value){
					time.value=0
					clearInterval(timer.value)
					return
				}
				timer.value=setInterval(function(){
					if(solo_state.value){
						time.value=0
						clearInterval(timer.value)
						return
					}
					time.value++
				// 匹配人
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
		function invation(item){
			if(item.hasOwnProperty('openid')){
				if(item.openid.length>=10)
					return
			}
			console.log('邀请好友~');
			uni.showToast({
				title:'发送邀请',
				icon:'success'
			})
		}
		function change_user_state(){
			user_state.value=!user_state.value
			// 取消准备
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:3,
					openid:store.getters.user_openid,
					room_id:room_id.value,
					ready:user_state.value
				})
			})
		}
			return{change_user_state,room_id,store,users,rand_persons,solo_state,time,timer,invation,room_state,user_state}
		}
	}
</script>

<style lang="less">
	@import url('@/general.less');
	.container{
		// background-color: rgba(255,0,0,.3);
		height:100%;
		width: 100%;
	}
.invitation{
	position: absolute;
	display: flex;
	flex-direction: column;
	top:50%;
	transform: translateY(-50%);
	height:300px;
	border-radius: 70px;
	background-color: rgba(255,255,255,.6);
	width:100%;
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
				background-color: rgba(0,0,0,.2);
				padding:5px 10px;
				border-radius: 10px;
				color: white;
				height:20px;
			}
			&>.avatar{
				margin-bottom:10px;
				width:80px;
				height:80px;
				display: flex;
				flex-direction: column;
				position: relative;
				&>image{
					border-radius:50%;
					width:100%;height:100%;
				}
				&>.ready{
					position: absolute;
					top:100%;
					background-color: rgb(102,188,39);
					color:white;
					opacity:0.9;
					box-shadow: 0px 2px 10px -1px gray;
					font-size:13px;
					left:50%;
					width:50%;
					border-radius: 10px;
					transform: translateY(-100%) translateX(-50%);
					padding:5px 10px;
				}
			}
		}
	}
	&>.title{
		font-size:30px;
		color: orange;
		font-weight: bold;
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
