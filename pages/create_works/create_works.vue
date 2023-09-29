<template>
	<tow_span title1='我要创作' title2='我的作品' :works='works'>
			<template  v-slot:title1  style="text-align: center;margin-top:100px;color: gray;height:100%;width:100%;position: relative;">
					<image src="https://www.mynameisczy.cn/play_loop/暂无活动.svg" style="position: absolute;top:0;height: 100%;width: 100%;" mode="scaleToFilll"></image>
			</template>
		<template  v-slot:title2  style="text-align: center;margin-top:100px;color: gray;height:100%;width:100%;position: relative;">
				<image src="https://www.mynameisczy.cn/play_loop/暂无活动.svg" style="position: absolute;top:0;height: 100%;width: 100%;" mode="scaleToFilll"></image>
		</template>
	</tow_span>
</template>

<script>
	import {reactive} from 'vue'
	import tow_span from '../../components/create_work/two_span.vue'
	export default {
		mounted() {
			//get the user works
		},
		components:{tow_span},
		setup(){
			let works=reactive([])
			return {works}
		}
	}
</script>

<style lang="less">

</style>
