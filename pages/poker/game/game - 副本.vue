<template>
	<navigation show_back='1'>进入阶段</navigation>
	<page>
		<view class="container">
			<view class="users">
				<view class="user" v-for="(item,index) in users" :key="index">
					<view class="avatar" :style="{border:'7px solid '+((item.pre_master||current_player_openid==item.openid)?'red':'white')}">
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
			<view class="menu" v-if="rule.pre_master_count>=0">
				<view class="btn2" @click="get_master" v-show='rule.pre_master&&!rule.master&&!rule.cancel_master'>
					{{rule.total_count?'抢地主':'叫地主'}}
				</view>
				<view class="btn" v-show='rule.pre_master_count<=0&&rule.pre_master&&!rule.cancel_master' @click="cancel_master">
					不叫
				</view>
				<view class="btn2" v-show="rule.openid==current_player_openid" @click="out_cards">
					出牌
				</view>
			</view>
			<view class="cards">
				<view class="card" v-for="(item,index) in user_cards" :key="index">
					{{item}}
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	import page from '../../inner_page/inner_page.vue'
	import navigation from '../../navigation/navigation_all.vue'
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,page
		},
		onUnload() {
			this.audio.stop()
		},
		onLoad(res) {
			
			uni.current_this19=this
			uni.onSocketMessage(function(res){
				let data=JSON.parse(res.data)
				console.log(data,'game data');
				if(data.state==6){
					// 拿到刚刚抢地主的openid
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.current_player_openid){
							uni.showToast({
								title:`${item.name}抢地主了`
							})			
						}
					})
					
					data.users_info.forEach(item=>{
						uni.current_this19.users.forEach(item2=>{
							if(item.openid==item2.openid){
								Object.keys(item).forEach(key=>{
									item2[key]=item[key]
									// uni.current_this19.rule[key]=item[key]
								})
							}
						})
						if(item.openid==uni.current_this19.rule.openid){
							Object.keys(item).forEach(key=>{
								uni.current_this19.rule[key]=item[key]
							})
						}
					})
					
						
				}else if(data.state==2){
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					data.current_persons.forEach(item=>{
						if(item.openid.length>=1)
							uni.current_this18.users.push(item)
					})
					if(data.hasOwnProperty('room_id'))
						uni.current_this18.room_id=data.room_id
					if(data.hasOwnProperty('lost')){
						if(data.lost){
							uni.showToast({
								title:'有人离开了',
								icon:'none'
							})
						}
					}
						
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
							name:'邀请好友'
						})
					}
					uni.current_this18.count=data.current_persons.length
					if(data.current_persons.length<=1){
						uni.current_this18.users[0].ready=true
						uni.current_this18.time=0
						uni.current_this18.solo_state=true
						uni.current_this18.room_state=true
						uni.current_this18.user_state=true
						uni.current_this18.room_id=-1
					}
				}else if(data.state==7){
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.current_player_openid){
							uni.showToast({
								title:`${item.name}放弃地主了`
							})		
						}
					})
					
					data.users_info.forEach(item=>{
						uni.current_this19.users.forEach(item2=>{
							if(item.openid==item2.openid){
								Object.keys(item).forEach(key=>{
									item2[key]=item[key]
								})
							}
						})
						if(item.openid==uni.current_this19.rule.openid){
							Object.keys(item).forEach(key=>{
								uni.current_this19.rule[key]=item[key]
							})
						}
					})
				}else if(data.state==8){
					// 游戏结束
					uni.showToast({
						icon:'none',
						title:'因为所有人都没有抢地主,游戏结束'
					})
					setTimeout(()=>{
						uni.navigateBack()
					},1000)
				}else if(data.state==9){
					// 地主产生，地主牌公布
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.master_openid){
							uni.showToast({
								title:`地主是${item.name}`,
								icon:'none'
							})
						}
					})
					uni.current_this19.rule.pre_master=false
					if(uni.current_this19.rule.openid==data.master_openid){
						// 地主牌给他/她
						uni.current_this19.user_cards.push(...data.master_cards)
					}
					// 权限赋值
					uni.current_this19.current_player_openid=data.current_player_openid
				}
			})
			let cards=JSON.parse(res.cards)
			
			console.log(JSON.parse(res.users));
			// 将原用户信息推入
			this.users.push(...JSON.parse(res.users))
			
			console.log(this.users,'users');
			
			this.rule.room_id=Number(res.room_id)
			
			Object.keys(this.rule).forEach(item=>{
				if(item=='room_id'||item=='openid')
					return
				this.rule[item]=cards[item]
			})
			console.log(this.rule,'rule');
			cards.cards.forEach(item=>{
				setTimeout(()=>{
					this.user_cards.push(item)
				},300)
			})
			
			
			// 音乐
			this.audio=uni.createInnerAudioContext()
			this.audio.src="https://www.mynameisczy.asia/audio/poker.mp3"
			this.audio.autoplay=true
			this.audio.loop=true
			this.audio.obeyMuteSwitch=true
			// this.audio.play()
			this.audio.title="斗地主来自QQ音乐"
			this.audio.onError(err=>{
				console.log(err,'audio err');
			})
		},
		setup() {
			let store=reactive(useStore())
			let user_cards=reactive([])
			let current_player_openid=ref('')
			let users=reactive([])
			let users_info=reactive([])
			let audio=reactive(null)
			// 默认属性
			let rule=reactive({
					room_id:-1,
				    count:17,
					pre_master:false,
					pre_master_count:0,
					openid:store.getters.user_openid,
					master:false,
					cancel_master:false
			})
			function get_master(){
				uni.sendSocketMessage({
					data:JSON.stringify({
						state:5,
						rule:rule
					})
				})
			}
			
		// 放弃抢地主
		function cancel_master(){
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:6,
					rule:rule
				})
			})
		}
		function out_cards(){
			uni.showToast({
				title:'出牌'
			})
		}
			// 地主产生后，将所有pre.master=false
			return {out_cards,user_cards,audio,current_player_openid,rule,get_master,store,users_info,users,cancel_master}
		}
	}
</script>

<style lang="less">
@import url('@/general.less');
.container{
	height:100%;
	width:100%;
&>.users{
		margin:20px 0;
		justify-content: space-around;
		display: flex;
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
				border:7px solid white;
				border-radius: 50%;
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
	&>.menu{
		height:10%;
		display: flex;
		justify-content: space-around;
	}
	&>.cards{
		width:100%;
		height:40%;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		background-color: black;
		grid-gap: 10px;
		&>.card{
			border: 5px solid red;
			box-sizing: border-box;
			display: flex;
			background-color: white;
			font-size:30px;
			border-radius: 10px;
			justify-content:center;
			padding:20px 0 0 0;
		}
	}
}
</style>
