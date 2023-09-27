<template>
	<tow_span title1='我要创作' title2='我的作品' :works='works'>
		<template  v-slot:title1>
			<view style="text-align: center;margin-top:100px;color: gray;">
				暂未开放
			</view>
		</template>
		<template  v-slot:title2>
			<view style="text-align: center;margin-top:100px;color: gray;">
				暂未开放
			</view>
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
