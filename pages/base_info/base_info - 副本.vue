<template>
	<navigation show_back='true'>基本信息</navigation>
	<inner_page>
		<view class="vessel">
		<qf-image-cropper :width="500" :height="500" :radius="30" :show_crop='show_crop' :style='{display: show_crop?"block":"none"}' @crop="handleCrop" ></qf-image-cropper>
		<view class="container" :style="{height:screen_height+'px'}">
			<view class="base_info">
			<view class="item" :style="{height:item_height*1.5+'px'}">
				<view @click="choosePortrait" :style="{height:item_height+'px',width:item_height+'px',borderRadius:50+'%',overflow:'hidden'}">
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
	import inner_page from '../inner_page/inner_page.vue'
	import {ref,reactive,computed} from 'vue'
	import QfImageCropper from '@/uni_modules/qf-image-cropper/components/qf-image-cropper/qf-image-cropper.vue'
	import navigation from '../navigation/navigation_all.vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,inner_page,QfImageCropper
		},
		mounted() {
			uni.current_this11=this
		},
		setup() {
			let show_crop=reactive({
				show:true
			})
			const store=useStore()
			console.log(store.state);
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
			
			let info=reactive(uni.getSystemInfoSync())
			let head_height=ref(uni.getMenuButtonBoundingClientRect().height+info.statusBarHeight)
			let screen_height=ref(info.screenHeight/1.5)
			let item_height=ref(screen_height.value/4)
			let timer=ref('')
			// 重置数据
			function reset_data(){
				Object.keys(userInfo).forEach(item=>{
					userInfo_[item]=userInfo[item]
				})
			}
			// 提交数据
			function submit_data(){
				// 查看需要修改的地方
				// name,telephone,gender,score
				// 查看要修改的地方
				let atb=['name','gender','telephone']
				atb.forEach(item=>{
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
			
			function choosePortrait(){
					uni.chooseImage({
						count:1,
						success(result){
							// 这里编辑图片
							
							return
							console.log(result,'result');
							uni.showLoading({
								title:'修改中'
							})
							let image_path=result.tempFiles[0].path
							let url='https://www.mynameisczy.asia:5351/upload_avatar'
							uni.uploadFile({
								url:url,
								filePath:image_path,
								name:'avatar',
								formData:{
									openid:uni.current_this11.userInfo.openid
								},
								success(e) {
									uni.hideLoading()
									let data=JSON.parse(e.data)
									if(data.error){
										uni.showToast({
											icon:'error',
											title:'修改失败'
										})
										return
									}
									// uni.current_this11.userInfo.portraitUrl=data.value
									store.state.portraitUrl=data.value
									userInfo_.portraitUrl=data.value
									uni.setStorage({
										key:'user_info',
										data:{
											...uni.current_this11.userInfo
										}
									})
										uni.showToast({
											icon:'success',
											title:'修改成功'
										})									
								},fail(e) {
									uni.hideLoading()
									console.log('fail',e);
								}
							})
						},
						fail(error) {
							uni.showToast({
								icon:'error',
								title:'用户取消',
								duration:1000
							})
							console.log(error);
						}
					})
			}
			return {
				head_height,userInfo_,show_crop,userInfo,info,screen_height,reset_data,item_height,choosePortrait,radioChange,submit_data
			}
		},
		methods: {
		handleCrop(e) {
			console.log(e,'e');
			// 保存到相册
			uni.saveImageToPhotosAlbum({
				filePath: e.tempFilePath
			})
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