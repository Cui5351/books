<template>
	<navigation show_back='true'>书友会</navigation>
	<inner_page>
		<view class="sendMessage" :style="{left:state?'0%':'100%'}">
			<image  @click="show_" src="https://www.mynameisczy.asia/rabbit/arrow_top.svg"></image>
			<view class="text_btn">
				<input type="text" maxlength="30" v-model="msg_data">
				<view class="btn2" @click="sendData">
					发送
				</view>
			</view>
		</view>
			<scroll-view class="vessel" scroll-y="true">
				<view>
					<view :class="item.openid==store.getters.user_openid?'user_my':'user'" v-for="(item,index) in message" :key="index">
						<view class="name">
							{{item.name}}
						</view>
						<view class="name_avatar">
							<view class="avatar">
								<image :src="item.avatar" style="width: 100%;height:100%;" mode=""></image>
							</view>
						<view class="answer">
							{{item.data}}
						</view>
					</view>
				</view>
				</view>
			</scroll-view>
	</inner_page>
</template>

<script>
	
	// 主线任务
		// 用户进入聊天室会触发特殊
		// 用户退出聊天室，也会触发
		// 聊天室会显示当前人数
		
	// 支线任务
		// 能够发送表情包
	
	import navigation from '../navigation/navigation_all.vue'
	import inner_page from '../inner_page/inner_page.vue'
	import {useStore} from 'vuex'
	import {reactive,ref} from 'vue'
	export default {
		components:{
			navigation,inner_page
		},
		onLoad() {
		let arr=[{
			name:'温润如玉',
			avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epgNhOz7DwBYwpricCqW8NSnRpcpbqocxkwF6thTJm9UGkialcV013Q4eP1LVZZRPCxIb9wLDSIGFibg/132',
			data:'新年快乐',
			openid:'klfeasnkmfawe'
		},{
			name:'伍',
			avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epgNhOz7DwBYwpricCqW8NSnRpcpbqocxkwF6thTJm9UGkialcV013Q4eP1LVZZRPCxIb9wLDSIGFibg/132',
			data:'大吉大利',
			openid:'klfeas还能nkmfawe'
		},{
			name:'Y屹舟',
			avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/BiblaKjthHdx8AKa7mlibHdx5Gt9K1VicY5E8EcImsKYCibIxfMxAvbJw88t47NgFelwssc7ZlLrMrmyOV8HaNibXHw/132',
			data:'心想事成',
			openid:'klfeas还能nkmfawe'
		},{
			name:'Y淡妄.',
			avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/J8LLyCFGc3tibRKycIxgepQtVw2hDyq1zUqoubVFQaHPDfs0SW5ALaM5Mq6ViaD6Eu2BG9iaEJhVmibLLYhNecCcaA/132',
			data:'天天开心',
			openid:'klfeas还能nkmfawe'
		}]
			let count=0
			let timer=setInterval(function(){
				uni.current_this15.message.push(arr[count])
				if(count>2)
					clearInterval(timer)
				count++;
			},4000)
			// 连接socket
			uni.connectSocket({url:'wss://www.mynameisczy.asia:5000/user_chat',fail(e) {
				console.log('fail',e);	
			},success(e) {
				console.log('success',e);
			}})
			uni.current_this15=this
		// 打开连接
			uni.onSocketOpen(function(res){
			uni.showLoading({
				title:'进入中'
			})	
			// state
				// 进入聊天为1
				// 发送消息为2
				uni.sendSocketMessage({
					data:JSON.stringify({
						name:uni.current_this15.store.getters.user_name,
						avatar:uni.current_this15.store.getters.user_avatar,
						openid:uni.current_this15.store.getters.user_openid,
						state:1,
						data:''
					}),
					success(){
						uni.hideLoading()
						uni.showToast({
							icon:'success',
							title:'进入书友会'
						})
				},fail(){
						uni.hideLoading()
						uni.showToast({
							icon:'error',
							title:'网络连接失败'
						})
				}})
			})
			// 接收消息
			uni.onSocketMessage(function(res) {
				console.log(res.data)
				let data=JSON.parse(res.data)
				if(data.state==1){
					uni.showToast({
						title:data.name+'进入'
					})
					return
				}
				uni.current_this15.message.push({
					name:data.name,
					avatar:data.avatar,
					data:data.data,
					openid:data.openid
				})
            });			
		},
		setup(){
			const store=reactive(useStore())
			let state=ref(false)
			let msg_data=ref('')
			function sendData(){
				console.log(JSON.stringify({
						name:store.getters.user_name,
						avatar:store.getters.user_avatar,
						openid:store.getters.user_openid,
						state:2,
						data:msg_data.value}));
				if(msg_data.length<=0)
					return
				uni.sendSocketMessage({
					data:JSON.stringify({
						name:store.getters.user_name,
						avatar:store.getters.user_avatar,
						openid:store.getters.user_openid,
						state:2,
						data:msg_data.value}),
					success() {
						uni.current_this15.msg_data=''
					},fail() {
						uni.showToast({
							title:'请先检查网络',
							icon:'error'
						})
					}
					})
			}
			let message=reactive([{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/1BoHFIQLgF9Mib2KSAIc1qSSKtkf8W3UIFeM40oHQs4caFHaxlOgb6yia8sujw5icFrcsxxjOUFf9EI8ErkhD23bg/132',
				name:'口古口',
				data:'我是口古口',
				openid:'fjlkawejflka'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/1BoHFIQLgF9Mib2KSAIc1qSSKtkf8W3UIFeM40oHQs4caFHaxlOgb6yia8sujw5icFrcsxxjOUFf9EI8ErkhD23bg/132',
				name:'Yzz',
				data:'我是Yzz',
				openid:'fjlkawejflka'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/jS4DD0hyIwmVFiaBT4sVJWAX9IqaS18CC9EzLRiaPiaxNQoojIZ0VJiaYIdPicQIfQN7RCSZ6EmepeWSROIhicrk6ibsg/132',
				name:'米兰的小铁匠',
				data:'我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠',
				openid:'fjlkawejflka'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/jS4DD0hyIwmVFiaBT4sVJWAX9IqaS18CC9EzLRiaPiaxNQoojIZ0VJiaYIdPicQIfQN7RCSZ6EmepeWSROIhicrk6ibsg/132',
				name:'米兰的小铁匠',
				data:'我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠',
				openid:'fjlkawejflka'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJVT9icvU8zIVDn8G0AQUYVzry1qdYYVKCxyzICiacqBALErYuMk256kCeNibuqo7qkeKIq1ickKWuqBA/132',
				name:'多肉',
				data:'我是多肉',
				openid:'fjlkawejflka'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/jS4DD0hyIwmVFiaBT4sVJWAX9IqaS18CC9EzLRiaPiaxNQoojIZ0VJiaYIdPicQIfQN7RCSZ6EmepeWSROIhicrk6ibsg/132',
				name:'米兰的小铁匠',
				data:'我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠',
				openid:'fjlkawejflka'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/jS4DD0hyIwmVFiaBT4sVJWAX9IqaS18CC9EzLRiaPiaxNQoojIZ0VJiaYIdPicQIfQN7RCSZ6EmepeWSROIhicrk6ibsg/132',
				name:'米兰的小铁匠',
				data:'我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠',
				openid:'fjlkawejflka'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/jS4DD0hyIwmVFiaBT4sVJWAX9IqaS18CC9EzLRiaPiaxNQoojIZ0VJiaYIdPicQIfQN7RCSZ6EmepeWSROIhicrk6ibsg/132',
				name:'米兰的小铁匠',
				data:'我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠我是米兰的小铁匠',
				openid:'fjlkawejflka'
			}])
			function show_(){
				state.value=!state.value
				console.log(state.value);
			}
			return {message,state,show_,store,sendData,msg_data}
		},
		methods: {
			
		}
	}
