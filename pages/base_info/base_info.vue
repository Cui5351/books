<template>
	<navigation show_back='true'>基本信息</navigation>
	<inner_page>
		<view class="vessel">
		<view class="container" :style="{height:screen_height+'px'}">
			<view class="base_info">
			<view class="item" :style="{height:item_height*1.5+'px'}">
				<view @click="show_corp_fun" :style="{height:item_height+'px',width:item_height+'px',borderRadius:50+'%',overflow:'hidden'}">
					<image :src="userInfo_.portraitUrl" style="width: 100%;height: 100%;overflow: hidden;"></image>
				</view>
			</view>
			<view class="item">
				<view>姓名</view>
				<input type="text" class='user_name' v-model='userInfo_.name' placeholder="name" />
			</view>
			<view class="item">
				<view>性别</view>
					<view style="display:flex">
						<radio-group @change="radioChange">
						<label class="radio"><radio color="rgb(79,70,229)" value="男" :checked="userInfo_.gender=='男'" />男</label>&emsp;
						<label class="radio"><radio color="rgb(79,70,229)" value="女" :checked="userInfo_.gender=='女'"/>女</label>
						</radio-group>
					</view>
				<!-- <view>{{userInfo.gender}}</view> -->
			</view>
			</view>
			<view class="butt">
			<view class="item" style="border: none;">
				<view>
					<view class="btn" @click="reset_data">
						重置
					</view>
				</view>
				<view>
					<view class="btn" @click="submit_data">
						提交
					</view>
				</view>
				<!-- <view>{{userInfo.gender}}</view> -->
			</view>
		</view>
		</view>
	</view>
	</inner_page>
</template>

<script>
	import {ref,reactive,computed} from 'vue'
	import inner_page from '../inner_page/inner_page.vue'
	import navigation from '../navigation/navigation_all.vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,inner_page
		},
		mounted() {
			uni.current_this11=this
		},
		setup() {
			const store=useStore()
			let userInfo=reactive({
				portraitUrl:computed(()=>store.getters.user_avatar),
				name:computed(()=>store.getters.user_name),
				telephone:'无',
				openid:computed(()=>store.getters.user_openid),
				gender:computed(()=>store.getters.user_gender),
				score:computed(()=>store.getters.user_score)
			})
			let userInfo_=reactive({
				...userInfo
			})
			userInfo_.portraitUrl=computed(()=>store.getters.user_avatar)
			
			let info=reactive(uni.getSystemInfoSync())
			let head_height=ref(uni.getMenuButtonBoundingClientRect().height+info.statusBarHeight)
			let screen_height=ref(info.screenHeight/1.5)
			let item_height=ref(screen_height.value/4)
			let timer=ref('')
			// 重置数据
			function reset_data(){
				Object.keys(userInfo).forEach(item=>{
					if(item=='portraitUrl')
						return
					userInfo_[item]=userInfo[item]
				})
			}
			function show_corp_fun(){
				uni.navigateTo({
					url:'/pages/base_info/avatar_edit/avatar_edit?userInfo='+JSON.stringify(userInfo)
				})
			}
			// 提交数据
			function submit_data(){
				// 查看需要修改的地方
				// name,telephone,gender,score
				// 查看要修改的地方
				let atb=['name','gender','telephone']
				atb.forEach(item=>{
					if(item=='portraitUrl')
						return
					if(userInfo[item]!=userInfo_[item])
						console.log(item);
						// 请求修改
					// userInfo_[item]=userInfo[item]
				})
				// userInfo_
				
				uni.showToast({
					icon:'success',
					title:'修改成功'
				})
			}
			function radioChange(e){
				userInfo_.gender=e.detail.value
			}
			
			
			return {
				head_height,show_corp_fun,userInfo_,userInfo,info,screen_height,reset_data,item_height,radioChange,submit_data
			}
		}
	}
</script>

<style lang="less" scoped>
@import url('@/general.less');
.vessel{
	padding:0 20px;
	box-sizing: border-box;
}
.container{
	background-color: white;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	.item{
		width:100%;
		border-bottom: 1px solid rgba(0,0,0,.1);
		height: 50px;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}
}
.user_name{
	outline:none;
	border:none;
	width:80px;
	padding:0 10x;
}
</style>