<template>
	<navigation show_back='true'>修改头像</navigation>
	<inner-page>
		<view class="">
			<qf-image-cropper :width="500" :height="500" :radius="30" areaScale='0.5' maxScale='1.5' @crop="handleCrop" ></qf-image-cropper>
		</view>
	</inner-page>
</template>

<script>
import {reactive} from 'vue'
import inner_page from '../../inner_page/inner_page.vue'
import QfImageCropper from '@/uni_modules/qf-image-cropper/components/qf-image-cropper/qf-image-cropper.vue'
import navigation from '../../navigation/navigation_all.vue'
import {useStore} from 'vuex'
	export default {
		components:{
			QfImageCropper,navigation,inner_page
		},
		onLoad(val) {
			this.userInfo=JSON.parse(val.userInfo)
		},
		mounted() {
			uni.current_this13=this
		},
		setup() {
			let store=useStore()
			let userInfo=reactive()
			function choosePortrait(e){
							uni.showLoading({
								title:'修改中'
							})
							let image_path=e.tempFilePath
							let url='https://www.mynameisczy.cn:5000/upload_avatar'
							uni.uploadFile({
								url:url,
								filePath:image_path,
								name:'avatar',
								formData:{
									openid:uni.current_this13.userInfo.openid
								},
								success(e) {
									// 返回
									uni.navigateBack()
									uni.hideLoading()
									let data=JSON.parse(e.data)
									if(data.error){
										uni.showToast({
											icon:'error',
											title:'修改失败'
										})
										return
									}
									store.state.portraitUrl=data.value
									uni.setStorage({
										key:'user_info',
										data:{
											...uni.current_this13.userInfo
										}
									})
										uni.showToast({
											icon:'success',
											title:'修改成功'
										})									
								},fail(e) {
									uni.hideLoading()
								}
							})
			}
			return{choosePortrait,store}
		},
		methods: {
			handleCrop(e) {
				// 保存到相册
				this.choosePortrait(e)
			}
		}
	}
</script>

<style>

</style>