</script>

<style lang="less" scoped>
	@import url('@/general.less');
.vessel{
	background-color: rgb(245,245,245);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding: 10px 0;
	box-sizing: border-box;
	height:100%;
	&>scroll-view{
		flex-grow: 1;
	}
	&>view{
		height:70px;
		background-color: green;
	}
}
.user_my{
	height:120px;
	display:flex;
	padding:0 10px ;
	box-sizing: border-box;
	flex-direction: column;
	&>view{
			flex-grow: 1;
		}
		.name_avatar{
			display:flex;
			align-items: center;
			flex-direction: row-reverse;
			max-height:80px;
			height:80px;
		}
		.name{
			display: flex;
			align-items: flex-end;
			justify-content: flex-end;
			padding:0 10px;
			box-sizing: border-box;
			text-align: start;
		}
		.avatar{
			margin-left:10px;
			min-width:60px;
			min-height:60px;
			max-width: 60px;
			width:60px;
			height:60px;
			max-height: 60px;
			border-radius: 50%;
			overflow: hidden;
		}
		.answer{
			border-radius: 8px;
			padding:8px 10px;
			background-color: rgb(149,236,105);
			font-size: 18px;
			box-sizing: border-box;
		}
}
.user{
	height:120px;
	display:flex;
	padding:0 10px ;
	box-sizing: border-box;
	flex-direction: column;
	&>view{
		flex-grow: 1;
	}
	.name_avatar{
		display:flex;
		align-items: center;
		max-height:80px;
		height:80px;
	}
	.name{
		display: flex;
		align-items: flex-end;
		padding:0 10px;
		box-sizing: border-box;
		text-align: start;
	}
	.avatar{
		margin-right:10px;
		min-width:60px;
		min-height:60px;
		max-width: 60px;
		width:60px;
		height:60px;
		max-height: 60px;
		border-radius: 50%;
		overflow: hidden;
	}
	.answer{
		border-radius: 8px;
		padding:8px 10px;
		background-color: white;
		font-size: 18px;
		box-sizing: border-box;
	}
}
.user2{
	
}
.sendMessage{
	position: absolute;
	z-index:10000;
	display: flex;
	top:50%;
	height:130px;
	width:100%;
	left:100%;
	transition:0.3s ease;
	align-items: center;
	&>.text_btn{
		height:50px;
		flex-grow: 1;
		display: flex;
		align-items: center;
		&>input{
			align-items: center;
			display: flex;
			background-color:white;
			margin-right:10px;
			height:50px;
			border-radius: 10px;
			padding:0 10px;
			box-sizing: border-box;
			font-size:19px;
			border: 3px solid rgb(79,70,229);
		}
	}
	&>image{
		
		margin-right:10px;
		
		flex-grow: 1;
		width:70px;
		min-width:70px;
		max-width:70px;
		height:130px;
		max-height:130px;
		min-height: 130px;
		transform:rotate(90deg)
	}
}
</style>
