<template>
	<navigation show_back='true'>书友会({{chat_count}})</navigation>
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
			<scroll-view class="vessel" scroll-y="true" :scroll-top="scrollTop" scroll-with-animation='true'>
				<view>
					<view :class="item.openid==store.getters.user_openid?'user_my':'user'" v-for="(item,index) in before_message" :key="index">
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
					<view class="before_date">
						<view>
							{{before_date}}
						</view>
					</view>
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
		// 用户进入聊天室会触发特殊（完成）
		// 用户退出聊天室，也会触发（完成）
		// 聊天室会显示当前人数（完成）
		
	// 支线任务
		// 能够发送表情包（未）
	
	import navigation from '../navigation/navigation_all.vue'
	import inner_page from '../inner_page/inner_page.vue'
	import {useStore} from 'vuex'
	import {reactive,ref} from 'vue'
	export default {
		components:{
			navigation,inner_page
		},
		onUnload() {
			uni.current_this15.sendData_(3)
		},
		onLoad() {
			// 连接socket
			uni.connectSocket({url:'wss://www.mynameisczy.asia:5000/user_chat',fail(e) {
				console.log('fail',e);	
			},success(e) {
				console.log('success',e);
			}})
			uni.current_this15=this
			
		// 关闭连接
		uni.onSocketError(function(){
			uni.request({
				url:'https://www.mynameisczy.asia:5000/chat_out',
				method:'GET',
				success(res) {
					uni.current_this15.chat_count=res.data.chat_count
					uni.showToast({
						title:'断开连接',
						icon:'error'
					})
			}
			})
		})
		
		// 如果有人信息发生改变，
		// 然后查看当前聊天记录，
		// 如果含有该聊天人发送过消息，就给所有连接上的回复一条消息
		// 消息中带有信息，avatar,name,openid,gender
		// 根据openid来进行匹配然后修改
		
		// 新·支线任务
			// 给性别gender查找两个图标
		
			
		// 打开连接
			uni.onSocketOpen(function(res){
			uni.showLoading({
				title:'进入中'
			})
			// state
				// 进入聊天为1
				// 发送消息为2
				// 退出聊天为3
				// 刚进聊天将历史消息导入为4
				// 有人修改了个人数据，更新聊天记录里的数据（头像） 5
				// 有人修改了个人数据，更新聊天记录里的数据（name，gender） 5
				uni.sendSocketMessage({
					data:JSON.stringify({
						name:uni.current_this15.store.getters.user_name,
						avatar:uni.current_this15.store.getters.user_avatar,
						openid:uni.current_this15.store.getters.user_openid,
						gender:uni.current_this15.store.getters.user_gender,
						state:1,
						data:''
					}),
					success(){
						uni.hideLoading()
						uni.showToast({
							title:'进入书友会'
						})
				},fail(){
						uni.hideLoading()
						uni.showToast({
							title:'网络连接失败'
						})
				}})
			})
			// 接收消息
			uni.onSocketMessage(function(res) {
				let data=JSON.parse(res.data)
				if(data.state==1){
					uni.current_this15.chat_count=data.chat_count
					return
				}
				if(data.state==4){
					let value=JSON.parse(data.value).reverse()
					
					console.log(value,'value176');	
					let chat_date=data.chat_date.match(/(\d){4}-(\d){1,2}-(\d){1,2}T(\d){1,2}:(\d){1,2}:(\d){1,2}/g)[0]
					uni.current_this15.before_date=chat_date
					// 给小时匹配出来，然后+8
					
					console.log(uni.current_this15.before_date);
					uni.current_this15.before_message.push(...value)
					// uni.current_this15
					uni.current_this15.scrollTop=value.length*120
					// 将数据导入
					return
				}
				
				if(data.state==5){
					let {value,openid}=data
					uni.current_this15.before_message.forEach(item=>{
						if(item.openid==openid)
							item.avatar=value
					})
					uni.current_this15.message.forEach(item=>{
						if(item.openid==openid)
							item.avatar=value
					})
					return
				}
				
				uni.current_this15.chat_count=data.chat_count
				if(data.state==3)
					return
				uni.current_this15.message.push({
					name:data.name,
					avatar:data.avatar,
					data:data.data,
					openid:data.openid,
					gender:data.gender
				})
				uni.current_this15.scrollTop+=120
            });	
		},
		setup(){
			const store=reactive(useStore())
			let state=ref(false)
			let msg_data=ref('')
			let before_date=ref('')
			let chat_count=ref(0)
			let scrollTop=ref(0)
			function sendData(){
				// 查看当前聊天状态，是否还能继续发送
				
				uni.request({
					url:'https://www.mynameisczy.asia:5000/chat_state',
					method:'POST',
					data:{
						openid:store.getters.user_openid
					},success(res) {
						console.log(res);
						if(res.data.state==0){
							uni.showToast({
								icon:'error',
								title:'请重新登录'
							})
							return
						}
						// 无法发送数据（禁言状态）
						if(!res.data.value){
							uni.showToast({
								title:'您已被禁言'
							})					
						return
						}
						if(uni.current_this15.msg_data.length<=0){
							uni.showToast({
								title:'输入不能为空哦'
							})							
							return
						}
						uni.current_this15.sendData_(2,uni.current_this15.msg_data)
					},fail() {
						console.log('fail');
					}
				})
			}
			let message=reactive([])
			let before_message=reactive([])
			function show_(){
				state.value=!state.value
				console.log(state.value);
			}
			function sendData_(state,data=''){
				uni.showLoading({
					title:'发送中'
				})
				uni.sendSocketMessage({
					data:JSON.stringify({
						name:uni.current_this15.store.getters.user_name,
						avatar:uni.current_this15.store.getters.user_avatar,
						openid:uni.current_this15.store.getters.user_openid,
						gender:uni.current_this15.store.getters.user_gender,
						state:state,
						data:data}),
					success() {
						uni.current_this15.msg_data=''
					},fail() {
						uni.showToast({
							title:'请先检查网络',
							icon:'error'
						})
					},complete() {
						uni.hideLoading()
						if(state==3){
							// 关闭连接
							uni.closeSocket({
								code:1000
							})
						}
					}
					})
			}
			return {scrollTop,before_date,before_message,message,state,show_,store,sendData,msg_data,sendData_,chat_count}
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
.before_date{
	width:100%;
	display: flex;
	justify-content: center;
	align-items: center;
	&>view{
		padding:5px 5px;
		box-sizing: border-box;
		background-color: rgba(0,0,0,.1);
		border-radius: 10px;
	}
}
</style>
