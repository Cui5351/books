<template>
	<view>
		<navigation_all :show_back='1'>
			小程序反馈
			</navigation_all>
		<view class="container" :style="{marginTop:head_height+'px',height:body_height+'px'}">
			<view class="container2" v-for="(item,index) in person" :key="index" style="max-height:50%;min-height:50%;">
				<view class="title"  style="max-height: 15%;min-height:15%;">
					<view>
						<!-- 这里显示那个变量的length，最大为35个字符 -->
						写给
						<text style="font-weight: bold;">
							{{item.name}}	
						</text>
						({{item.maxL-item.content.length}}字)
					</view>
					<view class="btn2" @click="submit(item)">
						提交
					</view>
				</view>
				<view class="text" style="max-height: 65%;min-height:65%;">
					<textarea style="width:100%;height:100%;" v-model="item.content" :placeholder="'给'+item.name+'个留言吧'" placeholder-style="font-size:16px" maxlength="35"></textarea>
				</view>
				<view style="max-height: 10%;min-height:10%;font-size: 18px;" class="showAnswer" @click="showAnswer(item.name,item.after_answer)">查看回复</view>
			</view>
			<text style="text-align: center;margin-top: 10px;color:gray">小程序作者(**一)——数据来源:(*杰)</text>
		</view>
	</view>
</template>

<script>
	import {ref,reactive,computed} from 'vue'
	import {useStore} from 'vuex'
	import navigation_all from '../navigation/navigation_all.vue'
	export default {
		name:'feedback',
		components:{
			navigation_all
		},
		mounted() {
			this.audio.play()
			// 这里的this是我打算在页面关闭后停止播放，但是页面虽然切换了(Beforedestroy)，但好像不会摧毁
		},
		beforeUnmount() {
			this.audio.stop()
		},
		setup() {
			let store=useStore()
			let audio=reactive(uni.getBackgroundAudioManager())
			audio.src="https://www.mynameisczy.asia/audio/小糊涂.mp3"
			audio.title="《熊出没》小糊涂"
			let head_height=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let body_height=ref(uni.getSystemInfoSync().windowHeight/1.4)
			let person=reactive([{
				name:'author',
				maxL:35,
				content:'',
				type:0,
				after_answer:computed(()=>store.getters.author_answer)
			},{
				name:'小说提供猿',
				maxL:35,
				content:'',	
				type:0,
				after_answer:computed(()=>store.getters.data_provide_answer)
			}])
			function submit(item){
				if(!item.content.length||item.content.length<3){
					uni.showToast({
						icon:'error',
						title:'内容不小于3'
					})
					return
				}
					
				// 拿到用户信息
				let login_state=store.getters.login_state
				if(!login_state){
					uni.showToast({
						icon:'error',
						title:'请重新登录'
					})
					return
				}
						uni.request({
							url:'https://www.mynameisczy.asia:5351/updateFeedback',
							method:'POST',
							data:{
								nickName:store.getters.user_name,
								avatarUrl:store.getters.user_avatar,
								gender:store.getters.user_gender,
								feedback_to:item.name,
								content:item.content,
								openid:store.getters.user_openid
							},
						}).then(e=>{
							uni.showToast({
								icon:'success',
								title:'发送成功~'
							})	
							item.content=''
						}).catch(e=>{
							uni.showToast({
								icon:'error',
								title:'发送失败~'
							})	
						})
					
					return
					
			}
			function showAnswer(name,title){
				uni.showModal({
					title:name,
					content:JSON.parse(title).length?JSON.parse(title)[JSON.parse(title).length-1]:'暂无回复'
				})
			}
			return {
				head_height,body_height,person,submit,audio,showAnswer
			}
		},
		methods: {
			
		}
	}
</script>

<style scoped lang="less">
@import url('@/general.less');
	.container {
		margin-top:0;
		font-size: 14px;
		box-sizing: border-box;
		padding:20px;
		line-height: 24px;
		width:100%;
		display:flex;
		flex-direction: column;
			&>view{
					flex-grow: 1;
					margin-top: 20px;
					background-color: white;
					border-radius: 10px;
			}
			&>.container2{
				&>.showAnswer{
					&:active{
						background-color: rgba(0,0,0,0.1);
					}
				}
				box-sizing: border-box;
				padding:15px;
				display:flex;
				flex-direction: column;
				&>view{
					margin-top:5px;
					margin-bottom:5px;
					flex-grow: 1;
				}
				&>.text{
					box-sizing: border-box;
					padding:10px;
					border: 1px solid rgba(0,0,0,.1);
					&>textarea{
						font-size:18px;	
						letter-spacing:2px;
					}
				}
				&>.title{
					font-size:21px;
					display: flex;
					align-items: center;
					justify-content:space-between;
				// &>.btn{
				// 	&:active{
				// 		color: rgb(26,193,25);
				// 	}
				// 		font-size:18px;
				// 		padding:2px 10px;
				// 		box-sizing: border-box;
				// 		background-color: rgb(26,193,25);
				// 		color:white;
				// 		border-radius: 10px;
				// }
				}
			}
		}
</style>
